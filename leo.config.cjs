module.exports = {
	apps : [
		{
			name: "leo",
			script: "./main.js",
			args: "./config.json",
			watch: false,
			ignore_watch: [".git", "node_modules", "*.db*", "*.log*"],
			error_file: "error.log",
			out_file: "leo.log",
			restart_delay: "3000",
			autorestart: true,
			min_uptime: 10000,
			max_restarts: 5
		}
	]
};
