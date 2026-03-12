const db = require('../config/db');

const getPendingOrders = async (req, res) => {
    try {
        const query = `
            SELECT o.id as order_id, o.table_id, t.table_number, o.created_at,
                   json_agg(json_build_object(
                       'id', oi.id,
                       'menu_item_name', mi.name,
                       'quantity', oi.quantity,
                       'status', oi.status,
                       'notes', oi.notes,
                       'modifiers', (
                           SELECT json_agg(json_build_object('name', m.name))
                           FROM order_item_modifiers oim
                           JOIN modifiers m ON oim.modifier_id = m.id
                           WHERE oim.order_item_id = oi.id
                       )
                   )) as items
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN menu_items mi ON oi.menu_item_id = mi.name -- Wait, matching by name is risky, use ID
            JOIN menu_items mi_real ON oi.menu_item_id = mi_real.id
            WHERE o.status = 'open' AND oi.status != 'served'
            GROUP BY o.id, t.table_number
            ORDER BY o.created_at ASC
        `;
        // Fixing the join logic in a cleaner query below
        const fixedQuery = `
            SELECT o.id as order_id, o.table_id, t.table_number, o.created_at,
                   json_agg(json_build_object(
                       'id', oi.id,
                       'menu_item_name', mi.name,
                       'quantity', oi.quantity,
                       'status', oi.status,
                       'notes', oi.notes,
                       'modifiers', COALESCE((
                           SELECT json_agg(json_build_object('name', m.name))
                           FROM order_item_modifiers oim
                           JOIN modifiers m ON oim.modifier_id = m.id
                           WHERE oim.order_item_id = oi.id
                       ), '[]'::json)
                   )) as items
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE o.status = 'open' AND oi.status != 'served'
            GROUP BY o.id, t.table_number
            ORDER BY o.created_at ASC
        `;
        const result = await db.query(fixedQuery);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateItemStatus = async (req, res) => {
    const { itemId } = req.params;
    const { status } = req.body; // 'pending', 'cooking', 'served'

    try {
        const result = await db.query(
            'UPDATE order_items SET status = $1 WHERE id = $2 RETURNING *',
            [status, itemId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Notify all clients about the status change
        const io = req.app.get('io');
        io.emit('item-status-updated', { itemId, status });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getPendingOrders, updateItemStatus };
