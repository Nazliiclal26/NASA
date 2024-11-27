// config/loadEnv.js
const fs = require('fs');
const path = require('path');

const loadEnv = () => {
    const envPath = path.resolve(__dirname, '../env.json');
    const rawData = fs.readFileSync(envPath, 'utf-8'); // Read env.json file
    const envConfig = JSON.parse(rawData); // Parse JSON to an object

    // Assign each key-value pair to process.env
    for (const key in envConfig) {
        if (envConfig.hasOwnProperty(key)) {
            process.env[key] = envConfig[key];
        }
    }
};

module.exports = loadEnv;
