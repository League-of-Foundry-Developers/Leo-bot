const { Package } = require("./Package.js");
const { strings } = require("./stringTemplates.js");

/**
 * @typedef {import("../Leo.js").Leo} Leo
 */

/**
 * A class to manage the /package command.
 *
 * Handles the command input, the constructs the appropriate response.
 *
 * @class PackageSearch
 */
class PackageSearch {
	/**
	 * Creates an instance of PackageSearch.
	 *
	 * @param {Leo} bot
	 * @memberof PackageSearch
	 */
	constructor(bot) {
		this.bot = bot;
	}

	get config() { return this.bot.config; }
	get client() { return this.bot.client; }
	get sql() { return this.bot.sql; }


	getPackageResponse(name, manifest) {
		const package = await Package.get(name, manifest);
		
		if (package.hasError) return this.handlePackageError(package);
		
		return {
			content: `Package: \`${package.name}\``,
			embeds: [packageEmbed(package)]
		}
	}
	packageEmbed(package) {
		return {
			color: 0xff6400,
			title: package.title,
			author: {
				name: `Author: ${package.author}`
			},
			description: package.description,
			image: {
				url: package.image
			},
			thumbnail: {
				url: package.thumb
			},
			fields: [
				{
					name: "Info:",
					value: strings.packageInfo(package),
					inline: true
				},
				{
					name: "Stats:",
					value: strings.packageStats(package),
					inline: true
				},
				{
					name: "Links:",
					value: strings.packageLinks(package),
					inline: true
				}
			]
		}
	}
}

module.exports.PackageSearch = PackageSearch;