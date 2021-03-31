const { mainToken, token, testGuild, darkGuild } = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();

const dev = false;

async function main() {
	await client.login(dev ? token : mainToken);

	client.api.applications(client.user.id).guilds(dev ? testGuild : darkGuild).commands.post({data: {
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
	}})
}

main();