const express = require('express');
const db = require('../../db');
const { logAudit } = require('../../db/audit');
const { authenticateToken } = require('../../middleware/auth');
const router = express.Router();

module.exports = (io) => {
    // Apply auth middleware to all routes in this router
    router.use(authenticateToken);

    // GET /teller/dashboard
    router.get('/dashboard', async (req, res) => {
        // Return Teller specific stats
        res.json({ message: "Teller Dashboard Data" });
    });

    // POST /teller/call-next
    router.post('/call-next', async (req, res) => {
        const { teller_id } = req.body;

        try {
            // Find oldest waiting customer
            const result = await db.query(
                `UPDATE queue_entries 
         SET status = 'processing', assigned_teller_id = $1, called_at = NOW()
         WHERE id = (
           SELECT id FROM queue_entries 
           WHERE status = 'waiting' 
           ORDER BY created_at ASC 
           LIMIT 1
         )
         RETURNING *`,
                [teller_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No customers in waiting queue' });
            }

            const ticket = result.rows[0];
            io.emit('queue_update', { event: 'called', ticket });

            res.json({ message: 'Customer called', ticket });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // POST /teller/transaction - Execute and Complete transaction
    router.post('/transaction', async (req, res) => {
        const { queue_id, teller_id, actual_amount, actual_rate } = req.body;

        try {
            await db.query('BEGIN');

            // 1. Get Queue Entry and Currency Info
            const qRes = await db.query(
                `SELECT q.*, c.buy_rate, c.sell_rate, c.stock_amount, c.min_stock_alert 
                 FROM queue_entries q 
                 JOIN currencies c ON q.currency_code = c.code 
                 WHERE q.id = $1 FOR UPDATE`, [queue_id]
            );

            if (qRes.rows.length === 0) throw new Error('Queue entry not found');
            const q = qRes.rows[0];

            // 2. Calculate local amount and update inventory
            const amount_foreign = actual_amount || q.requested_amount;
            const rate = actual_rate || (q.service_type === 'buy' ? q.buy_rate : q.sell_rate);
            const amount_local = amount_foreign * rate;

            // Inventory logic: 
            // 'buy' = Customer sells foreign to us -> inventory INCREASES
            // 'sell' = Customer buys foreign from us -> inventory DECREASES
            const stockChange = q.service_type === 'buy' ? amount_foreign : -amount_foreign;
            const newStock = parseFloat(q.stock_amount) + stockChange;

            if (newStock < 0) throw new Error(`Insufficient stock for ${q.currency_code}`);

            // 3. Update Currency Stock
            await db.query(
                'UPDATE currencies SET stock_amount = $1, updated_at = NOW() WHERE code = $2',
                [newStock, q.currency_code]
            );

            // 4. Create Transaction Record
            const transRef = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const isSuspicious = amount_foreign >= 5000; // Simplified AML threshold

            const transRes = await db.query(
                `INSERT INTO transactions 
                (transaction_reference, queue_id, teller_id, customer_id, type, currency_code, amount_foreign, exchange_rate, amount_local, is_suspicious)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [transRef, q.id, teller_id, q.customer_id, q.service_type, q.currency_code, amount_foreign, rate, amount_local, isSuspicious]
            );

            // 5. Update Queue Status
            await db.query(
                "UPDATE queue_entries SET status = 'completed', completed_at = NOW() WHERE id = $1",
                [q.id]
            );

            // 6. Check for low stock alert
            if (newStock <= q.min_stock_alert) {
                await db.query(
                    "INSERT INTO notifications (type, message, recipient_role) VALUES ($1, $2, $3)",
                    ['low_cash', `Low stock for ${q.currency_code}: Only ${newStock} remains.`, 'admin']
                );
            }

            await db.query('COMMIT');

            // 7. Audit Log
            await logAudit(teller_id, 'TRANSACTION_EXECUTE', {
                trans_id: transRes.rows[0].id,
                ticket: q.ticket_number,
                amount: amount_foreign,
                currency: q.currency_code
            });

            io.emit('queue_update', { event: 'completed', queue_id: q.id });
            res.json({ message: 'Transaction successful', transaction: transRes.rows[0] });

        } catch (e) {
            await db.query('ROLLBACK');
            res.status(500).json({ error: e.message });
        }
    });

    // GET /teller/history - View completed transactions
    router.get('/history', async (req, res) => {
        try {
            const result = await db.query(
                `SELECT t.*, c.full_name 
                 FROM transactions t 
                 JOIN customers c ON t.customer_id = c.id 
                 WHERE t.teller_id = $1 
                 ORDER BY t.created_at DESC LIMIT 20`,
                [req.user.id]
            );
            res.json(result.rows);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    return router;
};
