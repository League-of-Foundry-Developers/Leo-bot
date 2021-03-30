const { token, testGuild } = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();

async function main() {
	await client.login(token);

	client.api.applications(client.user.id).guilds(testGuild).commands.post({data: {
		"options": [
			{
			"type": 3,
			"name": "package-name",
			"description": "The `name` (not title) of the package.",
			"default": false,
			"required": true
			}
		],
		"name": "package",
		"description": "Get information about a Foundry VTT package."
	}})
}

main();