// testEnv.js
const loadEnv = require('../config/loadEnv'); 
loadEnv();

console.log('DB_USER:', process.env.user);
console.log('DB_HOST:', process.env.host);
console.log('DB_DATABASE:', process.env.database);
console.log('DB_PASSWORD:', process.env.password);
console.log('DB_PORT:', process.env.port);
