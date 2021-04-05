const columnify = require('columnify');
const { Reputation, Score } = require("../database.js");

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
 * Hanldes responses to commands and input, giving and taking
 * points, and displaying stats.
 *
 * @class ReputationManager
 */
class ReputationManager {
	/**
	 * Creates an instance of ReputationManager.
	 *
	 * @param {Leo} bot - The instance of Leo to which this manager belongs
	 * @memberof ReputationManager
	 */
	constructor (bot) {
		this.bot = bot;
	}

	get config() { return this.bot.config; } 
	get client() { return this.bot.client; } 
	get sql()    { return this.bot.sql;    }

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
		if (reaction._emoji.id != this.config.emotes.plusone.id) return;

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
		if (!this._testMessage(message)) return;

		let first = true; // For the first user, Leo should reply to the message.
		for (let user of message.mentions.users) {
			await this._giveMessageRep(user[1], message, first);
			first = false;
		}
	}

	/**
	 * Determin if a message contains one of the triggers for giving reputation.
	 *
	 * @param {Message} message - A message to test
	 * @return {boolean}          True if the message contains one of the triggers
	 * @memberof ReputationManager
	 */
	async _testMessage(message) {
		return [
			m => /(?<![A-z])thanks?(?![A-z])/gi.test(m.content),               // Contains "thank"
			m => /(?<![A-z])tyvm(?![A-z])/gi.test(m.content),                  // Constains "tyvm"
			m => /(?<![A-z])points? (?:to|for) <@(?![A-z])/gi.test(m.content), // Phrase like "a point to [user]" - think Harry Potter
			m => /:vote:/gi.test(m.content)                                    // The +1 emoji
		].some(test=> test(message));
	}

	/**
	 * Handles giving reputation to a user mentioned in a message
	 *
	 * @param {User}    user    - The user receiving the reputation
	 * @param {Message} message - The message in which the user is being "thanked" or otherwise awarded rep
	 * @param {boolean} reply   - If true, send the message as a reply to the triggering message
	 * @return {Reputation}       The new database entry Model
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

		const score = await this.getScore(rep.user);

		const response = this.buildRepResponse(rep, {
			sender: message.author,
			receiver: user,
			score: score
		})

		if  (reply) await message.reply(response, this.noPing);
		else await message.channel.send(response, this.noPing);
		console.log(response);

		return rep;
	}

	/**
	 * Handles /slash command interactions for the `/rep` command.
	 * Delegates the interaction to the appropriate subcommand,
	 * a method with the form of subnameCommand(Interaction, subcommandOptions)
	 *
	 * @param {Interaction} interaction - Information abour the interaction
	 * @return {object}                   The response object
	 * @memberof ReputationManager
	 */
	async handleInteraction(interaction) {
		if (interaction.data.name != "rep") return;

		const sub = interaction.data.options.find(o => o.type == 1);
		const handler = `${sub.name}Command`;
		if (this[handler]) return await this[handler](interaction, this.extractOptions(sub));
	}

	/**
	 * Hanldes the `/rep give` command.
	 *
	 * The target user is given the specified number of points, or one.
	 * Then a message is returned to let the user know that their points were changed.
	 *
	 * @param {Interaction}              interaction - Information abour the interaction
	 * @param {Array<InteractionOption>} options     - Information abour the interaction
	 * @return {object}                                The response object
	 * @memberof ReputationManager
	 */
	async giveCommand(interaction, options) {
		const user = await this.client.users.fetch(options.user);

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

		const message = this.buildRepResponse(delta, {
			sender: interaction.member.user,
			receiver: user,
			giveReason: delta.reason
		})

		const response = await this.bot.respond(interaction, {
			content: message,
			allowed_mentions: { "users": [user.id] }
		});

		console.log(message);
		return response;
	}

	/**
	 * Handles the `/rep check` command.
	 *
	 * Retrieves information about how much reputation a user has, and their current
	 * standings, then sends a response with the relevent information.
	 *
	 * @param {Interaction}              interaction - Information abour the interaction
	 * @param {Array<InteractionOption>} options     - Information abour the interaction
	 * @return {object}                                The response object
	 * @memberof ReputationManager
	 */
	async checkCommand(interaction, options) {
		const user = await this.client.users.fetch(options.user);

		const score = await Score.findOne({
			where: { user: user.id }
		}) || { score: 0, rank: 0 };

		const message = `<@!${user.id}>: **${score.score}** ${this.config.points.name} (#**${score.rank}**)`;

		const response = await this.bot.respond(interaction, {
			content: message,
			allowed_mentions: { "parse": [] }
		});

		console.log(message);
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
	 * @return {object}                                The response object
	 * @memberof ReputationManager
	 */
	async scoreboardCommand(interaction, options) {
		const message = `Reputation Scoreboard:`;
		const scoreboard = await this.getScoreboardPage((options?.page - 1) * 10 || 0);

		const response = await this.bot.respond(interaction, {
			content: message,
			embeds: [scoreboard]
		});

		console.log(message);
		console.log(scoreboard.description);
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
	 * Extracts the options from a command into a key:value pair.
	 *
	 * @param {InteractionData|InteractionOption} command - The command data or subcommand to extract options from
	 * @return {Object<string,any>}                         The key:value object of each option and its value 
	 * @memberof ReputationManager
	 */
	extractOptions(command) {
		if (!command.options) return null;
		return command.options.reduce((options, option) => {
			options[option.name] = option.value; 
			return options;
		}, {});
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
	 * @param {Reputation}  reputation
	 * @param {object}      options             - An object of optional parameters
	 * @param {User}       [options.sender]     - The user that gave the reputation
	 * @param {User}       [options.receiver]   - The user that received the reputaion
	 * @param {Channel}    [options.channel]    - The channel in which the reputation was given
	 * @param {Message}    [options.message]    - The message to which the reputation was given
	 * @param {Score}      [options.score]      - The current reputation stats for the receiver
	 * @param {string}     [options.giveReason] - A reason why the giver gave the receiver points
	 * @return {string}                          The message responding to the reputation giving event
	 * @memberof ReputationManager
	 */
	buildRepResponse(reputation, { sender, receiver, channel, message, score, giveReason }={}) {
		const intro = sender ? `<@!${sender.id}> gave` : "Gave";
		const sign = reputation.delta > 0 ? "+" : "";
		const amount = reputation.delta == 1 // If the amount of rep given is one, use the +1 emote instead of a number to indicate the amount
			? `<:${this.config.emotes.plusone.name}:${this.config.emotes.plusone.id}>`
			: `${sign}${reputation.delta}`;
		const recipient = `<@!${reputation.user}>`;
		const stats = score ? ` (current: \`#${score.rank}\` - \`${score.score}\`)` : "";
		const reason = giveReason ? ` Reason: \n> ${giveReason}` : "";
		
		return `${intro} **${amount}** ${this.config.points.name} to ${recipient}.${stats}${reason}`;
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

module.exports.ReputationManager = ReputationManager;
