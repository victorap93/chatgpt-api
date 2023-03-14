// Libraries
const express = require('express')
const dotenv = require('dotenv')
const { Configuration, OpenAIApi } = require("openai")

// Configure express
const app = express()
const port = 3000
app.use(express.json())

// Configure .env
dotenv.config();

// Configure openai
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

// Default route
app.get('/', (req, res) => {
	res.send('Hello World!')
})

// Chat route
app.get('/chatgpt', async (req, res) => {
	// Validate OPENAI_API_KEY
	if (!configuration.apiKey) {
		res.status(500).json({
			error: { message: "OpenAI API key not configured, please follow instructions in README.md", }
		})
		return
	}

	// Validate user input
	const question = req.body.question || ''
	if (question.trim().length === 0) {
		res.status(400).json({
			error: { message: "Por favor, preencha o campo com um texto válido.", }
		})
		return
	}

	// Send request to openai
	try {
		const completion = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: question,
			temperature: parseFloat(process.env.TEMPERATURE) || 0.6,
			max_tokens: parseInt(process.env.MAX_TOKENS, 10) || 256
		})
		// Return only text result
		res.status(200).json({ result: completion.data.choices[0].text })
	} catch (error) {
		// Log error
		if (error.response) {
			console.error(error.response.status, error.response.data)
			res.status(error.response.status).json(error.response.data)
		} else {
			console.error(`Error with OpenAI API request: ${error.message}`)
			res.status(500).json({
				error: {
					message: 'An error occurred during your request.',
				}
			})
		}
	}
})

// Running
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})