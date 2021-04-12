const config = require(process.argv[2]);
const { utils } = require("./utils.js");
const Discord = require("discord.js");
const fetch = require("node-fetch");
const { Sequelize } = require("sequelize");
const { Leo } = require("./Leo.js");
const { Reputation, Score } = require("./database.js");

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: config.database,
	logging: utils.debug
});

const client = new Discord.Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: Discord.Intents.NON_PRIVILEGED
});

async function main() {
	const leo = new Leo(config, sequelize, client);
	await leo.init();
}

main();