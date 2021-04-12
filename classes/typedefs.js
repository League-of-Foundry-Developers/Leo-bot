/************************ Leo config.json ***************************/


/**
 * A set of properties to configure the behaviour of this bot.
 * 
 * @typedef  {object}  LeoConfig
 * @property {string}  token                     - The Discord bot token for this bot to use
 * @property {string}  guild                     - The guild id of the Discord server
 * @property {string}  database                  - The path to an sqlite .db file
 * @property {object}  emotes                    - A group of settings regarding emotes
 * @property {object}  emotes.plusone            - A group of settigns regarding the +1 emote
 * @property {string}  emotes.plusone.id         - The Discord snowflake id of the +1 emote
 * @property {string}  emotes.plusone.name       - The :name: of the +1 emote
 * @property {object}  points                    - A group of settings regarding points
 * @property {string}  points.name               - The display name of points
 * @property {object}  permissions               - A group of settings regarding permissions
 * @property {string}  permissions.giveNegative  - The Discord snowflake ID of a role which may give negative points (take)
 * @property {string}  permissions.giveMany      - The id of a role that can give more than one point
 * @property {number}  permissions.giveManyLimit - The give limit of the previous group
 * @property {string}  permissions.giveUnlimited - The id of a role which has no give restrictions
 * @property {boolean} debug                     - Whether or not debugging mode is enabled
 */



/********************** Dicord Interactions *************************/


/**
 * An interaction is the base "thing" that is sent when a user invokes
 * a command, and is the same for Slash Commands and other future interaction types.
 *
 * @typedef  {object} Interaction
 * @property {string}          id              - id of the interaction
 * @property {string}          application_id  - id of the application this interaction is for
 * @property {number}          type            - the type of interaction
 * @property {InteractionData} [data]          - the command data payload
 * @property {string}          [guuild_id]     - the guild it was sent from
 * @property {string}          [channel_id]    - the channel it was sent from
 * @property {object}          [member]        - guild member data for the invoking user, including permissions
 * @property {object}          [user]          - user object for the invoking user, if invoked in a DM
 * @property {string}          token           - a continuation token for responding to the interaction
 * @property {number}          version         - read-only property, always 1
 */

/**
 * @typedef {ApplicationCommandInteractionData} InteractionData
 *//**
 * @typedef  {object} ApplicationCommandInteractionData
 * @property {string}                   id        - the ID of the invoked command
 * @property {string}                   name      - the name of the invoked command
 * @property {Array<InteractionOption>} [options] - the params + values from the user
 */

/**
 * @typedef {ApplicationCommandInteractionDataOption} InteractionOption
 *//**
 * @typedef  {object} ApplicationCommandInteractionDataOption
 * @property {string}                   name      - the name of the parameter
 * @property {string}                   [value]   - the value of the pair
 * @property {Array<InteractionOption>} [options] - present if this option is a group or subcommand
 */

/** 
 * @typedef {InteractionApplicationCommandCallbackData} InteractionResponse
 *//**
 * @typedef  {object} InteractionApplicationCommandCallbackData
 * @property {boolean}                                  [tts]              - is the response TTS
 * @property {string}                                   [content]          - message content
 * @property {Array<import("discord.js").MessageEmbed>} [embeds]           - supports up to 10 embeds
 * @property {object}                                   [allowed_mentions] - allowed mentions object
 * @property {number}                                   [flags]            - set to 64 to make your response ephemeral
 */