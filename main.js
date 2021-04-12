import config from "./config.cjs";

import discord from "discord.js";
import seq from 'sequelize';

import utils from "./utils.js";
import Leo from "./Leo.js";

const { Client, Intents } = discord;
const { Sequelize, DataTypes, Model } = seq;

/**
 * The primary function that sets everythign into motion.
 * Creates instances of the SQL ORM, and Discord.js client,
 * then creates an instance of Leo with them, and initializes it.
 */
async function main() {
	const sequelize = new Sequelize({
		dialect: "sqlite",        // Leo uses an sqlite database
		storage: config.database, // The .db location is defined in the config.json file
		logging: utils.debug      // Send db query logs through an output wrapper
	});

	const client = new Client({
		partials: ['MESSAGE', 'CHANNEL', 'REACTION'], // Get partial data structures for these
		intents: Intents.NON_PRIVILEGED               // Leo wants to do anything that isn't "privileged"
	});

	// Roar! 🦁
	const leo = new Leo(config, sequelize, client);

	await leo.init();
}

main();