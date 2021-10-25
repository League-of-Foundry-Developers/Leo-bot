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

	Database.Poll.init(sequelize);
	Database.Option.init(sequelize);
	Database.Choice.init(sequelize);

	await Database.Reputation.sync({ alter: true });
	await Database.Score.sync({ alter: true });
	await Database.User.sync({ alter: true });

	await Database.Poll.sync({ alter: true });
	await Database.Option.sync({ alter: true });
	await Database.Choice.sync({ alter: true });
}

main();