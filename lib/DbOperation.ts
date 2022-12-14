import {Connection, Pool, PoolConnection} from "mysql2";
import ErrnoException = NodeJS.ErrnoException;
require('dotenv').config()

const mysql = require('mysql2/promise');
let dbConfig = {
  host: process.env.REMINDER_AUTH_DB_FORWARD_HOST,
  port: process.env.REMINDER_AUTH_DB_FORWARD_PORT,
  user: process.env.REMINDER_AUTH_DB_USERNAME,
  database: process.env.REMINDER_AUTH_DB_DATABASE,
  password: process.env.REMINDER_AUTH_DB_ROOT_PASSWORD
}

/**
 * await dbConn.execute('INSERT INTO bet_gtask (bet_ident, create_at, update_at, g_task_json, begin_balance, last_balance) VALUES (?, ?, ?, ?, ?, ?);', insertDataArr);
 * */
function getDbConn(): Promise<[Connection,Pool]> {
  return mysql.createConnection(dbConfig)
}

module.exports = {
  getDbConn
}