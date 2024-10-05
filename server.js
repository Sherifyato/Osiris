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
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Example CSV data loader
function loadAndTransformData() {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream('NASAfeatures.csv')
            .pipe(csv())
            .on('data', (row) => {
                const ra = parseFloat(row['ra']);
                const dec = parseFloat(row['dec']);
                const sy_dist = parseFloat(row['sy_dist']) || 1;
                let PSI = parseFloat(row['PSI']);
                let colourFromPSI = 0x000000;
                // psi [-1, 1] -> -1 is red, 1 is blue and alternating in between
                let blue, red;
                if (PSI < 0) {
                    red = Math.abs(PSI);
                    blue = 1 - red;
                    blue *= 255;
                    red *= 255;
                } else {
                    blue = PSI
                    red = 1 - blue;
                    blue *= 255;
                    red *= 255;
                }
                colourFromPSI = Math.round(red) << 16 | Math.round(blue);

                const raRad = (ra * Math.PI) / 180;
                const decRad = (dec * Math.PI) / 180;

                const x = sy_dist * Math.cos(decRad) * Math.cos(raRad);
                const y = sy_dist * Math.cos(decRad) * Math.sin(raRad);
                const z = sy_dist * Math.sin(decRad);
                console.log(PSI, colourFromPSI);
                results.push({pl_name: row['pl_name'], x, y, z,colourFromPSI});
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
        res.status(500).json({error: error.message});
    }
});
app.use('/static', express.static(path.join(__dirname, 'static')));

// Start the server on port 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
