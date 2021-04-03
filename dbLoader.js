//import DB from "sequelize";
const { Reputation } = require("./database.js");
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("sqlite:./leo.db");

const data = require("./yag-export.json");

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