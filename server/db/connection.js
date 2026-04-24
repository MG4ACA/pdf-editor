/**
 * server/db/connection.js
 * ────────────────────────
 * Creates and exports a MySQL2 connection pool.
 * Also provides schema initialisation (runs once on startup).
 */

'use strict';

const mysql = require('mysql2/promise');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pdf_editor',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // Prevent SQL injection via parameterised queries – enforced here too
      namedPlaceholders: true,
    });
  }
  return pool;
}

/**
 * Verify connectivity and create the `edit_events` table if it does not exist.
 */
async function testConnection() {
  const db = getPool();
  const conn = await db.getConnection();
  try {
    await conn.ping();
    console.log('[db] MySQL connection verified.');

    // Idempotent table creation – only simple event log, no user PII
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS edit_events (
        id          BIGINT       UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        action      VARCHAR(64)  NOT NULL,
        masked_ip   VARCHAR(20)  NOT NULL,
        created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_action     (action),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('[db] Schema ready.');
  } finally {
    conn.release();
  }
}

module.exports = { getPool, testConnection };
