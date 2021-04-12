/**
 * Call this file like:
 * `node dbLoader.js ./config.json ./yag-export.json`
 * Where the first argument is the config file for your Leo,
 * and the second is data exported from YAGPDB.xyz
 */

import config from "./config.cjs";
import { Reputation } from "./database.js";
import seq from 'sequelize';
import fs from "fs/promises";

const { Sequelize } = seq;

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: config.database
});

async function main() {
	Reputation.init(sequelize);

	await Reputation.sync({ alter: true });

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

	await Reputation.bulkCreate(toInsert);
}

main();