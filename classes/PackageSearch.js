const { InteractionHandler } = require("./InteractionHandler.js");
const { Package } = require("./Package.js");
const { strings } = require("./stringTemplates.js");

/**
 * A class to manage the /package command.
 *
 * Handles the command input, the constructs the appropriate response.
 *
 * @class PackageSearch
 */
class PackageSearch extends InteractionHandler {
	/** @readonly @override */
	get commandName() { return "package"; }

	async init() {
		this.validator = await import("@typhonjs-fvtt/validate-manifest");
		this.betterErrors = (await import("@typhonjs-node-utils/better-ajv-errors")).default;
	}
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

	validateManifest(manifest, type) {
		const validator = {
			"module": this.validator.validateModulePlus,
			"system": this.validator.validateSystemPlus,
			"world" : function () { this.errors = []; return true; }
		}[type];

		const valid = validator(manifest);
		const error = this.betterErrors.asString(validator.errors);

		return { valid, error };
	}
}

module.exports.PackageSearch = PackageSearch;