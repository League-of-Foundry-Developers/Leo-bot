import columnify from 'columnify';
import { Reputation, Score } from "../database.js";
import utils from "../utils.js";
import InteractionHandler from './InteractionHandler.js';

/**
 * @typedef {import("../Leo.js").Leo} Leo 
 * 
 * @typedef {import("discord.js").MessageReaction} MessageReaction
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("discord.js").User}    User
 * @typedef {import("discord.js").Channel} Channel
 *
 * @typedef {import("../database.js").ReputationData} ReputationData
 */

/**
 * A class to manage the reputation system.
 *
 * Handles responses to commands and input, giving and taking
 * points, and displaying stats.
 *
 * @class ReputationManager
 */
export default class ReputationManager extends InteractionHandler {
	/** @readonly @override */
	get commandName() { return "rep"; }

	/** @type {object} Message options to disable pings @readonly  */
	get noPing() { return { "allowedMentions": { "parse": [], "repliedUser": false } }; }

	/**
	 * Initialize required members and structures for ReputationManager
	 *
	 * @memberof ReputationManager
	 */
	async init() {
		Reputation.init(this.sql);
		Score.init(this.sql);
	}

	/**
	 * Handle event generated when a user reacts to a message,
	 * if the reaction is the +1 emoji, give the author of the
	 * message a point of rep.
	 *
	 * @param {MessageReaction} reaction - A reaction made on a message
	 * @param {User}            user     - The user that reacted to the message
	 * @return {Reputation|void}           Returns early if any other reaction, or the new Reputation database Model
	 * @memberof ReputationManager
	 */
	async handleReaction(reaction, user) {
		// If it's not the right emote, or it's the message author reacting, return
		if (reaction.emoji.id != this.config.emotes.plusone.id ||
			reaction.message.author.id == user.id) return;

		// If this user already reacted to this message, return
		if(await Reputation.findOne({ where: { 
			messageId: reaction.message.id,
			giverId: user.id
		}})) return;

		return await this.giveRep({
			user: reaction.message.author.id,
			delta: 1,
			reason: "Reaction +1",
			giverId: user.id,
			channelId: reaction.message.channel.id,
			messageId: reaction.message.id
		}, reaction.message.channel);
	}

	/**
	 * Handle the event generated when a user posts a new message.
	 * If the message matches one of the tests, give each user mentioned rep.
	 *
	 * @param {Message} message - The message that was posted and needs checked
	 * @return {void}             Returns early if the message doesn't pass the test
	 * @memberof ReputationManager
	 */
	async handleMessage(message) {
		// Stop if there are no mentions. Test the message for triggers.
		if (!message.mentions.users.size || !this._testMessage(message)) return;

		// Convert users to an array, and remove any mentions that are the author
		const users = [...message.mentions.users.values()]
			.filter(user => user.id != message.author.id);

		// Return if there are no users
		if (!users.length) return;

		// Give the rep, and get the new scores
		const newScores = await Promise.all(users.map(user =>
			this._giveMessageRep(user, message)
		));

		// Construct the response string
		const response = this.buildRepResponse({
			sender: message.author, 
			recipients: users,
			scores: newScores
		});

		// Send the message
		return await message.reply(response, this.noPing);
	}

	/**
	 * Determin if a message contains one of the triggers for giving reputation.
	 *
	 * @param {Message} message - A message to test
	 * @return {boolean}          True if the message contains one of the triggers
	 * @memberof ReputationManager
	 */
	_testMessage(message) {
		return [
			m => /(?<![A-z])thanks?(?![A-z])/gi.test(m.content),               // Contains "thank"
			m => /(?<![A-z])tyvm(?![A-z])/gi.test(m.content),                  // Constains "tyvm"
			m => /(?<![A-z])points? (?:to|for) <@(?![A-z])/gi.test(m.content), // Phrase like "a point to [user]" - think Harry Potter
			m => /:vote:/gi.test(m.content)                                    // The +1 emoji
		].some(test=> test(message));
	}

	/**
	 * Handles giving reputation to a user mentioned in a message.
	 *
	 * @param {User}    user    - The user receiving the reputation
	 * @param {Message} message - The message in which the user is being "thanked" or otherwise awarded rep
	 * @param {boolean} reply   - If true, send the message as a reply to the triggering message
	 * @return {string}           The response message
	 * @memberof ReputationManager
	 */
	async _giveMessageRep(user, message, reply=false) {
		const rep = await this.giveRep({
			user: user.id,
			delta: 1,
			reason: message.content,
			giverId: message.author.id,
			channelId: message.channel.id,
			messageId: message.id
		});

		return await this.getScore(rep.user);
	}

