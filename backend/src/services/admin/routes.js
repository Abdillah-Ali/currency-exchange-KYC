const express = require('express');
const router = express.Router();
const db = require('../../db');

// Admin Routes
router.get('/inventory', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM currencies');
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
