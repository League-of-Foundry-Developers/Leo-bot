import { DjsInteractionHandler } from "./InteractionHandler.js"
import { User, Poll, Option, Choice } from "../database.js";
import columnify from "columnify";
import utils from "../utils.js";

import Sequelize from "sequelize";
const { Op } = Sequelize;

/**
 * Create and manage votes and polls.
 *
 * @class PollManager
 */
export default class PollManager extends DjsInteractionHandler {
	/** @inheritdoc */
	async init() {
		await super.init();

		await Poll.init(this.sql);
		await Option.init(this.sql);
		await Choice.init(this.sql);
	}

	/** @inheritdoc */
	get commandName() { return "poll"; }

	/** @inheritdoc */
	get componentNames() { return ["vote"]; }

	/** @inheritdoc */
	async initCommands() {
		const options = [{
			name: "question",
			description: "The question to ask",
			type: 3,
			required: true
		}];

		for (let i = 1; i <= 20; i++) {
			options.push({
				name: `option${i}`,
				description: `Option ${i}`,
				type: 3,
				required: i < 2
			});
		}

		const command = {
			name: "poll",
			description: "Create a poll",
			options: [
				{
					name: "binary",
					description: "Create a yes/no poll",
					default: true,
					type: 1,
					options: [
						{
							name: "question",
							description: "The question to ask",
							type: 3,
							required: true
						}
					]
				},
				{
					name: "multiple",
					description: "Create a multiple choice poll",
					default: false,
					type: 1,
					options
				},
				{
					name: "close",
					description: "Close the indicated poll.",
					default: false,
					type: 1,
					options: [
						{
							name: "poll",
							description: "The id # of the poll to close",
							type: 3,
							required: true
						}
					]
				}
			]
		}

		await this.client.application.commands.create(command, this.config.guild);
	}

	/** 
	 * Creates the embed that represents the current results of a poll.
	 *
	 * @param {number} pollId    - The ID of the poll to create the embed for.
	 * @return {Promise<Object>}   The embed object.
	 */
	async buildEmbed(pollId) {
		const poll = await Poll.findOne({ where: { id: pollId } });

		const options = await Option.findAll({ where: { poll: pollId } });

		for (let option of options) {
			option.choices = await Choice.findAll({where: { option: option.id }});
		}

		const fields = options.map(option => ({
			name: `${option.label.clamp(250, "...")}: ${option.choices.length}`,
			value: option.choices
				.slice(0, 44)
				.map(choice => `<@${choice.userId}>`)
				.join(", ") 
				+ (option.choices.length > 44 ? "..." : "")
				|| "*No votes*"
		}));

		const votes = options.reduce((votes, option) => votes + option.choices.length, 0);

		return {
			color: 0xff6400,
			title: poll.question.clamp(245, "...") + (poll.closed ? " (closed)" : ""),
			fields,
			description: `Total votes: ${votes}`,
			footer: { text: `${poll.type} poll #${pollId}` },
			timestamp: new Date(Date.now()).toISOString()
		}
	}

	/**
	 * Handles interactions with message components on a poll,
	 * including buttons and selects.
	 *
	 * @param {Interaction} interaction - The interaction to handle.
	 * @param {Object} data               Data stored in the message component.
	 * @memberof PollManager
	 */
	async voteComponent(interaction, data) {
		const userId = interaction.user.id;

		const chosen = await Choice.findOne({ where: { poll: data.poll, userId } });

		if (chosen) await chosen.update({ option: data.option || parseInt(data.values[0]) });
		else await Choice.create({
			poll: data.poll,
			option: data.option || parseInt(data.values[0]),
			userId
		});

		let content = await this.buildEmbed(data.poll);

		await interaction.update({ embeds: [content] });
	}

	/**
	 * Handles the creation of a "binary" yes/no poll.
	 *
	 * @param {CommandInteraction} interaction - The interaction to handle.
	 * @param {*} cmdOptions                   - The interaction options
	 * @memberof PollManager
	 */
	async binaryCommand(interaction, cmdOptions) {
		await interaction.deferReply();

		const question = cmdOptions.find(o => o.name == "question")?.value;

		const poll = await Poll.create({
			question,
			creatorId: interaction.user.id,
			type: "binary"
		});

		const options = await Option.bulkCreate([
			{
				poll: poll.id,
				label: "Yes"
			},
			{
				poll: poll.id,
				label: "No"
			}
		]);

		let components = [];

		for (let option of options) {
			components.push({
				type: 2,
				label: option.label,
				style: option.label == "Yes" ? 3 : 4,
				custom_id: `{"name": "vote", "type": "binary", "option": "${option.id}", "poll": ${poll.id}}`
			});
		}

		await interaction.editReply({
			embeds: [await this.buildEmbed(poll.id)],
			components: [
				{
					type: 1,
					components
				}
			]
		});

		const message = await interaction.fetchReply();
		await poll.update({ messageId: message.id });
	}

	/**
	 * Handles the creation of multiple choice poll.
	 *
	 * @param {CommandInteraction} interaction - The interaction to handle.
	 * @param {*} cmdOptions                   - The interaction options
	 * @memberof PollManager
	 */
	async multipleCommand(interaction, cmdOptions) {
		await interaction.deferReply();

		const question = cmdOptions.find(o => o.name == "question")?.value;

		const opts = [];

		for (let i = 1; i <= 5; i++) {
			const option = cmdOptions.find(o => o.name == `option${i}`);
			if (!option?.value) continue;
			opts.push(option.value.clamp(100, "..."));
		}

		const poll = await Poll.create({
			question,
			creatorId: interaction.user.id,
			type: "multiple"
		});

		const toCreate = opts.map(option => ({ poll: poll.id, label: option }))

		const options = await Option.bulkCreate(toCreate);

		let components = [];

		for (let option of options) {
			components.push({
				label: option.label,
				value: option.id.toString()
			});
		}

		await interaction.editReply({
			embeds: [await this.buildEmbed(poll.id)],
			components: [
				{
					type: 1,
					components: [
						{
							type: 3,
							custom_id: `{"name": "vote", "type": "multiple", "poll": ${poll.id}}`,
							options: components,
							placeholder: "Choose and option",
							min_values: 1,
							max_values: 1
						}
					]
				}
			]
		});

		const message = await interaction.fetchReply();
		await poll.update({ messageId: message.id });
	}

	/**
	 * Close and existing poll.
	 *
	 * @param {CommandInteraction} interaction - The interaction to handle.
	 * @param {*} cmdOptions                   - The interaction options
	 * @returns 
	 */
	async closeCommand(interaction, cmdOptions) {
		const pollId = cmdOptions.find(o => o.name == "poll")?.value;

		const poll = await Poll.findOne({ where: { id: pollId } });

		if (poll.creatorId != interaction.user.id) {
			interaction.reply({ content: "You cannot close this poll.", ephemeral: true });
			return;
		}

		await poll.update({ closed: true });

		const message = await interaction.channel.messages.fetch(poll.messageId);
		await message.edit({ embeds: [await this.buildEmbed(pollId)], components: [] });

		await interaction.reply({ content: "Poll closed.", ephemeral: true });
	}
}