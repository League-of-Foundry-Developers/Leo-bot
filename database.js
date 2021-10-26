import sequelize from 'sequelize';
const { Sequelize, DataTypes, Model } = sequelize;

//const sequelize = new Sequelize("sqlite:./leo.db");

class EnhancedModel extends Model {
	/** @override */
	static get schema() { return {}; }
	/** @override */
	static get initOptions() { return {}; }

	static init(db) {
		const opts = this.initOptions;
		opts.sequelize = db;

		super.init(this.schema, opts);
	}
}

class View extends EnhancedModel {
	/** @override */
	static get createCode() { return ""; }

	static async sync({ alter=false }) {
		const name = this.initOptions.tableName || this.initOptions.modelName;
		const preamble = /* sql */`
			CREATE VIEW IF NOT EXISTS 
				${name}
			AS`;

		if (alter) await this.sequelize.query(`DROP VIEW IF EXISTS ${name};`);
		return await this.sequelize.query(preamble + this.createCode);
	}
}

export class Score extends View {
	static get createCode() {
		return /* sql */`
		SELECT
			user,
			name,
			discriminator,
			name || "#" || discriminator AS tag,
			score,
			latest,
			initial,
			rank() OVER (
				ORDER BY
					score DESC,
					latest DESC
			) AS rank
		FROM (
			SELECT
				user,
				SUM(delta) AS score,
				MAX(Reputation.updatedAt) AS latest,
				MIN(Reputation.createdAt) AS initial
			FROM
				Reputation
			GROUP BY user
		)
		INNER JOIN Users ON user = Users.id;`
	}
	static get schema() {
		return {
			user: {
				type: DataTypes.STRING,
				primaryKey: true
			},
			score: DataTypes.INTEGER,
			latest: DataTypes.DATE,
			initial: DataTypes.DATE,
			rank: DataTypes.INTEGER
		}
	}
	static get initOptions() {
		return {
			modelName: "Score",
			tableName: "Scoreboard",
            timestamps: false
		}
	}
}

/**
 * @typedef {Object} ReputationData
 *
 * @property {string} user
 * @property {number} delta
 * @property {string} [reason]
 * @property {string} [channelId]
 * @property {string} [messageId]
 * @property {string} [giverId]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */
/**
 * A Model to manage one entry in the Reputation table
 *
 * @class Reputation
 * @extends {EnhancedModel}
 */
export class Reputation extends EnhancedModel {
	async init(...args) {
		Reputation.belongsTo(User);
		super.init(...args);
	}
	static get schema() {
		return {
			user: {
				type: DataTypes.STRING,
				allowNull: false
			},
			delta: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			reason: DataTypes.STRING,
			channelId: DataTypes.STRING,
			messageId: DataTypes.STRING,
			giverId: DataTypes.STRING
		}
	}
	static get initOptions() {
		return {
			modelName: "Reputation",
			tableName: "Reputation",
			indexes: [
				{
					unique: false,
					fields: ["user"]
				},
				{
					unique: false,
					fields: ["giverId"]
				},
				{
					unique: false,
					fields: ["delta"]
				}
			]
		}
	}
}

export class User extends EnhancedModel {
	async init(...args) {
		User.hasMany(Reputation, {
			foreignKey: "user",
			allowNull: false
		});
		super.init(...args);
	}
	static get schema() {
		return {
			id: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true
			},
			name: DataTypes.STRING,
			discriminator: DataTypes.STRING
		}
	}
	static get initOptions() {
		return {
			modelName: "User",
			indexes: [
				{
					unique: true,
					fields: ["id"]
				}
			]
		}
	}
}


export class Choice extends EnhancedModel {
	async init(...args) {
		Choice.belongsTo(Option);
		Choice.belongsTo(Poll);

		super.init(...args);
	}
	static get schema() {
		return {
			poll: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			option: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			userId: DataTypes.STRING
		}
	}
	static get initOptions() {
		return {
			indexes: [
				{
					unique: false,
					fields: ["poll"]
				},
				{
					unique: false,
					fields: ["option"]
				}
			]
		}
	}
}
export class Option extends EnhancedModel {
	async init(...args) {
		Option.hasMany(Choice, {
			foreignKey: "option",
			allowNull: false
		});

		Option.belongsTo(Poll);

		super.init(...args);
	}
	static get schema() {
		return {
			poll: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			label: DataTypes.STRING
		}
	}
	static get initOptions() {
		return {
			indexes: [
				{
					unique: false,
					fields: ["poll"]
				}
			]
		}
	}
}
export class Poll extends EnhancedModel {
	async init(...args) {
		Poll.hasMany(Option, {
			foreignKey: "poll",
			allowNull: false
		});

		Poll.hasMany(Choice, {
			foreignKey: "poll",
			allowNull: false
		});

		super.init(...args);
	}
	static get schema() {
		return {
			creatorId: DataTypes.STRING,
			question: DataTypes.STRING,
			messageId: DataTypes.STRING,
			closed: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false
			}
		}
	}
}