import config from "./config.cjs";
import { Reputation, Score } from "./database.js";
import seq from 'sequelize';

const { Sequelize } = seq;

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