const fetch = require("node-fetch");
class Package {
	static async get(...args) {
		const pkg = new Package(...args);
		return await pkg.init();
	}	

	constructor(manager, name, manifest=null) {
		this.manager = manager;
		this._name = name;
		if (manifest) {
			this._manifestUrl = manifest;
			this.fromManifest = true;
		}
		else this.fromManifest = false;

		this.errors = [];
	}

	getError(name) { return this.errors.includes(name); }

	get notFound() { return this.bazaarError && !this.fromManifest; }

	get hasError() { return Boolean(this.errors.length); }
	get manifestInvalid() { return this.getError("manifest-validation"); }
	get manifestError() { return this.fromManifest ? this.getError("manifest") : this.bazaarError; }
	get bazaarError() { return this.getError("bazaar"); }
	get foundryHubError() { return this.getError("fhub"); }

	get badData() {
		return this.fromManifest && (this.manifestError || this.manifestInvalid);
	}

	async init() {
		console.log(this.fromManifest);
		if (this.fromManifest) await this.getManifest();
		else await Promise.all([
			this.getBazaar(),
			this.getFoundryHub()
		]);

		try { await this.validateManifest(); }
		catch (error) { console.error(error); }

		return this;
	}

	async getBazaar() {
		try {
			const response = await fetch(`https://forge-vtt.com/api/bazaar/package/${this.name}?manifest=1`);
			
			if (response.status != 200) // Not a suceess
				throw new Error(`Could not fetch "${this.name}" from the Bazzar.\nStatus code: ${response.status}`);
			
			const bazaar = await response.json();

			if (!bazaar.package || !bazaar.manifest) // Insufficient data
				throw new Error(`The package "${this.name}" could not be found on The Bazzar.`);

			this.bazaar = bazaar.package;
			this.manifest = bazaar.manifest;
		} 
		catch(error) { 
			console.error(`There was an issue fetching "${this.name}" from The Bazaar.`);
			console.error(error);
			this.errors.push("bazaar");
			this.bazaar = this.manifest = null;
		}
	}

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

	async getManifest() {
		try {
			const response = await fetch(this.manifestUrl);
			
			if (response.status != 200) // Not a suceess
				throw new Error(`Could not fetch manifest: "${this.manifestUrl}"\nStatus code: ${response.status}`);
			
			const manifest = await response.json();

			if (!manifest?.name) // Insufficient data
				throw new Error(`Could not fetch manifest: "${this.manifestUrl}"`);

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

	async validateManifest() {
		const { valid, error } = 
			this.manager.validateManifest(this.manifest, this.type);

		if (!valid) {
			this.errors.push("manifest-validation");
			this.validationError = error;
			throw new Error(`The manifest for this package did not pass validation:\n${error}`);
		}

		return { valid, error };
	}

	get name() { return this._name; }

	get type() {
		if (!this.fromManifest && this.bazaar?.type) 
			return this.bazaar.type

		return this.manifestUrl.match(/(module|system|world).json/)[1] || null;
	}

	get image() {
		if (this.badData) return "";
		const media = this.fromManifest ? this.manifest.media : this.bazaar.media;
		return media.find(m => m.type == "cover")?.url;
	}
	get thumb() {
		if (this.badData) return "";
		const media = this.fromManifest ? this.manifest.media : this.bazaar.media;
		return media.find(m => m.type == "icon")?.url;
	}
	get author() {
		console.log("Bad data?: ", this.badData, this.errors);
		if (this.badData) return "";
		if (this.fromManifest) {
			if (!this.manifest.authors) return this.manifest.author;
			return this.manifest.authors.map(author => author.name)?.join(", ");
		}
		else return this.bazaar.authors?.join(", ");
	}
	get systems() {
		if (this.badData) return "";
		return this.manifest.systems?.join(", ");
	}
	
	get description() { return this.manifest.description; }
	get version() { return this.manifest.version; }
	get compatibleCoreVersion() { return this.manifest.compatibleCoreVersion; }
	get changelog() { return this.manifest.changelog; }

	get installs() { return this.foundryHub?.installs; }
	get endorsements() { return this.foundryHub?.endorsements; }
	get comments() { return this.foundryHub?.comments; }

	get manifestUrl() {
		return this.fromManifest ? this._manifestUrl : this.manifest.manifest;
	}

	get url() { return this.manifest.url; };
}

module.exports.Package = Package;