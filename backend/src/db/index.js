const { Pool } = require('pg');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'bdc_system',
    password: String(process.env.DB_PASSWORD || ''),
    port: Number(process.env.DB_PORT || 5432),
};

const pool = new Pool(config);

pool.on('connect', () => {
    console.log('✅ PostgreSQL Pool Connected');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
