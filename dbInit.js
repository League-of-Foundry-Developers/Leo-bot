import config from "./config.cjs";
import * as Database from "./database.js";
import seq from 'sequelize';
import { User } from "discord.js";

const { Sequelize } = seq;

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: config.database
});

async function main() {
	Database.Reputation.init(sequelize);
	Database.Score.init(sequelize);
	Database.User.init(sequelize);

	await Database.Reputation.sync({ alter: true });
	await Database.Score.sync({ alter: true });
	await Database.User.sync({ alter: true });
}

main();