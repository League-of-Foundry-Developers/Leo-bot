const { strings } = require("./stringTemplates.js");

class PackageSearch {
	packageEmbed(package, manifest, fhub) {
		const image = package.media.find(m => m.type == "cover")?.url
		const thumb = package.media.find(m => m.type == "icon")?.url
		const author = package.authors.join(", ");
		const system = manifest.systems?.join(", ");

		const embed = { 
			color: 0xff6400,
			title: package.title,
			author: {
				name: `Author: ${author}`
			},
			description: package.description,
			image: {
				url: image
			},
			thumbnail: {
				url: thumb
			},
			fields: [
				{
					name: "Info:",
					value: strings.packageInfo(
						manifest.version,
						manifest.compatibleCoreVersion,
						system,
						manifest.changelog
					),
					inline: true
				},
				{
					name: "Stats:",
					value: strings.packageStats(
						package.installs,
						fhub.endorsements,
						fhub.comments
					),
					inline: true
				},
				{
					name: "Links:",
					value: strings.packageLinks(
						manifest.manifest,
						package.url,
						package.name
					),
					inline: true
				}
			]
		}

		return embed;
	}
}

module.exports.PackageSearch = PackageSearch;