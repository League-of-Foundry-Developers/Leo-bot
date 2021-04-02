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

class Reputation extends EnhancedModel {
	static get schema() {
		return {
			user: {
				type: DataTypes.STRING,
				allowNull: false
			},
			score: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				allowNull: false
			}
		}
	}
	static get initOptions() {
		return {
			modelName: "Reputation",
			tableName: "Reputation"
		}
	}
}
class ReputationDelta extends EnhancedModel {
	static get schema() {
		return {
			user: {
				type: DataTypes.STRING,
				allowNull: false
			},
			delta: DataTypes.INTEGER,
			reason: DataTypes.STRING,
			channelId: DataTypes.STRING,
			messageId: DataTypes.STRING
		}
	}
	static get initOptions() {
		return {
			modelName: "ReputationDelta"
		}
	}
}

module.exports.Reputation = Reputation;
module.exports.ReputationDelta = ReputationDelta;