	/**
	 * Handles the `/rep give` command.
	 *
	 * The target user is given the specified number of points, or one.
	 * Then a message is returned to let the user know that their points were changed.
	 *
	 * @param {Interaction}              interaction - Information about the interaction
	 * @param {Array<InteractionOption>} options     - Information about the interaction
	 * @return {InteractionResponse}                   The response object
	 * @memberof ReputationManager
	 */
	async giveCommand(interaction, options) {
		if (!await this.checkPermissions(interaction, options)) return;

		//const user = await this.client.users.fetch(options.user);
		const user = { id: options.user }; 

		const delta = await Reputation.create({
			user: user.id,
			delta: options.amount || 1,
			reason: options.reason || null,
			giverId: interaction.member.user.id,
			channelId: interaction.channel_id,
			messageId: interaction.id
		});

		const score = await Score.findOne({
			where: { user: user.id }
		}) || { score: 0, rank: 0 };

		const message = this.buildRepResponse({
			amount: delta.delta,
			sender: interaction.member.user,
			recipients: [user],
			scores: [score],
			giveReason: delta.reason
		})

		const response = await this.bot.respond(interaction, {
			content: message,
			allowed_mentions: { "users": [user.id] }
		});

		utils.debug(message);
		return response;
	}

	/**
	 * Checks the action being taken against a set of permissions
	 * configured in the config.json file.
	 *
	 * @param {Interaction}         interaction - The interaction being verified
	 * @param {InteractionOption[]} options     - The associated parameters
	 * @return {boolean}                          True if the user has permission to proceed 
	 * @memberof ReputationManager
	 */
	async checkPermissions(interaction, options) {
		const roles  = interaction.member.roles;
		const perms  = this.config.permissions;
		const points = this.config.points.name;

		let failed = "";

		// No restrictions
		if (roles.includes(perms.giveUnlimited)) return true;

		// May not give to self
		if (interaction.member.user.id == options.user)
			failed = `You may not give yourself ${points}.`;

		// May not exceed limit
		if (options.amount > perms.giveManyLimit || 
			options.amount < -perms.giveManyLimit)
			failed = `You may not give more than ${perms.giveManyLimit} ${points}.`;

		// May not exceed one
		if (!roles.includes(perms.giveMany) &&
			options.amount > 1)
			failed = `You may not give multiple ${points} at once.`;
		
		// May not be negative
		if (!roles.includes(perms.giveNegative) &&
			options.amount < 0)
			failed = `You may not give negative ${points}.`;

		// If the string is still empty, no permissions violations have occured
		if (!failed) return true;

		// Otherwise, respond ephemerally
		await this.bot.respond(interaction, {
			content: failed,
			flags: InteractionHandler.ephemeral
		});

		return false;
	}

	/**
	 * Handles the `/rep check` command.
	 *
	 * Retrieves information about how much reputation a user has, and their current
	 * standings, then sends a response with the relevent information.
	 *
	 * @param {Interaction}              interaction - Information abour the interaction
	 * @param {Array<InteractionOption>} options     - Information abour the interaction
	 * @return {InteractionResponse}                   The response object
	 * @memberof ReputationManager
	 */
	async checkCommand(interaction, options) {
		//const user = await this.client.users.fetch(options.user);
		const user = { id: options.user };

		const score = await Score.findOne({
			where: { user: user.id }
		}) || { score: 0, rank: 0 };

		const message = `<@!${user.id}>: **${score.score}** ${this.config.points.name} (#**${score.rank}**)`;

		const response = await this.bot.respond(interaction, {
			content: message,
			allowed_mentions: { "parse": [] }
		});

		utils.debug(message);
		return response;
	}

	/**
	 * Handles the `/rep scoreboard` command.
	 *
	 * Produces an embed with a scoreboard table, optionally displaying
	 * further pages. 
	 *
	 * @param {Interaction}              interaction - Information abour the interaction
	 * @param {Array<InteractionOption>} options     - Information abour the interaction
	 * @return {InteractionResponse}                   The response object
	 * @memberof ReputationManager
	 */
	async scoreboardCommand(interaction, options) {
		const message = `Reputation Scoreboard:`;
		const scoreboard = await this.getScoreboardPage((options?.page - 1) * 10 || 0);

		const response = await this.bot.respond(interaction, {
			content: message,
			embeds: [scoreboard]
		});

		
		utils.debug(response);
		utils.debug(message);
		utils.debug(scoreboard.description);
		utils.debug(interaction);
		return response;
	}

