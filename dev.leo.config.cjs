module.exports = {
	apps : [
		{
			name: "leo-dev",
			script: "./main.js",
			args: "./dev.config.json",
			node_args: "--inspect --trace-warnings --unhandled-rejections=strict",
			watch: true,
			ignore_watch: ["node_modules", "*.db*", "*.log*"],
			watch_delay: 1000,
			error_file: "dev.error.log",
			out_file: "dev.leo.log",
			restart_delay: "3000",
			autorestart: true,
			min_uptime: 10000,
			max_restarts: 5
		}
	]
};
