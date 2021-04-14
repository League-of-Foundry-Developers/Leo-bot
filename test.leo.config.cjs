module.exports = {
	apps : [
		{
			name: "leo-test",
			script: "./main.js",
			args: "./test.config.json",
			node_args: "--trace-warnings",
			watch: true,
			ignore_watch: ["node_modules"],
			error_file: "test.error.log",
			out_file: "test.leo.log",
			restart_delay: "3000",
			autorestart: true,
		}
	]
};
