import puppeteer from 'puppeteer';

(async () => {
	console.time("Launch");
	const browser = await puppeteer.launch();
	console.timeEnd("Launch");

	console.time("New Page");
	const page = await browser.newPage();
	console.timeEnd("New Page");

	const content = "Hello World!";

	console.time("Render");
	await page.setContent(`
	<DOCTYPE html>
	<head></head>
	<body>
		<h1>${content}</h1>
	</body>
	`);
	console.timeEnd("Render");
	
	console.time("Screenshot");
	await page.screenshot({ path: "example.png" });
	console.timeEnd("Screenshot");

	await browser.close();
})();