const db = require('../config/db');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { pin } = req.body;
    
    try {
        const result = await db.query('SELECT id, name, role FROM users WHERE pin = $1 AND status = \'active\'', [pin]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'PIN non valido' });
        }
        
        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'somesecretkey',
            { expiresIn: '12h' }
        );
        
        res.json({ user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, role, status FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { login, getUsers };
