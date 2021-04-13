/**
 * Call this file like:
 * `node dbLoader.js ./test.config.json ./yag-export.json`
 * Where the first argument is the config file for your Leo,
 * and the second is data exported from YAGPDB.xyz
 */

import config from "./config.cjs";
import * as Database from "./database.js";
import seq from 'sequelize';
import fs from "fs/promises";
import { User } from "discord.js";

const { Sequelize } = seq;

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: config.database
});

async function main() {
	Database.Reputation.init(sequelize);
	Database.User.init(sequelize);

	await Database.Reputation.sync({ alter: true });
	await Database.User.sync({ alter: true });

	const data = JSON.parse(await fs.readFile(process.argv[3]));

	await insertData(data);
}

async function insertData(data) {
	const toInsert = data.map(d => ({
		user: d.receiver_id,
		delta: d.amount,
		reason: "Imported from YAGPDB.xyz",
		giverId: d.sender_id,
		createdAt: d.created_at
	}));

	const users = data
		.filter(d => d.receiver_username)
		.map(d => {
			const [tag, name, disc] = d.receiver_username.match(/(.+)#([0-9]+)/);
			return {
				user: d.receiver_id,
				name: name,
				discriminator: disc
			}
		});

	
	await Database.Reputation.bulkCreate(toInsert);
	
	
	for (let user of users) {
		await Database.User.upsert(user);
	}
	console.log(users);
}

main();