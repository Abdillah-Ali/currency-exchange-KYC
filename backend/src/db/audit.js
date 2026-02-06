const db = require('./index');

/**
 * Log a critical system or user action.
 * @param {number|null} user_id - The ID of the user performing the action.
 * @param {string} action - Describe the action (e.g., 'TRANSACTION_EXECUTE').
 * @param {object} details - Any metadata related to the action.
 */
async function logAudit(user_id, action, details = {}) {
    try {
        await db.query(
            'INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)',
            [user_id, action, JSON.stringify(details)]
        );
    } catch (e) {
        console.error('Audit Logging Failed:', e);
    }
}

module.exports = { logAudit };
