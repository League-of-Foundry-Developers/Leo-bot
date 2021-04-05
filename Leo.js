const fetch = require("node-fetch");
const { ReputationManager } = require("./classes/ReputationManager.js");

/**
 * The League of Extraordinary Foundry VTT Developers Discord Bot
 *
 * @class Leo
 */
class Leo {
	constructor(config, sql, client) {
		this.config = config;
		this.sql = sql;
		this.client = client;

		this.reputation = new ReputationManager(this);
	}

	async init() {
		await this.reputation.init();
		await this.createListeners();
		await this.client.login(this.config.token);
	}

	debug(...args) {
		if (!this.config.debug) return;
		console.debug(...args);
	}

	async fetchPartial(data) {
		if (data.partial) {
			try { await data.fetch(); } catch (error) {
				console.error(`Something went wrong when fetching partial ${data.id}: `, error);
				return false;
			}
		}
		return true;
	}

	async onReady() {
		console.log("Leo ready!");
	}
	async onMessage(message) {
		if (message.author.bot) return;
		this.debug(message);
		
		await Promise.all([
			this.reputation.handleMessage(message)
		]);
	}
	async onMessageReactionAdd(reaction, user) {
		if (!await this.fetchPartial(reaction)) return;

		await Promise.all([
			this.reputation.handleReaction(reaction, user)
		]);
	}
	async onInteractionCreate(interaction) {
		await Promise.all([
			this.reputation.handleInteraction(interaction)
		]);
	}

	async createListeners() {
		this.client.once("ready", this.onReady.bind(this));
		this.client.on("message", this.onMessage.bind(this));
		this.client.on("messageReactionAdd", this.onMessageReactionAdd.bind(this));

		this.client.ws.on('INTERACTION_CREATE', this.onInteractionCreate.bind(this));
	}
}

module.exports.Leo = Leo;