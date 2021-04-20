import nodeHtmlToImage from 'node-html-to-image'

nodeHtmlToImage({
	output: './image.png',
	html: '<html><body>Hello {{name}}!</body></html>',
	content: { name: 'you' }
})
.then(() => console.log('The image was created successfully!'))