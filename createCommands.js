const { mainToken, token, testGuild, darkGuild } = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();

const dev = true;

async function main() {
	await client.login(dev ? token : mainToken);

	await client.api.applications(client.user.id).guilds(dev ? testGuild : darkGuild).commands.post({data: {
		"options": [
			{
				"type": 3,
				"name": "name",
				"description": "The `name` (not title) of the package.",
				"default": false,
				"required": true
			}
		],
		"name": "package",
		"description": "Get information about a Foundry VTT package."
	}});

	await client.api.applications(client.user.id).guilds(dev ? testGuild : darkGuild).commands.post({data: {
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

	await client.api.applications(client.user.id).guilds(dev ? testGuild : darkGuild).commands.post({data: {
		"options": [
			{
				"type": 6,
				"name": "user",
				"description": "Who would you like to give points to?",
				"default": false,
				"required": true
			},
			{
				"type": 4,
				"name": "amount",
				"description": "How many points would you like to give??",
				"default": false,
				"required": false
			},
			{
				"type": 3,
				"name": "reason",
				"description": "Why are you giving them points?",
				"default": false,
				"required": false
			}
		],
		"name": "giverep",
		"description": "Give another user League Points"
	}});

	await client.api.applications(client.user.id).guilds(dev ? testGuild : darkGuild).commands.post({data: {
		"options": [
			{
				"type": 6,
				"name": "user",
				"description": "Who's reputation would you like to check?",
				"default": false,
				"required": true
			}
		],
		"name": "rep",
		"description": "Check how much reputation a user has."
	}});


	process.exit();
}

main();