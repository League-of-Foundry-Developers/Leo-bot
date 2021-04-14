module.exports = {
	apps : [
		{
			name: "leo",
			script: "./main.js",
			args: "./config.json",
			watch: true,
			ignore_watch: ["node_modules"],
			error_file: "error.log",
			out_file: "leo.log",
			restart_delay: "3000",
			autorestart: true,
		}
	]
};
