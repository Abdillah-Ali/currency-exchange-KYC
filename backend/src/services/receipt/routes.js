const express = require('express');
const router = express.Router();

// Receipt Routes
router.post('/generate', (req, res) => {
    res.json({ message: 'Receipt generated', url: '/receipts/123.pdf' });
});

module.exports = router;
