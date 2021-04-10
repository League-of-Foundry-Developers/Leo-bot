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

	/**
	 * Handles the /package command.
	 * 
	 * Finds the specified package by name, or if a manifest is
	 * given, fetches the manifest.
	 *
	 * Then, responds with an embed including details about the
	 * package.
	 *
	 * If the package can not be found, use the Foundry Hub search to 
	 * get a list of possible matches instead.
	 *
	 * Also validates the package manifest, if the manifest is not valid,
	 * sends an ephemeral respons indication the issues.
	 *
	 * @param {Interaction}              interaction - Information about the interaction
	 * @param {Array<InteractionOption>} options     - Information about the interaction
	 * @return {object}                                The response object
	 * @memberof PackageSearch
	 */
	async command(interaction, options) {
		console.log(options);
		return await this.bot.respond(interaction, await this.getPackageResponse(options.name, options.manifest));
	}
	async getPackageResponse(name, manifest) {
		const pkg = await Package.get(this, name, manifest);
		
		if (pkg.hasError) return this.handlePackageError(pkg);
		
		return {
			content: `Package: \`${pkg.name}\``,
			embeds: [this.packageEmbed(pkg)]
		}
	}
	handlePackageError(pkg) {
		console.log("Package errors!")

		let /* Generic Error */   error = strings.packageError(pkg);
		if  (pkg.manifestInvalid) error = strings.validationError(pkg);
		if  (pkg.notFound)        error = strings.searchResults(pkg);

		console.log(error);

		return { content: error, flags: InteractionHandler.ephemeral }
	}

	packageEmbed(pkg) {
		// Package info
		const fields = [{
			name: "Info:", inline: true,
			value: strings.packageInfo(pkg),
		}];

		// Stats and links only if not a fromManifest package
		if (!pkg.fromManifest) fields.push({
			name: "Stats:", inline: true,
			value: strings.packageStats(pkg),	
					value: strings.packageStats(pkg),
			value: strings.packageStats(pkg),	
		}, {
			name: "Links:", inline: true,
			value: strings.packageLinks(pkg),	
					value: strings.packageLinks(pkg),
			value: strings.packageLinks(pkg),	
		});
		
		return {
			color:       0xff6400,                        // Foundry orange
			title:       pkg.title,                       // Display name of the package
			author:    { name: `Author: ${pkg.author}` }, // Might be a comma seperated list
			description: pkg.description,                 // The description from the manifest
			image:     { url: pkg.image                }, // The cover image
			thumbnail: { url: pkg.thumb                }, // The icon image
			fields:      fields                           // All the sections of data
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