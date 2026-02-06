const db = require('./src/db');

const currencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', buy: 2520, sell: 2480, stock: 150000 },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', buy: 2750, sell: 2700, stock: 80000 },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧', buy: 3180, sell: 3120, stock: 45000 },
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', buy: 686, sell: 675, stock: 200000 },
    { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', buy: 672, sell: 660, stock: 0 },
    { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', buy: 19.5, sell: 18.8, stock: 5000000 },
];

async function seed() {
    try {
        for (const c of currencies) {
            await db.query(
                `INSERT INTO currencies (code, name, flag_emoji, buy_rate, sell_rate, stock_amount) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (code) DO UPDATE SET 
            buy_rate = EXCLUDED.buy_rate, 
            sell_rate = EXCLUDED.sell_rate, 
            stock_amount = EXCLUDED.stock_amount`,
                [c.code, c.name, c.flag, c.buy, c.sell, c.stock]
            );
        }
        console.log('✅ Currencies seeded successfully');
        process.exit(0);
    } catch (e) {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    }
}

seed();
