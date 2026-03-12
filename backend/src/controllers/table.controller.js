const db = require('../config/db');

const getZones = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM zones');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getTables = async (req, res) => {
    try {
        const query = `
            SELECT t.*, 
                   (SELECT id FROM orders WHERE table_id = t.id AND status = 'open' ORDER BY created_at DESC LIMIT 1) as active_order_id
            FROM tables t
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getZones, getTables };
