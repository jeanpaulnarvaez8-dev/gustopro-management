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
        const result = await db.query('SELECT * FROM tables');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getZones, getTables };
