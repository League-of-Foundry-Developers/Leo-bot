const fetch = require("node-fetch");
const { Leo } = require("../Leo");

/**
 * Represents the data for a Foundry package,
 * first retrieves a specified package by name or manifest
 * then parses out the relevant information.
 *
 * @class Package
 */
class Package {
	/**
	 * A factory method that creates an initializes a Package object.
	 *
	 * @static
	 * @param {array} args        - All arguments to pass to the constructor
	 * @return {Promise<Package>}   A new initialized Package instance
	 * @memberof Package
	 */
	static async get(...args) {
		const pkg = new Package(...args);
		return await pkg.init();
	}	

	/**
	 * Creates an instance of Package.
	 *
	 * @param {import("./PackageSearch").PackageSearch} manager - A reference to the PackageSearch manager class this class belongs to
	 * @param {string} name                                     - The `name` attribute from the package manifest
	 * @param {string} [manifest=null]                          - The URL of a manifest file on the internet
	 * @memberof Package
	 */
	constructor(manager, name, manifest=null) {
		this.manager = manager;
		this._name = name;
		if (manifest) {
			this._manifestUrl = manifest;

			/** @type {boolean} Whether or not the manifest alone was used to get data */
			this.fromManifest = true;
		}
		else this.fromManifest = false;

		this.errors = [];
	}

	/**
	 * Checks whether or not the named error has occured
	 *
	 * @param {string} name - The name of the error
	 * @return {boolean} 
	 * @memberof Package
	 */
	getError(name) { return this.errors.includes(name); }

	/** @type {boolean} Whether or not the package was located on the API */
	get notFound() { return this.bazaarError && !this.fromManifest; }

	/** @type {boolean} Are there any errors at all */
	get hasError() { return Boolean(this.errors.length); }
	/** @type {boolean} Did the manifest fail validation */
	get manifestInvalid() { return this.getError("manifest-validation"); }
	/** @type {boolean} Was there an error fething or parsing the manifest */
	get manifestError() { return this.fromManifest ? this.getError("manifest") : this.bazaarError; }
	/** @type {boolean} Was there an error communicating with the Bazaar API */
	get bazaarError() { return this.getError("bazaar"); }
	/** @type {boolean} Was there an error searching for alternatives */
	get searchError() { return this.getError("search"); }
	/** @type {boolean} Was there an error communication with the Foundry Hub API*/
	get foundryHubError() { return this.getError("fhub"); }

	/** @type {boolean} Is the data contained in this object unusable */
	get badData() {
		return this.fromManifest && (this.manifestError || this.manifestInvalid);
	}

	/**
	 * Initializes this package with the data fetched from package
	 * listing APIs, or from the specified manifest.
	 *
	 * @async
	 * @return {Promise<Package>} This object
	 * @memberof Package
	 */
	async init() {
		Leo.debug(this.fromManifest);
		if (this.fromManifest) await this.getManifest();
		else await Promise.all([
			this.getBazaar(),
			this.getFoundryHub()
		]);

		if (this.notFound) await this.searchPackages();
		else {
			try { this.validateManifest(); }
			catch (error) { console.error(error); }
		}

		return this;
	}

	/**
	 * Fetches the data about this package from The Forge's
	 * Bazaar API. Error checks the process, and stores the "package"
	 * and the "manifest" properties from the response.
	 *
	 * In the event of an error, logs the error in @see Package.errors
	 *
	 * @async
	 * @return {Promise<void>}
	 * @memberof Package
	 */
	async getBazaar() {
		try {
			const response = await fetch(`https://forge-vtt.com/api/bazaar/package/${this.name}?manifest=1`);
			
			if (response.status != 200) // Not a suceess
				throw new Error(`Could not fetch "${this.name}" from the Bazzar.\nStatus code: ${response.status}`);
			
			const bazaar = await response.json();

			if (!bazaar.package || !bazaar.manifest) // Insufficient data
				throw new Error(`The package "${this.name}" could not be found on The Bazzar.`);

			this.bazaar = bazaar.package;
			/** @type {object} The data of the package manifest */
			this.manifest = bazaar.manifest;
		} 
		catch(error) { 
			console.error(`There was an issue fetching "${this.name}" from The Bazaar.`);
			console.error(error);
			this.errors.push("bazaar");
			this.bazaar = this.manifest = null;
		}
	}

	/**
	 * Fetches the data about this package from Foundrry Hub's API.
	 * Error checks the process, and stores the data.
	 *
	 * In the event of an error, logs the error in @see Package.errors
	 *
	 * @async
	 * @return {Promise<void>}
	 * @memberof Package
	 */
	async getFoundryHub() {
		try {
			const response = await fetch(`https://www.foundryvtt-hub.com/wp-json/hubapi/v1/package/${this.name}`);
			
			if (response.status != 200) // Not a suceess
				throw new Error(`Could not fetch "${this.name}" from the Foundry Hub.\nStatus code: ${response.status}`);
			
			const foundryHub = await response.json();

			if (!foundryHub) // Insufficient data
				throw new Error(`The package "${this.name}" could not be found on Foundry Hub.`);

			this.foundryHub = foundryHub;
		}
		catch (error) {
			console.error(`There was an issue fetching "${this.name}" from Foundry Hub.`);
			console.error(error);
			this.errors.push("fhub");
			this.foundryHub = null;
		}
	}

