import config from "./config.cjs";

import discord from "discord.js";
import seq from 'sequelize';

import utils from "./utils.js";
import Leo from "./Leo.js";

const { Client, Intents } = discord;
const { Sequelize, DataTypes, Model } = seq;


const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: config.database,
	logging: utils.debug
});

const client = new Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: Intents.NON_PRIVILEGED
});

async function main() {
	const leo = new Leo(config, sequelize, client);
	await leo.init();
}

main();