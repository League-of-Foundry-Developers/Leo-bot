const { token } = require("./config.json");
const Discord = require("discord.js");
const fetch = require("node-fetch");
const client = new Discord.Client();

const debug = true;

client.once("ready", () => {
	console.log("Ready!");
});

client.on("message", message => {
//	if (debug) console.log(message);

	if (message.author.bot) return;
	if (message.content.startsWith("echo ")) 
		message.channel.send(message.content.slice(4));
});

async function getPackageResponse(name) {
	const pkg = await getPackage(name);
	const package = pkg.package;
	const manifest = pkg.manifest;
	const fhub = pkg.fhub;

	return package ? {
		content: `Package: \`${name}\``,
		embeds: [getPackageEmbed(package, manifest, fhub)]
	} : {
		content: `Package \`${name}\` not found!`,
		embeds: [await getPackageSearchEmbed(name)]
	}
}

async function getPackageSearchEmbed(query) {
	const search = await searchPackage(query);
	const options = search.map(n => "`" + n + "`").join("\n");

	return {
		color: 0xff6400,
		title: "Similar Packages",
		description: options
	}

}

function getPackageEmbed(package, manifest, fhub) {
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
				value: `
**Version:** ${manifest.version}
**Core:** ${manifest.compatibleCoreVersion}
${system ? `**System:** \`${system}\`` : ""}
${manifest.changelog ? `[Changelog](${manifest.changelog})` : ""}
					`,
				inline: true
			},
			{
				name: "Stats:",
				value: `
**Installs:** ${package.installs}%
**Likes:** ${fhub.endorsements}
**Comments:** ${fhub.comments}
					`,
				inline: true
			},
			{
				name: "Links:",
				value: `
**[Manifest](${manifest.manifest})**
[Project Website](${package.url})
[Package Listing](https://foundryvtt.com/packages/${package.name})
[Foundry Hub](https://www.foundryvtt-hub.com/package/${package.name})
[The Forge Bazaar](https://forge-vtt.com/bazaar#package=${package.name})
`,
				inline: true
			}
		]
	}

/*	if (manifest.authors) {
		embed.fields.push({
			name: "Authors",
			value: manifest.authors.map(a => 
					a.discord ? `@${a.discord}` :a.name
				).join(", "),
			inline: true
		});
	}
*/
	return embed;
}

async function searchPackage(query) {
	const response = await fetch(`https://www.foundryvtt-hub.com/wp-json/relevanssi/v1/search?posts_per_page=5&paged=1&type=package&keyword=${query}`);
	let data = await response.json();
	if (!data || data?.code == "No results") data = [];

	return data.map(p => p.slug);
}
async function getPackage(name) {
	const hub = fetch(`https://www.foundryvtt-hub.com/wp-json/hubapi/v1/package/${name}`)
		.then(r => r.json());
	const bazaar = fetch(`https://forge-vtt.com/api/bazaar/package/${name}?manifest=1`)
		.then(r => r.json());

	const [hubResp, bazResp] = await Promise.all([hub, bazaar]);

	return {
		package: bazResp.package,
		manifest: bazResp.manifest,
		fhub: hubResp
	}
}

client.ws.on('INTERACTION_CREATE', async interaction => {
	//console.log(interaction);
	console.log(interaction.data.options);

	const name = interaction.data.options.find(o => o.name == "name")?.value;
	console.log(`Package Name: ${name}`);

	client.api.interactions(interaction.id, interaction.token).callback.post({data: {
		type: 4,
		data: await getPackageResponse(name)
	}});
})

client.login(token);