const { Reputation } = require("./database.js");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: process.argv[2]
});

async function main() {
	Reputation.init(sequelize);

	await Reputation.sync({ alter: true });
}

main();