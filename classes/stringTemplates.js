class Strings {

/**
 * @param {object} params
 * @param {string} params.version               - The package version
 * @param {string} params.compatibleCoreVersion - Compatible core version
 * @param {string} [params.systems]             - String list of systems
 * @param {string} [params.changelog]           - Link tot he changelog
 * @return {string} 
 */
static packageInfo({ version, compatibleCoreVersion, systems, changelog }) {

return `\
**Version:** ${version}
**Core:** ${ccv}
${system ? `**System:** \`${systems}\`` : ""}
${changelog ? `[Changelog](${changelog})` : ""}`

}

/**
 * @param {object} params
 * @param {string} params.installs     - Percentage of Forge installs
 * @param {number} params.endorsements - Number of Foundry Hub endorsements
 * @param {number} params.comments     - Number of Foundry Hub comments
 * @return {string} 
 */
static packageStats({ installs, endorsements, comments }) {

return `\
**Installs:** ${installs}%
**Endorsements:** ${endorsements}
**Comments:** ${comments}`

}

/**
 * @param {object} params
 * @param {string} params.manifestUrl - The manifest URL for the package .json manifest file.
 * @param {string} params.url         - The website of the package
 * @param {string} params.name        - The package `name` field from the manifest
 * @return {string} 
 */
static packageLinks({ manifestUrl, url, name }) {

return `\
**[Manifest](${manifestUrl})**
[Project Website](${url})
[Package Listing](https://foundryvtt.com/packages/${name})
[Foundry Hub](https://www.foundryvtt-hub.com/package/${name})
[The Forge Bazaar](https://forge-vtt.com/bazaar#package=${name})
`

}

}
module.exports.strings = Strings;