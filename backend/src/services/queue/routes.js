const express = require('express');
const db = require('../../db');
const { logAudit } = require('../../db/audit');
const router = express.Router();

module.exports = (io) => {

    // POST /queue/join - Register a customer
    router.post('/join', async (req, res) => {
        const { full_name, phone_number, id_type, id_number, transaction_type, currency_code, active_amount } = req.body;

        try {
            await db.query('BEGIN');

            // 1. Find or Create Customer
            let customerRes = await db.query('SELECT id FROM customers WHERE id_number = $1', [id_number]);
            let customer_id;

            if (customerRes.rows.length > 0) {
                customer_id = customerRes.rows[0].id;
            } else {
                const insertCust = await db.query(
                    `INSERT INTO customers (full_name, phone_number, id_type, id_number) 
           VALUES ($1, $2, $3, $4) RETURNING id`,
                    [full_name, phone_number, id_type, id_number]
                );
                customer_id = insertCust.rows[0].id;
            }

            // 2. Create Queue Entry
            // Generate Ticket Number (simplified logic)
            const countRes = await db.query('SELECT COUNT(*) FROM queue_entries WHERE created_at::date = CURRENT_DATE');
            const ticketNum = `A${parseInt(countRes.rows[0].count) + 100}`;

            const queueRes = await db.query(
                `INSERT INTO queue_entries (ticket_number, customer_id, service_type, currency_code, requested_amount, status)
         VALUES ($1, $2, $3, $4, $5, 'waiting') RETURNING *`,
                [ticketNum, customer_id, transaction_type, currency_code, active_amount]
            );

            await db.query('COMMIT');

            // Log the action
            await logAudit(null, 'QUEUE_JOIN', { ticket: ticketNum, customer_id });

            // Notify Tellers via Websocket
            io.emit('queue_update', { event: 'new_customer', data: queueRes.rows[0] });

            res.status(201).json({
                message: 'Joined queue successfully',
                ticket: ticketNum,
                estimated_wait: 10 // Mock logic
            });

        } catch (e) {
            await db.query('ROLLBACK');
            res.status(500).json({ error: e.message });
        }
    });

    // GET /queue/list - For display boards
    router.get('/list', async (req, res) => {
        try {
            const result = await db.query(
                `SELECT q.id, q.ticket_number, q.status, q.service_type, q.currency_code, q.requested_amount, 
                        c.full_name, c.phone_number, c.id_type, c.id_number
                 FROM queue_entries q
                 JOIN customers c ON q.customer_id = c.id
                 WHERE q.status IN ('waiting', 'processing')
                 ORDER BY q.created_at ASC`
            );
            res.json(result.rows);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    return router;
};
