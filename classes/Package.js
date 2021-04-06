const { validateModulePlus, validateSystemPlus } = require("@typhonjs-fvtt/validate-manifest");

class Package {
	static async get(...args) {
		const package = new Package(...args);
		return await package.init();
	}	
	static validateManifest(manifest, type) {
		if (!this._validateManifest(manifest, type)) {
			this.error.push("manifest-validation");
			throw new Error("The manifest for this package did not pass validation.");
		}
	}
	static _validateManifest(manifest, type) {
		switch (type) {
			case "system": return validateSystemPlus(manifest);
			case "module": return validateModulePlus(manifest);
			case "world": return true; // No validator for this 😬
		}
	}

	constructor(name, manifest=null) {
		this._name = name;
		if (manifest) {
			this._manifestUrl = manifest;
			this.fromManifest = true;
		}
		else this.fromManifest = false;

		this.errors = [];
	}

	get hasError() { return Boolean(this.errors.length); }

	async init() {
		if (this.fromManifest) await this.getManifest();
		else await Promise.all([
			this.getBazaar(),
			this.getFoundryHub()
		]);

		try { this.validateManifest(this.manifest, this.bazaar.type); }
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

	get name() { return this._name; }

	get image() {
		const media = this.fromManifest ? this.manifest.media : this.bazaar.media;
		return media.find(m => m.type == "cover")?.url;
	}
	get thumb() {
		const media = this.fromManifest ? this.manifest.media : this.bazaar.media;
		return media.find(m => m.type == "icon")?.url;
	}
	get author() {
		if (this.fromManifest) {
			if (!this.manifest.authors) return this.manifest.author;
			return this.manifest.authors.map(author => author.name)?.join(", ");
		}
		else return this.bazaar.authors?.join(", ");
	}
	get systems() {
		return this.manifest.systems?.join(", ");
	}
	
	get description() { return this.manifest.description; }
	get version() { return this.manifest.version; }
	get compatibleCoreVersion() { return this.manifest.compatibleCoreVersion; }
	get changelog() { return this.manifest.changelog; }

	get installs() { this.foundryHub?.installs; }
	get endorsements() { this.foundryHub?.endorsements; }
	get comments() { this.foundryHub?.comments; }

	get manifestUrl() {
		return this.fromManifest ? this._manifestUrl : this.manifest.manifest;
	}

	get url() { return this.manifest.url; };
}

module.exports.Package = Package;