module.exports = {
	apps : [
		{
			name: "leo-test",
			script: "./main.js",
			args: "./test.config.json",
			node_args: "--trace-warnings",
			error_file: "test.error.log",
			out_file: "test.leo.log",
			restart_delay: "3000",
			autorestart: true,
			min_uptime: 10000,
			max_restarts: 5
		}
	]
};
