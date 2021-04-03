let server = "732325252788387980";

let users = []
let results = [];
let offset = 0;

do {
	let resp = await 
		fetch(`https://yagpdb.xyz/api/${server}/reputation/leaderboard?limit=100&offset=${offset}`);

	if(resp.status != 200) continue;

	let text = await resp.text();
	text = text.replace(/([\[:])?(\d{9,})([,\}\]])/g, "$1\"$2\"$3");

	results = JSON.parse(text) || [];

	results = results.map(r => r.user_id);
	console.log(results);
	users.push(...results);
	offset += 100;
} while(results.length)

let deltas = [];

for (let user of users) {
	console.log(user);
	let delta = [];
	let last = null;
	
	do {
		let resp = await 
			fetch(`https://yagpdb.xyz/manage/${server}/reputation/logs?user_id=${user}${last ? `&before=${last}` : ""}`)

		if(resp.status != 200) continue;

		let text = await resp.text();
		text = text.replace(/([\[:])?(\d{9,})([,\}\]])/g, "$1\"$2\"$3");

		results = JSON.parse(text) || [];
		console.log(results);

		last = results[results.length - 1]?.id;

		let entries = results.filter(r => r.receiver_id == user);
		console.log(entries);
		delta.push(...entries);
	} while(results.length)

	console.log(delta);
	deltas.push(...delta);
}

document.write(JSON.stringify(deltas));