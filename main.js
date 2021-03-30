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

	if (!package) return { content: `Package \`${name}\` not found!` };

	return {
		content: `Package: \`${name}\``,
		embeds: [getPackageEmbed(package, manifest)]
	}
}

function getPackageEmbed(package, manifest) {
	const image = package.media.find(m => m.type == "cover")?.url
	const thumb = package.media.find(m => m.type == "icon")?.url
	const author = package.authors.join(", ");

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
				name: "Links:",
				value: `[Project Website](${package.url})
						[Manifest](${manifest.manifest})
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

async function getPackage(name) {
	const response = await fetch(`https://forge-vtt.com/api/bazaar/package/${name}?manifest=1`);
	return await response.json();
}

client.ws.on('INTERACTION_CREATE', async interaction => {
	//console.log(interaction);
	console.log(interaction.data.options);

	const name = interaction.data.options.find(o => o.name == "package-name")?.value;
	console.log(`Package Name: ${name}`);

	client.api.interactions(interaction.id, interaction.token).callback.post({data: {
		type: 4,
		data: await getPackageResponse(name)
	}});
})

client.login(token);