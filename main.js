const { token } = require("./config.json");
const Discord = require("discord.js");
const fetch = require("node-fetch");
const { Sequelize } = require("sequelize");
const columnify = require('columnify')

const { Reputation, Score } = require("./database.js");
const { Op } = require("sequelize");

const sequelize = new Sequelize("sqlite:./leo.db");
const client = new Discord.Client();

const debug = true;

async function main() {
	Reputation.init(sequelize);
	Score.init(sequelize);

	await client.login(token);
}

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
**Endorsements:** ${fhub.endorsements}
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
	console.log(interaction);
	console.log(interaction.data.options);

	try {
		switch (interaction.data.name) {
			case "package": await handlePackageCommand(interaction); break;
			case "say": await handleSayCommand(interaction); break;
			case "giverep":
			case "rep": await handleRepCommand(interaction); break;
			default: {
				await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
					type: 4,
					data: {
						content: "Command not recognized."
					}
				}});
			}
		}
	}
	catch(e) {
		console.error(e);
	}
})

async function handlePackageCommand(interaction) {
	const name = interaction.data.options.find(o => o.name == "name")?.value;
	console.log(`Package Name: ${name}`);

	client.api.interactions(interaction.id, interaction.token).callback.post({data: {
		type: 4,
		data: await getPackageResponse(name)
	}});
}
async function handleSayCommand(interaction) {
	console.log(client.channels);
	const channel = interaction.data.options.find(o => o.name == "channel")?.value;
	const message = interaction.data.options.find(o => o.name == "message")?.value;

	console.log(`
		Sending message on channel: ${channel}
		> ${message}
	`);

	await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
		type: 4,
		data: {
			content: `Sending message to ${channel}`
		}
	}});

	const ch = await client.channels.fetch(channel);
	ch.send(message);
}

async function handleRepCommand(interaction) {
	const subcommand = interaction.data.options.find(o => o.type == 1);

	switch (subcommand.name) {
		case "give": await giveRep(interaction, subcommand.options); break;
		case "check": await checkRep(interaction, subcommand.options); break;
		case "scoreboard": await getScoreboard(interaction); break;
	}
}

async function checkRep(interaction, options) {
	const userId = options.find(o => o.name == "user")?.value;

	const user = await client.users.fetch(userId);

	const score = await Score.findOne({
		where: { user: userId }
	});

	const message = `**${user.username}: ${score.score}** LeaguePoints™️ (#**${score.rank}**)`;

	console.log(`
> /rep check user:${user.username}
=> ${message}
`);

	await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
		type: 4,
		data: {
			content: message
		}
	}});
}

async function giveRep(interaction, options) {
	const userId = options.find(o => o.name == "user")?.value;
	const amount = options.find(o => o.name == "amount")?.value || 1;
	const reason = options.find(o => o.name == "reason")?.value || null;

	const user = await client.users.fetch(userId);

	const delta = await Reputation.create({
		user: userId,
		delta: amount,
		reason: reason,
		giverId: interaction.member.user.id,
		channelId: interaction.channel_id,
		messageId: interaction.id
	});
	const score = await Score.findOne({
		where: { user: userId }
	}) || { score: 0, rank: 0 };

	const response = await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
		type: 4,
		data: {
			content: `Gave \`${amount}\` ️LeaguePoints™️ to **${user.username}** ${reason ? `because ${reason}` : ""} (current: \`#${score.rank}\` - \`${score.score}\`)`
		}
	}});

	console.log(response);

	// delta.messageId = "";
	// await delta.save();
}

async function getScoreboard(interaction) {
	let scores = await Score.findAll({
		raw: true,
		attributes: ["rank", "score", "user"],
		order: [["rank", "ASC"]],
		limit: 10,
		offset: 0
	})

	for (let score of scores) {
		let user = await client.users.fetch(score.user);
		score.user = `${user?.username}#${user?.discriminator}`;
	}
	
	await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
		type: 4,
		data: {
			content: `Reputation Scoreboard:`,
			embeds: [await getScoreboardEmbed(scores)]
		}
	}});
}

async function getScoreboardEmbed(scores) {
	const board = scores.map((s, i) => ({
		"- Rank -": `#${s.rank}`,
		"- Points -": s.score,
		"- User -": s.user
	}));

	const message = columnify(board, {
		columnSplitter: " | ",
		config: {
			"- Rank -": { align: "center" },
			"- Points -": { align: "right" }
		}
	});	

	console.log(message);

	return {
		color: 0xff6400,
		title: "Scoreboard",
		description: "```\n" + message + "\n```"
	}
}

main();