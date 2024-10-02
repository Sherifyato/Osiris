const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3001;  // Dedicated port for Nosa chatbot

// Middleware to serve static files like CSS and JS
app.use(express.static(path.join(__dirname, 'static')));

// Serve the Nosa chatbot page (nosa.html)
app.get('/nosa', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'nosa.html'));
});

// Endpoint to handle chatbot requests
app.use(express.json());
//
// app.use((req, res, next) => {
//     res.setHeader("Content-Security-Policy", "default-src 'self'; font-src 'self' data:;");
//     next();
// });

app.post('/chat', async (req, res) => {
    const user_input = req.body.input;
    console.log('User input:', req.body.input);  // Log the input

    const prompt = `
        Your name is Nusa, you are a chatbot that exists on a website which 
        is a solution for one of NASA Space Apps 2024 problems. 
        Answer only questions related to the contest or NASA overall. 
        Start your chat with a small greeting.
        Input from user: ${user_input}
    `;

    try {
        const response = await axios.post('https://api.generativeai.googleapis.com/v1/models/gemini-1.0-pro:generate', {
            prompt,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ response: response.data.choices[0].message.content });
    }  catch (error) {
        console.error('Error making API request:', error.response?.data || error.message);  // Log detailed error
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
    }
});

// Start the Nosa server on port 3001
app.listen(PORT, () => {
    console.log(`Nosa chatbot server running on port ${PORT}`);
});
