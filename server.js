const express = require('express');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
//env
require('dotenv').config()
//db.js

const {MongoClient, ServerApiVersion} = require('mongodb');
const uri = process.env.MONGODB_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ping: 1});
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        ;
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
// Middleware to serve static files (like CSS, JS)
app.use(express.static(path.join(__dirname, 'static')));

// Helper function to load and transform CSV data
function loadAndTransformData() {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream('exoplanet_data.csv')
            .pipe(csv())
            .on('data', (row) => {
                // Ensure 'ra', 'dec', and 'sy_dist' are valid
                if (row['ra'] && row['dec'] && row['sy_dist']) {
                    const ra = parseFloat(row['ra']);
                    const dec = parseFloat(row['dec']);
                    const sy_dist = parseFloat(row['sy_dist']) || 1; // Default to 1 if invalid

                    // Convert to radians
                    const raRad = (ra * Math.PI) / 180;
                    const decRad = (dec * Math.PI) / 180;

                    // Calculate Cartesian coordinates
                    const x = sy_dist * Math.cos(decRad) * Math.cos(raRad);
                    const y = sy_dist * Math.cos(decRad) * Math.sin(raRad);
                    const z = sy_dist * Math.sin(decRad);
                    const distance = (x, y, z) => {
                        dis = Math.sqrt(x * x + y * y + z * z);
                        return Math.round(dis * 100) / 100;
                    }

                    // Push the transformed data
                    results.push({
                        pl_name: row['pl_name'] || 'Unknown',
                        x,
                        y,
                        z,
                        distance: distance(x, y, z)
                    });
                }
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

function loadExoplanetData() {
    // read from mongodb
    const results = [];
    const collection = client.db("exoplanet_data").collection("exoplanets");

}

app.get('/exoplanet_data', async (req, res) => {
    try {
        const data = await loadAndTransformData();
        res.json(data);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/favicon.ico', (greq, res) => {
    res.status(204);
});