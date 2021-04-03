const { Reputation, Score } = require("./database.js");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: process.argv[2]
});

async function main() {
	Reputation.init(sequelize);
	Score.init(sequelize);

	await Reputation.sync({ alter: true });
	await Score.sync({ alter: true });
}

main();