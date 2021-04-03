const { Sequelize, DataTypes, Model } = require("sequelize");

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
		const preamble = `
			CREATE VIEW IF NOT EXISTS 
				${name}
			AS`;

		if (alter) await this.sequelize.query(`DROP VIEW IF EXISTS ${name};`);
		return await this.sequelize.query(preamble + this.createCode);
	}
}

class Score extends View {
	static get createCode() {
		return `
		SELECT 
			user,
			score,
			latest,
			initial,
			row_number() OVER (
				ORDER BY 
					score DESC,
					latest DESC
			) AS rank 
		FROM (
			SELECT
				user,
				SUM(delta) AS score,
				MAX(updatedAt) AS latest,
				MIN(createdAt) AS initial
			FROM
				Reputation
			GROUP BY user
		);`
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
class Reputation extends EnhancedModel {
	static get schema() {
		return {
			user: {
				type: DataTypes.STRING,
				allowNull: false
			},
			delta: DataTypes.INTEGER,
			reason: DataTypes.STRING,
			channelId: DataTypes.STRING,
			messageId: DataTypes.STRING,
			giverId: DataTypes.STRING
		}
	}
	static get initOptions() {
		return {
			modelName: "Reputation",
			tableName: "Reputation"
		}
	}
}

module.exports.Reputation = Reputation;
module.exports.Score = Score;