const { token } = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();

const debug = true;

client.once("ready", () => {
	console.log("Ready!");
});

client.on("message", message => {
	if (debug) console.log(message);
	
	if (message.author.bot) return;
	if (message.content.startsWith("echo ")) 
		message.channel.send(message.content.slice(4));
});

client.login(token);