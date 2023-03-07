const { Pool } = require("pg")

// const pool = new Pool({
// 	user: "postgres",
// 	host: "localhost",
// 	database: "TimeControl",
// 	password: "12345678",
// 	port: 5432,
// })
const pool = new Pool({
	user: "dba",
	host: "172.16.3.158",
	database: "skud_va",
	password: "!QAZ2wsx",
	port: 5442,
})

module.exports = pool
