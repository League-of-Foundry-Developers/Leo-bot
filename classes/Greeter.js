import utils from "../utils.js";

/**
 * Controls a greeting system to make new users feel at home.
 *
 * @export
 * @class Greeter
 */
export default class Greeter {
	/**
	 * Creates an instance of Greeter.
	 *
	 * @param {Leo} bot
	 * @memberof Greeter
	 */
	constructor(bot) {
		this.bot = bot;
		this.reaction = this.bot.config.emotes.greeting;
	}

	/**
	 * Handles a message event. If the message is a new member join
	 * begin collecting reactions. After a random time between 30 and 130 seoncs
	 * stop watching and count the reactions. If anyone has used the greeting reaction
	 * do nothing more, if nobody has used it, react with the greeting reaction.
	 *
	 * @param {Message} message
	 * @return {*} 
	 * @memberof Greeter
	 */
	async handleMessage(message) {
		if (message.type != "GUILD_MEMBER_JOIN" || !this.reaction) return;
		
		utils.debug("Member Joined:", message.author.username);

		const reactions = await message.awaitReactions(
			reaction => reaction.emoji.name == this.reaction.name,
			{ time: (Math.random() * 100000) + 30000 }
		)

		utils.debug(reactions);

		if (reactions.size) return;

		return await message.react(this.reaction.id);
	}
}