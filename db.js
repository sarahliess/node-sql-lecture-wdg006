const { Pool } = require("pg");

const connectionString = process.env.PG_CONNECTIONSTRING;

const pool = new Pool({
  //   user: process.env.DB_USER,
  //   host: process.env.DB_HOST,
  //   database: process.env.DB_NAME,
  //   password: process.env.DB_PASS,
  //   port: process.env.DB_PORT,
  connectionString,
});

console.log("db", connectionString);

module.exports = pool;
