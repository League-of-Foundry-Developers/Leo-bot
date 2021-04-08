# Configuration
Leo is configured with a `config.json` file, or with a `test.config.json` or `dev.config.json` file. The `npm run` commands will use one of these config files as is approperiate.

This allows you to configure seperate settings for an in-developement environment from your testing environment, from your live environment.

## Example config.json file
**Do not allow your token to become public, do not commit you config.json file to Git, or share it anywhere**
```json
{
	"token": "<your bot token>",
	"guild": "<your server id>",
	"database": "./path/to/database.db",
	"emotes": {
		"plusone": {
			"id": "<emote id for +1>",
			"name": "<name>"
		}
	},
	"points": {
		"name": "Points"
	},
	"permissions": {
		"giveNegative": "<role id>",
		"giveMany": "<role id>",
		"giveManyLimit": 5,
		"giveUnlimited": "<role id>"
	},
	"debug": true
}
```
# Running This Bot
First, you must run:
```
npm run db-init ./path/to/config.json
```
To create your database

Then run:
```
npm run create-cmd
npm run create-cmd-test // Or
npm run create-cmd-dev  // Or
```
To create the /slash commands on the guild sepcified.

Finally, depending on which config you want to run, run:
```
npm run bot
npm run bot-test
npm run bot-dev
node main.js ./some-other-file.json
```