import { DjsInteractionHandler } from "./InteractionHandler.js"
import { User, Poll, Option, Choice } from "../database.js";
import columnify from "columnify";
import utils from "../utils.js";

import Sequelize from "sequelize";
const { Op } = Sequelize;

export default class PollManager extends DjsInteractionHandler {
	async init() {
		await super.init();

		await Poll.init(this.sql);
		await Option.init(this.sql);
		await Choice.init(this.sql);
	}

	get commandName() { return "poll"; }
	get componentNames() { return ["vote"]; }

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
					default: true,
					type: 1,
					options
				}
			]
		}

		await this.client.application.commands.create(command, this.config.guild);
	}

	async buildEmbed(pollId) {
		const poll = await Poll.findOne({ where: { id: pollId } });

		const options = await Option.findAll({ where: { poll: pollId } });

		for (let option of options) {
			const choices = await Choice.findAll({where: { option: option.id }});

			const userIds = choices.map(choice => ({ id: choice.userId }));
			const users = await User.findAll({ where: { [Op.or]: [userIds] }});

			choices.forEach(choice => choice.user = users.find(u => u.id = choice.userId).name);

			option.choices = choices;
		}

		const fields = options.map(option => ({
			name: `${option.label.clamp(250, "...")}: ${option.choices.length}`,
			value: option.choices
				.slice(0, 44)
				.map(choice => `<@${choice.userId}>`)
				.join(", ") 
				+ (option.choices.length > 44 ? "..." : "")
		}));

		return {
			color: 0xff6400,
			title: poll.question.clamp(256, "..."),
			fields,
			footer: { text: `${poll.type} poll` },
			timestamp: new Date(Date.now()).toISOString()
		}
	}

	async voteComponent(interaction, data) {
		const username = interaction.user.username;

		const choice = Choice.create({
			poll: data.poll,
			option: data.option || parseInt(data.values[0]),
			userId: interaction.user.id
		});

		let content = await this.buildEmbed(data.poll);

		interaction.update({ embeds: [content] });
	}

	async binaryCommand(interaction, cmdOptions) {
		const question = cmdOptions.get("question").value;

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

		interaction.reply({
			embeds: [await this.buildEmbed(poll.id)],
			components: [
				{
					type: 1,
					components
				}
			]
		});
	}

	async multipleCommand(interaction, cmdOptions) {
		const question = cmdOptions.get("question").value;

		const opts = [];

		for (let i = 1; i <= 5; i++) {
			const option = cmdOptions.get(`option${i}`);
			if (!option?.value) continue;
			opts.push(option.value);
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

		interaction.reply({
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
	}
}