	/**
	 * Gets the formatted text embed for a particular scoreboard page.
	 *
	 * @param {number} page - The target page of the scoreboard.
	 * @return {object}       The embed data for the scoreboard embed
	 * @memberof ReputationManager
	 */
	async getScoreboardPage(page) {
		const scores = await Score.findAll({
			attributes: ["rank", "score", "user"],
			order: [["rank", "ASC"]],
			offset: page,
			limit: 10, raw: true
		})

		for (let score of scores) {
			let user = await this.client.users.fetch(score.user);
			score.user = `${user?.username}#${user?.discriminator}`;
		}

		return await this.getScoreboardEmbed(scores);
	}

	/**
	 * Formats the data of a scoreboard page into a table,
	 * and returns an object of Discord embed data.
	 *
	 * @param {Array<Score?} scores - A set of scores to produce the table from
	 * @return {object}               The embed data for the scoreboard embed
	 * @memberof ReputationManager
	 */
	getScoreboardEmbed(scores) {
		const board = scores.map((s, i) => ({
			"- Rank -": `#${s.rank}`,
			"- Points -": s.score,
			"- User -": s.user
		}));

		const message = columnify(board, {
			columnSplitter: " | ",
			config: {
				"- Rank -": { align: "center" },
				"- Points -": { align: "right" }
			}
		});	

		return {
			color: 0xff6400,
			title: "Scoreboard",
			description: "```\n" + message + "\n```"
		}
	}

	/**
	 * Give a user reputation based on data.
	 *
	 * @param {ReputationData} data - The data used to add reputation to the database
	 * @return {Reputation}           The newly created Reputation row and new response Meassage
	 * @memberof ReputationManager
	 */
	async giveRep(data) {
		return await Reputation.create(data);
	}

	/**
	 * Constructs a response string for when reputation is given.
	 *
	 * @param {object}       params             - An object of parameters
	 * @param {number}      [params.amount]     - The number of points given (default: 1)
	 * @param {User}        [params.sender]     - The user that gave the reputation
	 * @param {User[]}       params.recipients  - The user(s) that received the reputaion
	 * @param {Channel}     [params.channel]    - The channel in which the reputation was given
	 * @param {Message}     [params.message]    - The message to which the reputation was given
	 * @param {Score[]}     [params.scores]     - The current reputation stats for the recipient(s)
	 * @param {string}      [params.giveReason] - A reason why the giver gave the receiver points
	 * @return {string}                           The message responding to the reputation giving event
	 * @memberof ReputationManager
	 */
	buildRepResponse({ amount=1, sender, recipients, channel, message, scores, giveReason }) {
		const intro     = sender ? `<@!${sender.id}> gave` : "Gave";
		const sign      = amount > 0 ? "+" : "";
		const amnt      = amount == 1 // If the amount of rep given is one, use the +1 emote instead of a number to indicate the amount
							? `<:${this.config.emotes.plusone.name}:${this.config.emotes.plusone.id}>`
							: `${sign}${amount}`;
		const recipient = this.formatRecipients(recipients, scores);
		const reason    = giveReason || "";
		
		return `${intro} **${amnt}** ${this.config.points.name} to ${recipient} ${reason}`;
	}

	/**
	 * Formats the mentions and stats for a list of 
	 * recipients, and an optional list of corresponding scores.
	 *
	 * @param {User[]}    recipients - One or more Users who are receiving points
	 * @param {Scorep[]} [scores]    - The scores of those users after gaining those points
	 * @return {string} 
	 * @memberof ReputationManager
	 */
	formatRecipients(recipients, scores) {
		return recipients.reduce((str, recipient, i) => {
			const and         = i == recipients.length - 1 ? "and " : "";
			const conjunction = i ? (recipients.length == 2 ? ` ${and}` : `, ${and}`) : "";
			const user        = `<@!${recipient.id}>`;
			const stats       = scores ? ` (**#${scores[i].rank}** • ${scores[i].score})` : "";

			return `${str}${conjunction}${user}${stats}`
		}, "")
	}

	/**
	 * Get's the Score of the specified user
	 *
	 * @param {string} userId - The Discord snowflake for the user
	 * @return {Score}          The Score stats for that user
	 * @memberof ReputationManager
	 */
	async getScore(userId) {
		const score = await Score.findOne({
			where: { user: userId }
		});
		return score  || { score: 0, rank: " No points" };
	}
}
