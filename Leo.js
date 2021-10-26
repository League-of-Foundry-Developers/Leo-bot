import discord, { Options } from "discord.js";
import { User } from "./database.js";
import utils from "./utils.js";
import PackageSearch from "./classes/PackageSearch.js";
import ReputationManager from "./classes/ReputationManager.js";
import Greeter from "./classes/Greeter.js";
import Database from "better-sqlite3";
import PollManager from "./classes/PollManager.js";

const { Client, Message } = discord;

/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("discord.js").MessageReaction} MessageReaction
 * @typedef {import("discord.js").User} DiscordUser
 * @typedef {import("sequelize").Sequelize} Sequelize
 */

/**
 * The League of Extraordinary Foundry VTT Developers Discord Bot
 *
 * @class Leo
 */
export default class Leo {
	/**
	 * Creates an instance of Leo.
	 *
	 * @param {LeoConfig} config - The configuration file data for this instance of Leo
	 * @param {Sequelize} sql    - A reference to the sqlite ORM
	 * @param {Client}    client - A reference to the Discord.js client
	 * @memberof Leo
	 */
	constructor(config, sql, client) {
		/** @type {LeoConfig} */
		this.config = config;
		/** @type {Sequelize} */
		this.sql = sql;
		/** @type {Client} */
		this.client = client;

		this.reputation = new ReputationManager(this);
		this.packages   = new PackageSearch(this);
		this.greeter    = new Greeter(this);
		this.polls 	    = new PollManager(this);
	}
	
	/**
	 * Initialize required members and structures for Leo
	 *
	 * @memberof Leo
	 */
	async init() {
		await this.makeBackup();

		await User.init(this.sql);
		await this.reputation.init();
		await this.packages.init();
		await this.createListeners();
		await this.client.login(this.config.token);

		await this.polls.init();
	}

	/**
	 * Wraps fetching the remaining data for a partial Discord.js structure
	 * in a condition and error handling.
	 *
	 * @param {object} data - Some Discord.js object
	 * @return {boolean}      True if the partial was fetches successfully
	 * @memberof Leo
	 */
	async fetchPartial(data) {
		if (data.partial) {
			try { await data.fetch(); } catch (error) {
				console.error(`Something went wrong when fetching partial ${data.id}: `, error);
				return false;
			}
		}
		return true;
	}

	/**
	 * Fires once when the bot is ready.
	 *
	 * @memberof Leo
	 */
	async onReady() {
		console.log("🦁 Leo ready!");
	}

	/**
	 * Receives message creation events, and delegates handling them.
	 *
	 * Ignores bots.
	 *
	 * Eats errors.
	 *
	 * @param {Message} message
	 * @return {void} 
	 * @memberof Leo
	 */
	async onMessageCreate(message) {
	//	if (message.author.bot) return;
		utils.debug(message);
		
		try {
			await Promise.all([
				this.reputation.handleMessage(message),
				this.greeter.handleMessage(message)
			]);
		} catch (e) { console.error(e); }
	}

	/**
	 * Receives message reaction creation events, and delegates handling them.
	 *
	 * Eats errors.
	 *
	 * @param {MessageReaction} reaction - The reaction that was created
	 * @param {DiscordUser}     user     - The user who reacted
	 * @return {void} 
	 * @memberof Leo
	 */
	async onMessageReactionAdd(reaction, user) {
		if (!await this.fetchPartial(reaction)) return;
		utils.debug(reaction, user);

		try{
			await Promise.all([
				this.reputation.handleReaction(reaction, user)
			]);
		} catch(e) { console.error(e); }
	}

	/**
	 * Delegates /slash command interaction handling.
	 *
	 * @param {Interaction} interaction
	 * @memberof Leo
	 */
	async onInteractionCreate(interaction) {
		utils.debug(interaction);

		try {
			await Promise.all([
				this.reputation.handleInteraction(interaction),
				this.packages.handleInteraction(interaction),
				this.polls.handleInteraction(interaction),
			]);
		} catch (e) { console.error(e); }
	}

	/**
	 * Registers the event handlers for this bot
	 *
	 * @memberof Leo
	 */
	async createListeners() {
		this.client.once("ready", this.onReady.bind(this));
		this.client.on("messageCreate", this.onMessageCreate.bind(this));
		this.client.on("messageReactionAdd", this.onMessageReactionAdd.bind(this));
	//	this.client.on("guildMemberAdd", this.greeter.handleMessage.bind(this.greeter));

		this.client.ws.on('INTERACTION_CREATE', this.onInteractionCreate.bind(this));
		this.client.on("interactionCreate", this.onInteractionCreate.bind(this));
	}

