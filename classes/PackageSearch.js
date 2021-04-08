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

		if (pkg.manifestInvalid) return this.getValidationError(pkg);
		if (pkg.notFound) return this.getAlternates(pkg);

		return {
			content: `Error loading data for \`${pkg.name}\`.\nErrors: \`${pkg.errors.join(", ")}\``,
			flags: 64
		}
	}

	getValidationError(pkg) {
		return {
			content: `Error loading data for \`${pkg.name}\`.\nErrors: \`${pkg.errors.join(", ")}\`\n\`\`\`${pkg.validationError}\`\`\``,
			flags: 64
		}
	}

	getAlternates(pkg) {
		return {
			content: `Error loading data for \`${pkg.name}\`.\nErrors: \`${pkg.errors.join(", ")}\``,
			flags: 64
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

/* Leftovers from earlier development not yet re-factored
async function getPackageSearchEmbed(query) {
	const search = await searchPackage(query);
	const options = search.map(n => "`" + n + "`").join("\n");

	return {
		color: 0xff6400,
		title: "Similar Packages",
		description: options
	}

}

async function searchPackage(query) {
	const response = await fetch(`https://www.foundryvtt-hub.com/wp-json/relevanssi/v1/search?posts_per_page=5&paged=1&type=package&keyword=${query}`);
	let data = await response.json();
	if (!data || data?.code == "No results") data = [];

	return data.map(p => p.slug);
}*/