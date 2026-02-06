const express = require('express');
const router = express.Router();

// Simple KYC Routes
router.post('/verify', (req, res) => {
    res.json({ status: 'verified', risk: 'low' });
});

module.exports = router;
