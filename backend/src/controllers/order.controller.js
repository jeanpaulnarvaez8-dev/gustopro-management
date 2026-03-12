const db = require('../config/db');

const submitOrder = async (req, res) => {
    const { tableId, waiterId, items, totalAmount } = req.body;
    
    // We use a transaction to ensure all-or-nothing submission
    try {
        await db.query('BEGIN');

        // 1. Create the Order (Session)
        const orderResult = await db.query(
            'INSERT INTO orders (table_id, waiter_id, total_amount) VALUES ($1, $2, $3) RETURNING id',
            [tableId, waiterId, totalAmount]
        );
        const orderId = orderResult.rows[0].id;

        // 2. Insert Items and their Modifiers
        for (const item of items) {
            const itemResult = await db.query(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [orderId, item.id, 1, item.base_price, item.base_price, item.notes || '']
            );
            const orderItemId = itemResult.rows[0].id;

            if (item.selectedModifiers && item.selectedModifiers.length > 0) {
                for (const mod of item.selectedModifiers) {
                    await db.query(
                        'INSERT INTO order_item_modifiers (order_item_id, modifier_id, price_extra) VALUES ($1, $2, $3)',
                        [orderItemId, mod.id, mod.price || 0]
                    );
                }
            }
        }

        // 3. Update Table Status to 'occupied'
        await db.query('UPDATE tables SET status = \'occupied\' WHERE id = $1', [tableId]);

        await db.query('COMMIT');

        // 4. Emit Socket Event for Kitchen
        // We'll access io from the app instance
        const io = req.app.get('io');
        io.emit('new-order', { orderId, tableId, items, totalAmount });

        res.status(201).json({ success: true, orderId });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error("Order Submission Error:", err);
        res.status(500).json({ error: 'Failed to submit order', details: err.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { submitOrder, getOrders };
