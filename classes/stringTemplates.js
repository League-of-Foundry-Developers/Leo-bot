class Strings {

/**
 * @param {string} version     - The package version
 * @param {string} ccv         - Compatible core version
 * @param {string} [system]    - String list of systems
 * @param {string} [changelog] - Link tot he changelog
 * @return {string} 
 */
static  packageInfo(version, ccv, system, changelog) { 

return `\
**Version:** ${version}
**Core:** ${ccv}
${system ? `**System:** \`${system}\`` : ""}
${changelog ? `[Changelog](${changelog})` : ""}`

}

/**
 * @param {string} installs     - Percentage of Forge installs
 * @param {string} endorsements - Number of Foundry Hub endorsements
 * @param {string} comments     - Number of Foundry Hub comments
 * @return {string} 
 */
static packageStats(installs, endorsements, comments) {

return `\
**Installs:** ${installs}%
**Endorsements:** ${endorsements}
**Comments:** ${comments}`

}

/**
 * @param {string} manifest - The manifest URL for the package .json manifest file.
 * @param {string} url      - The website of the package
 * @param {string} name     - The package `name` field from the manifest
 * @return {string} 
 */
static packageLinks(manifest, url, name) {

return `\
**[Manifest](${manifest})**
[Project Website](${url})
[Package Listing](https://foundryvtt.com/packages/${name})
[Foundry Hub](https://www.foundryvtt-hub.com/package/${name})
[The Forge Bazaar](https://forge-vtt.com/bazaar#package=${name})
`

}

}
module.exports.strings = Strings;