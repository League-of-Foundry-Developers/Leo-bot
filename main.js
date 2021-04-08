const config = require(process.argv[2]);
const Discord = require("discord.js");
const fetch = require("node-fetch");
const { Sequelize } = require("sequelize");

const { Reputation, Score } = require("./database.js");

const sequelize = new Sequelize("sqlite:./leo.db");
const client = new Discord.Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: Discord.Intents.NON_PRIVILEGED
});

const debug = true;

const { Leo } = require("./Leo.js");

async function main() {
	const leo = new Leo(config, sequelize, client);
	await leo.init();
}

main();