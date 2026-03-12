-- Riva Beach Management System - Payments & Billings Schema

-- 1. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'digital')),
    status VARCHAR(20) DEFAULT 'paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Receipts (Pre-conti)
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    waiter_id UUID REFERENCES users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    is_split BOOLEAN DEFAULT false,
    split_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update orders table to include a payment_status
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid';
