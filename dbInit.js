/** @type {LeoConfig} */
const config = require(process.argv[2]);
const { Reputation, Score } = require("./database.js");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: config.database
});

async function main() {
	Reputation.init(sequelize);
	Score.init(sequelize);

	await Reputation.sync({ alter: true });
	await Score.sync({ alter: true });
}

main();