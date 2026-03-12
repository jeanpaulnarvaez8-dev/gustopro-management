const db = require('../config/db');

const generatePreConto = async (req, res) => {
    const { orderId } = req.params;
    try {
        const query = `
            SELECT o.id, o.table_id, t.table_number, o.total_amount,
                   json_agg(json_build_object(
                       'name', mi.name,
                       'quantity', oi.quantity,
                       'price', oi.unit_price,
                       'subtotal', oi.subtotal,
                       'modifiers', (
                           SELECT json_agg(json_build_object('name', m.name, 'price', oim.price_extra))
                           FROM order_item_modifiers oim
                           JOIN modifiers m ON oim.modifier_id = m.id
                           WHERE oim.order_item_id = oi.id
                       )
                   )) as items
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE o.id = $1
            GROUP BY o.id, t.table_number
        `;
        const result = await db.query(query, [orderId]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const processPayment = async (req, res) => {
    const { orderId, amount, method, isSplit, splitCount } = req.body;
    
    try {
        await db.query('BEGIN');

        // 1. Record the Payment
        await db.query(
            'INSERT INTO payments (order_id, amount, payment_method) VALUES ($1, $2, $3)',
            [orderId, amount, method]
        );

        // 2. Create Receipt Record (simplified for MVP)
        await db.query(
            'INSERT INTO receipts (order_id, total_amount, is_split, split_count) VALUES ($1, $2, $3, $4)',
            [orderId, amount, isSplit || false, splitCount || 1]
        );

        // 3. Update Order and Table Statuses
        await db.query('UPDATE orders SET status = \'completed\', payment_status = \'paid\' WHERE id = $1', [orderId]);
        
        const orderResult = await db.query('SELECT table_id FROM orders WHERE id = $1', [orderId]);
        if (orderResult.rows[0]) {
            await db.query('UPDATE tables SET status = \'dirty\' WHERE id = $1', [orderResult.rows[0].table_id]);
        }

        await db.query('COMMIT');

        // Notify client via socket
        const io = req.app.get('io');
        io.emit('order-settled', { orderId });

        res.json({ success: true, message: 'Payment processed successfully' });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Payment failed' });
    }
};

module.exports = { generatePreConto, processPayment };
