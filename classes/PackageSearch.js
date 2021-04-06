const { Package } = require("./Package.js");
const { strings } = require("./stringTemplates.js");

class PackageSearch {
	getPackageResponse(name, manifest) {
		const package = await Package.get(name, manifest);


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
}

module.exports.PackageSearch = PackageSearch;