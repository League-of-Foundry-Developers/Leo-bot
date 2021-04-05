/**
 * An interaction is the base "thing" that is sent when a user invokes
 * a command, and is the same for Slash Commands and other future interaction types.
 *
 * @typedef {object} Interaction
 * @property {string} id              - id of the interaction
 * @property {string} application_id  - id of the application this interaction is for
 * @property {number} type            - the type of interaction
 * @property {InteractionData} [data] - the command data payload
 * @property {string} [guuild_id]     - the guild it was sent from
 * @property {string} [channel_id]    - the channel it was sent from
 * @property {object} [member]        - guild member data for the invoking user, including permissions
 * @property {object} [user]          - user object for the invoking user, if invoked in a DM
 * @property {string} token           - a continuation token for responding to the interaction
 * @property {number} version         - read-only property, always 1
 */

/**
 * @typedef {ApplicationCommandInteractionData} InteractionData
 *//**
 * @typedef {object} ApplicationCommandInteractionData
 * @property {string} id                          - the ID of the invoked command
 * @property {string} name                        - the name of the invoked command
 * @property {Array<InteractionOption>} [options] - the params + values from the user
 */

 /**
 * @typedef {ApplicationCommandInteractionDataOption} InteractionOption
 *//**
 * @typedef {object} ApplicationCommandInteractionDataOption
 * @property {string} name                        - the name of the parameter
 * @property {string} [value]                     - the value of the pair
 * @property {Array<InteractionOption>} [options] - present if this option is a group or subcommand
 */