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
			content: `Error loading data for ${pkg.name}:\n${pkg.errors.join(", ")}`
		}
	}
	packageEmbed(pkg) {
		return {
			color: 0xff6400,
			title: pkg.title,
			author: {
				name: `Author: ${pkg.author}`
			},
			description: pkg.description,
			image: {
				url: pkg.image
			},
			thumbnail: {
				url: pkg.thumb
			},
			fields: [
				{
					name: "Info:",
					value: strings.packageInfo(pkg),
					inline: true
				},
				{
					name: "Stats:",
					value: strings.packageStats(pkg),
					inline: true
				},
				{
					name: "Links:",
					value: strings.packageLinks(pkg),
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