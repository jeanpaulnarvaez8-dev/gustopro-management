const db = require('../config/db');

const getCategories = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categories ORDER BY sort_order ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getMenuItems = async (req, res) => {
    const { categoryId } = req.query;
    try {
        let query = `
            SELECT m.*, c.name as category_name 
            FROM menu_items m
            JOIN categories c ON m.category_id = c.id
            WHERE m.is_available = true
        `;
        const params = [];

        if (categoryId) {
            query += ' AND m.category_id = $1';
            params.push(categoryId);
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getItemModifiers = async (req, res) => {
    const { itemId } = req.params;
    try {
        const query = `
            SELECT mg.id as group_id, mg.name as group_name, mg.min_selection, mg.max_selection, mg.is_required,
                   json_agg(json_build_object('id', mod.id, 'name', mod.name, 'price', mod.price_extra)) as options
            FROM item_modifier_groups img
            JOIN modifier_groups mg ON img.group_id = mg.id
            JOIN modifiers mod ON mg.id = mod.group_id
            WHERE img.item_id = $1
            GROUP BY mg.id
        `;
        const result = await db.query(query, [itemId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getCategories, getMenuItems, getItemModifiers };
