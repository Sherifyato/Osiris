const express = require('express');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3000;  // This will run on port 3000

// Middleware to serve static files like CSS, JS
app.use(express.static(path.join(__dirname, 'static')));

// Endpoint to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dir , 'templates', 'index.html'));
});

// Example CSV data loader
function loadAndTransformData() {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream('exoplanet_data.csv')
            .pipe(csv())
            .on('data', (row) => {
                const ra = parseFloat(row['ra']);
                const dec = parseFloat(row['dec']);
                const sy_dist = parseFloat(row['sy_dist']) || 1;

                const raRad = (ra * Math.PI) / 180;
                const decRad = (dec * Math.PI) / 180;

                const x = sy_dist * Math.cos(decRad) * Math.cos(raRad);
                const y = sy_dist * Math.cos(decRad) * Math.sin(raRad);
                const z = sy_dist * Math.sin(decRad);

                results.push({ pl_name: row['pl_name'], x, y, z });
            })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

// Endpoint for exoplanet data
app.get('/exoplanet_data', async (req, res) => {
    try {
        const data = await loadAndTransformData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server on port 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
