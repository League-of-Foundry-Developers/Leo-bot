const { Reputation, Score } = require("./database.js");
const columnify = require('columnify');

class ReputationManager {
	constructor (bot) {
		this.bot = bot;
	}

	get config() { return this.bot.config; } 
	get client() { return this.bot.client; } 
	get sql()    { return this.bot.sql;    }

	async init() {
		Reputation.init(this.sql);
		Score.init(this.sql);
	}

	async handleReaction(reaction, user) {
		if (reaction._emoji.id != this.config.emotes.plusone.id) return;

		await this.giveRep({
			user: reaction.message.author.id,
			delta: 1,
			reason: "Reaction +1",
			giverId: user.id,
			channelId: reaction.message.channel.id,
			messageId: reaction.message.id
		}, reaction.message.channel);
	}
	async handleMessage() {

	}
	async handleInteraction() {

	}

	async giveRep(data, channel) {
		const delta = await Reputation.create(data);

		const amount = data.delta == 1 
			? `<:${config.emotes.plusone.name}:${config.emotes.plusone.id}>`
			: data.delta;

		const reply = channel ? await channel.send(
			`Gave **${amount}** ${config.points.name} to <@!${data.user}>`
		) : null;

		return [delta, reply];
	}
}

module.exports.ReputationManager = ReputationManager;
