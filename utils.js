import config from "./config.cjs";
export default class Utils {
	/**
	 * Sends a message to the console only if debug mode is on.
	 *
	 * @param {Array} args - Any arguments, which are passed directly to console.debug
	 * @return {void}        Returns early if debugging is disabled 
	 * @memberof Leo
	 */
	static debug(...args) {
		if (!config.debug) return;
		console.debug(...args);
	}
}