	/**
	 * Fetches the manifest for this package directly.
	 * Error checks the process, and stores the data.
	 *
	 * In the event of an error, logs the error in @see Package.errors
	 *
	 * @async
	 * @return {Promise<void>}
	 * @memberof Package
	 */
	async getManifest() {
		try {
			const response = await fetch(this.manifestUrl);
			
			if (response.status != 200) // Not a suceess
				throw new Error(`Could not fetch manifest: "${this.manifestUrl}"\nStatus code: ${response.status}`);
			
			const manifest = await response.json();

			if (!manifest?.name) // Insufficient data
				throw new Error(`Could not fetch manifest: "${this.manifestUrl}"`);

			/** @type {object} The data of the package manifest */
			this.manifest = manifest;

			if (this.name != this.manifest.name)
				throw new Error(`Manifest name mismatch for "${this.name}"\n${this.manifestUrl}`);
		}
		catch (error) {
			console.error(`There was an issue fetching "${this.manifestUrl}"`);
			console.error(error);
			this.errors.push("manifest");
			this.foundryHub = null;
		}
	}

	/**
	 * Fetches a list of similar package names if the package couldn't be found.
	 * Error checks the process, and stores the data.
	 *
	 * In the event of an error, logs the error in @see Package.errors
	 *
	 * @async
	 * @return {Promise<void>}
	 * @memberof Package
	 */
	async searchPackages() {
		try {
			const response = await fetch(`https://www.foundryvtt-hub.com/wp-json/relevanssi/v1/search?posts_per_page=5&paged=1&type=package&keyword=${this.name}`);

			if (response.status != 200) // Not a suceess
				throw new Error(`Could not fetch search results for \`${this.name}\``);

			let results = await response.json();

			if (!results || results?.code == "No results") // Insufficient data
				throw new Error(`No results found for query: "${this.name}"`)

			this.searchResults = results.map(p => p.slug);
		}
		catch (error) {
			console.error(`There was an issue fetching search results for "${this.name}"`);
			console.error(error);
			this.errors.push("search");
			this.searchResults = [];
		}
	}

	/**
	 * Checks that the manifest is a valid Foundry package
	 * manifest, and collects error information if it is not.
	 *
	 * @async
	 * @return {{ 
	 *     valid: boolean,
	 *	   error: string 
	 * }} Valid: whether or not the manifest is valid.
	 *    Error: A string containing an error message if not valid.
	 * @memberof Package
	 */
	validateManifest() {
		// TEMPORARILY DISABLED
		return { valid: true, error: "Validation disabled." };

		const { valid, error } = 
			this.manager.validateManifest(this.manifest, this.type);

		if (!valid) {
			this.errors.push("manifest-validation");
			/** @type {string} A string containing all the errors found while validating this manifest */
			this.validationError = error;
			throw new Error(`The manifest for this package did not pass validation:\n${error}`);
		}

		return { valid, error };
	}

	/** @type {string} The `name` of the package, matching the `name` property of the manifest */
	get name() { return this._name; }

	/** @type {string} The package type: "module", "system", or "world" */
	get type() {
		if (!this.fromManifest && this.bazaar?.type) 
			return this.bazaar.type

		return this.manifestUrl.match(/(module|system|world).json/)[1] || null;
	}

	/** @type {string} The nice display "Title" of the package */
	get title() { return this.manifest.title; }

	/** @type {string|null} The URL of the cover image for the package if it exists */
	get image() {
		if (this.badData) return "";
		const media = this.fromManifest ? this.manifest.media : this.bazaar.media;

		if (!media?.find) return "";
		return media.find(m => m.type == "cover")?.url;
	}
	/** @type {string|null} The URL of the icon for the package if it exists */
	get thumb() {
		if (this.badData) return "";
		const media = this.fromManifest ? this.manifest.media : this.bazaar.media;

		if (!media?.find) return "";
		return media.find(m => m.type == "icon")?.url;
	}
	/** @type {string} A string of one or more authors, multiple are joined by a comma */
	get author() {
		if (this.badData || !this.manifest.authors?.map) return "";
		if (this.fromManifest) {
			if (!this.manifest.authors) return this.manifest.author;
			return this.manifest.authors.map(author => author.name)?.join(", ");
		}
		else return this.bazaar.authors?.join(", ");
	}
	/** @type {string} A string of one or more systems, multiple are joined by a comma */
	get systems() {
		if (this.badData || !this.manifest.systems?.join) return "";
		return this.manifest.systems?.join(", ");
	}
	
	/** @type {string} */
	get description() { return this.manifest.description; }
	/** @type {string} */
	get version() { return this.manifest.version; }
	/** @type {string} */
	get compatibleCoreVersion() { return this.manifest.compatibleCoreVersion; }
	/** @type {string} */
	get changelog() { return this.manifest.changelog; }

	/** @type {string} Forge installs */
	get installs() { return this.foundryHub?.installs; }
	/** @type {string} Foundry Hub */
	get endorsements() { return this.foundryHub?.endorsements; }
	/** @type {string} Foundry Hub */
	get comments() { return this.foundryHub?.comments; }

	/** @type {string} The URL of the package manifest */
	get manifestUrl() {
		return this.fromManifest ? this._manifestUrl : this.manifest.manifest;
	}

	/** @type {string} The URL of the package website */
	get url() { return this.manifest.url; };
}

module.exports.Package = Package;