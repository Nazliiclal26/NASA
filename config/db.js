// config/db.js
const loadEnv = require('./loadEnv');
loadEnv(); 
const { Pool } = require('pg');

// const pool = new Pool({
//     user: process.env.user,
//     host: process.env.host,
//     database: process.env.database,
//     password: process.env.password,
//     port: process.env.port
// });

//
 
let hostname;
let databaseConfig;
if (process.env.NODE_ENV == "production") {
	hostname = "0.0.0.0";
	databaseConfig = { connectionString: process.env.DATABASE_URL };
} else {
	hostname = "localhost";
	let { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT } = process.env;
	databaseConfig = { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT };
}

let pool = new Pool(databaseConfig);


module.exports = pool;
