import config from "./config.cjs";

import discord from "discord.js";

const { Client, Intents } = discord;

const client = new Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: Intents.NON_PRIVILEGED
});

async function main() {
	await client.login(config.token);

	await client.api.applications(client.user.id).guilds(config.guild).commands.post({data: {
		"options": [
			{
				"type": 3,
				"name": "name",
				"description": "The `name` (not title) of the package.",
				"required": true
			},
			{
				"type": 3,
				"name": "manifest",
				"description": "The URL of an unlisted manifest JSON file.",
				"required": false
			}
		],
		"name": "package",
		"description": "Get information about a Foundry VTT package."
	}});
	console.log("Created /package");

/*	await client.api.applications(client.user.id).guilds(config.guild).commands.post({data: {
		"options": [
			{
				"type": 7,
				"name": "channel",
				"description": "Which channel would you like Leo to send the message?",
				"default": false,
				"required": true
			},
			{
				"type": 3,
				"name": "message",
				"description": "What message would you like Leo to send?",
				"default": false,
				"required": true
			}
		],
		"name": "say",
		"description": "Have Leo speak for you."
	}});
	console.log("Created /say");*/

	await client.api.applications(client.user.id).guilds(config.guild).commands.post({data: {
		"name": "rep",
		"description": "Manage user reputation.",
		"options": [
			{	
				"name": "check",
				"description": "Check how many reputation a user has.",
				"default": true,
				"type": 1,
				"options": [
					{
						"type": 6,
						"name": "user",
						"description": "Who's reputation would you like to check?",
						"required": true
					}
				],
			},
			{	
				"name": "give",
				"description": "Give another user reputation.",
				"type": 1,
				"options": [
					{
						"type": 6,
						"name": "user",
						"description": "Who would you like to give reputation to?",
						"required": true
					},
					{
						"type": 3,
						"name": "reason",
						"description": `Why are you giving them reputation? Ex "for being so cool"`,
						"required": false
					},
					{
						"type": 4,
						"name": "amount",
						"description": "Moderators only: How much reputation would you like to give?",
						"required": false
					}
				]
			},
			{	
				"name": "scoreboard",
				"description": "Display the reputation scoreboard.",
				"type": 1,
				"options": [
					{
						"type": 4,
						"name": "page",
						"description": "Which page of the scoreboard would you like to access?",
						"required": false
					}
				],
			}
		]
	}});
	console.log("Created /rep");


	process.exit();
}

main();