import config from "./config.cjs";

import discord from "discord.js";
import seq from 'sequelize';

import utils from "./utils.js";
import Leo from "./Leo.js";

const { Client, Intents } = discord;
const { Sequelize, DataTypes, Model } = seq;


/**
 * A string prototype extension that returns a string clamped to a specific length,
 * optionally ending with a specified string such as "..." the suffix will be included
 * within the length limit.
 * 
 * @param {number} max 
 * @param {string} ending 
 * @returns 
 */
String.prototype.clamp = function (max, ending = "") {
	max = max - ending.length;
	let str = this.trimEnd();
	return str.length > max ? str.substr(0, max) + ending : str;
}

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
		intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGE_TYPING"]
	});
	
	const leo = new Leo(config, sequelize, client);

	["exit", "SIGINT", "SIGQUIT", "SIGTERM", "uncaughtException", "unhandledRejection"]
		.forEach(ec => process.on(ec, leo.handleExit.bind(leo)));
	
	// Roar! 🦁
	await leo.init();
}

main();