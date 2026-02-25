require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to DB');
        client.query('SELECT NOW()', (err, result) => {
            release();
            if (err) {
                console.error('Query error', err.stack);
            } else {
                console.log('Query result:', result.rows);
            }
            pool.end();
        });
    }
});
