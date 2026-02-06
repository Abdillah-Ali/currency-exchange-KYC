const bcrypt = require('bcryptjs');
const db = require('./src/db');

async function seed() {
    try {
        const hash = await bcrypt.hash('password123', 10);
        await db.query(
            `INSERT INTO users (username, password_hash, full_name, role, station_number) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name`,
            ['teller1', hash, 'Main Teller', 'teller', 'ST-01']
        );
        console.log('✅ Default teller created: teller1 / password123');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seed();
