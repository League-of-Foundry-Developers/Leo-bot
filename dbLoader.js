/**
 * Call this file like:
 * `node dbLoader.js ./config.json ./yag-export.json`
 * Where the first argument is the config file for your Leo,
 * and the second is data exported from YAGPDB.xyz
 */

/** @type {LeoConfig} */
const config = require(process.argv[2]);
const { Reputation } = require("./database.js");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: config.database
});

const data = require(process.argv[3]);

async function main() {
	Reputation.init(sequelize);

	await Reputation.sync({ alter: true });

	await insertData();
}

async function insertData() {
	toInsert = data.map(d => ({
		user: d.receiver_id,
		delta: d.amount,
		reason: "Imported from YAGPDB.xyz",
		giverId: d.sender_id,
		createdAt: d.created_at
	}));

	await Reputation.bulkCreate(toInsert);
}

main();