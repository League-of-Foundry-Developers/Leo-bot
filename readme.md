![Leo The League Lion](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FLeague-of-Foundry-Developers%2Fleague-repo-status%2Fshields-endpoint%2FLeo-bot.json)
# Configuration
Leo is configured with a `config.json` file, or with a `test.config.json` or `dev.config.json` file. The `npm run` commands will use one of these config files as is approperiate.

This allows you to configure seperate settings for an in-developement environment from your testing environment, from your live environment.

- `config.json`: For your live Discord server
- `test.config.json`: For a private testing Discord server
- `dev.config.json`: For a personal development Discord server

## Example config.json file
**Do not allow your token to become public, do not commit your config.json file to Git, or share it anywhere**
```json
{
	"token": "<your bot token>",
	"guild": "<your server id>",
	"database": "./path/to/database.db",
	"emotes": {
		"plusone": {
			"id": "<emote id for +1>",
			"name": "<name>"
		},
		"greeting": {
			"id": "<emote id for greeting>",
			"name": "<name>",
			"delay": 180000,
			"random": 100000
		}
	},
	"points": {
		"name": "Points",
		"scoreboardLength": 15
	},
	"permissions": {
		"giveNegative": "<role id>",
		"giveMany": "<role id>",
		"giveManyLimit": 5,
		"giveUnlimited": "<role id>"
	},
	"backup": {
		"dir": "./backups",
		"prefix": "leo"
	},
	"debug": true
}
```
See config schema in `classes/typedefs.js`.
# Running This Bot
After running `npm install` to install dependencies, you must run:
```
npm run db-init
// Or
npm run db-init-test
// Or
npm run db-init-dev  
```
To create your database

Then run:
```
npm run create-cmd
// Or
npm run create-cmd-test
// Or
npm run create-cmd-dev  
```
To create the /slash commands on the guild sepcified.

Finally, depending on which config you want to run, run:
```
npm run leo
// Or
npm run leo-test
// Or
npm run leo-dev
// Or
node main.js ./some-other-file.json
```

# pm2

Included are three `leo.config.cjs` files which are pm2 ecosystem files.