	async updateUser(id, user) {
		if (!user) user = await this.client.users.fetch(id);

		await User.upsert({
			id, name: user.username,
			discriminator: user.discriminator
		});
	}

/*	async fetchUserInfo(id) {
		// Default in case the user is not findable
		let info = {
			id, name: "User-not-found",
			discriminator: "0000", tag: "User-not-found#0000"
		};

		let user, db;
		
		// Check the users cache first
		let cache = this.client.users.cache.get(id);

		if (cache) info = { 
			id, name: cache.username, 
			discriminator: cache.discriminator, tag: cache.tag 
		}
		else {
			// If it's not in the cache, check the database
			db = await User.findOne({ where: { id: id } });
			console.log(db);

			if (db) info = {
				id, name: db.name,
				discriminator: db.discriminator, 
				tag: `${db.name}#${db.discriminator}`
			}
			else {
				// If it's not in the database, fetch it from Discord
				user = await this.client.users.fetch(id);

				if (user) info = {
					id, name: user.username,
					discriminator: user.discriminator, tag: user.tag
				}
			}
		}

		// Update the database, use the cache or user data if it was already loaded
		// Do not await this, it can happen in the background.
		this.updateUserInfo(id, cache || user ? info : null);

		return info;
	}
*/
/*	async updateUserInfo(id, info) {
		// If new data was given, insert it
		if (info) return await User.upsert(info);

		// Otherwise fetch the data
		const user = await this.client.users.fetch(id);

		// If no data was found, stop.
		if (!user) return;

		// Insert the new data
		return await User.upsert({
			id, name: user.username,
			discriminator: user.discriminator
		});
	}
*/
	/**
	 * Sends a response to an interaction.
	 *
	 * Optionally returns the message that was sent in response tot he interaction.
	 *
	 * @param {Interaction}         interaction   - The interaction to respond to
	 * @param {InteractionResponse} data          - The response data
	 * @param {boolean}             awaitResponse - When true, the response message will be fetched and returned
	 * @return {Promise<Message>|Promise<null>}     The message that was sent in response
	 * @memberof Leo
	 */
	async respond(interaction, data, awaitResponse=false, update=false) {
		this.cleanData(data);

		// Send the response
		await this.client.api.interactions(interaction.id, interaction.token)
			.callback.post({ data: { type: update ? 7 : 4, data: data } });

		if (!awaitResponse) return null;

		// Get the channel of the interaction
		let channel = this.client.channels.fetch(interaction.channel_id);

		// Fetch the response message by using PATCH on the special endpoint.
		// This is not the "correct" way to do this, but the API is not mature yet.
		// Nevertheless, this will return the message data.
		let response = this.client.api
			.webhooks(interaction.application_id, interaction.token, "messages", "@original")
			.patch({ data: {} });

		[channel, response] = await Promise.all([channel, response]);

		// Construct a Discord.js Message object around the message data, and return
		return new Message(this.client, response, channel);
	}

	/**
	 * Checks each field in the response, and ensures they do not exceed their maximum length.
	 *
	 * Does not protect against too many embeds, too many fields, or embeds with
	 * greater than 6000 total characters.
	 *
	 * @param {InteractionResponse} data - The response data
	 * @memberof Leo
	 */
	cleanData(data) {
		const contentMax = 2000;
		const titleMax   = 256;  const authorMax  = 256; const descrMax   = 2048;
		const footerMax  = 2048; const nameMax    = 256; const valueMax   = 1024;

		if (data.content?.length > contentMax)
			data.content = data.content.substring(0, contentMax - 3) + "...";

		data.embeds?.forEach(embed => {
			if (embed.title?.length > descrMax)
				embed.title = embed.title.substring(0, titleMax - 3) + "...";

			if (embed.author?.length > descrMax)
				embed.author = embed.author.substring(0, authorMax - 3) + "...";
				
			if (embed.description?.length > descrMax)
				embed.description = embed.description.substring(0, descrMax - 3) + "...";

			if (embed.footer?.length > descrMax)
				embed.footer = embed.footer.substring(0, footerMax - 3) + "...";

			embed.fields?.forEach(field => {
				if (field.name?.length > descrMax)
					field.name = field.name.substring(0, nameMax - 3) + "...";

				if (field.value?.length > descrMax)
					field.value = field.value.substring(0, valueMax - 3) + "...";
			});
		});
	}

	/**
	 * Create a backup of the database.
	 *
	 * @return {void} 
	 * @memberof Leo
	 */
	async makeBackup() {
		if (!this.config.backup) return;

		console.log("Starting Backup...");
		console.time("Backup completed in");
		
		const backupPath = 
			// dir/prefix.date.db
			`${this.config.backup.dir}/${this.config.backup.prefix}.${new Date(Date.now()).toISOString()}.db`;

		const db = new Database(this.config.database);
		
		try {
			const backup = await db.backup(backupPath);
			utils.debug("Backup Created: ", backupPath, backup);
		}
		catch (e) {
			console.error(e);
		}
		finally {
			db.close();
			console.timeEnd("Backup completed in");
		}
	}

	/**
	 * Runs whenever the process exits, closes the database connection
	 * and logs Leo out of Discord (shows him as offline).
	 *
	 * @param {string} signal - The exit signal/code/error
	 * @return {void} 
	 * @memberof Leo
	 */
	handleExit(signal) {
		if (this.exiting) return; // Don't run this more than once
		else this.exiting = true;

		console.log(`\nReceived ${signal}`);
		console.log(`Disconnecting Leo!`);

		this.client.destroy();
		this.sql.close();

		console.log("Bye! 🦁");
		process.exit();
	}
}


/* Leftovers from earlier development not yet re-factored

// A command to make Leo send a message in a certain channel,
// Useless without better permissions system
async function handleSayCommand(interaction) {
	utils.debug(client.channels);
	const channel = interaction.data.options.find(o => o.name == "channel")?.value;
	const message = interaction.data.options.find(o => o.name == "message")?.value;

	utils.debug(`
		Sending message on channel: ${channel}
		> ${message}
	`);

	await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
		type: 4,
		data: {
			content: `Sending message to ${channel}`
		}
	}});

	const ch = await client.channels.fetch(channel);
	ch.send(message);
}*/