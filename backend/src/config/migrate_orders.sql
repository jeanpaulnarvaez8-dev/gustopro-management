-- Riva Beach Management System - Orders & Transactions Schema

-- 1. Orders (Table Sessions)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES tables(id),
    waiter_id UUID REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('open', 'completed', 'cancelled', 'parked')) DEFAULT 'open',
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'cooking', 'served', 'cancelled')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Order Item Modifiers (Selected variants for a specific item in an order)
CREATE TABLE IF NOT EXISTS order_item_modifiers (
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    modifier_id UUID REFERENCES modifiers(id),
    price_extra DECIMAL(10,2) DEFAULT 0.00,
    PRIMARY KEY (order_item_id, modifier_id)
);

-- 4. Initial Trigger for table status update (Optional, but good for logic)
-- When an order is created for a table, the table becomes 'occupied'
-- (We'll handle this in the controller logic for simplicity in this MVP)
