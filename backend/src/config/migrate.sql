-- Riva Beach Management System - Initial Schema

-- 1. Users & Roles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    pin VARCHAR(6) NOT NULL UNIQUE,
    role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'waiter', 'kitchen', 'cashier')),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Floor Plan & Tables
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    layout_data JSONB
);

CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES zones(id),
    table_number VARCHAR(10) NOT NULL,
    seats INTEGER NOT NULL,
    position_x FLOAT,
    position_y FLOAT,
    status VARCHAR(20) CHECK (status IN ('free', 'occupied', 'parked', 'dirty', 'reserved')) DEFAULT 'free'
);

-- 3. Menu & Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER,
    tax_rate DECIMAL(5,2) DEFAULT 10.00
);

CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    preparation_time_mins INTEGER
);

-- Seed Initial Data
INSERT INTO users (name, pin, role) VALUES ('Admin', '0000', 'admin') ON CONFLICT (pin) DO NOTHING;
INSERT INTO users (name, pin, role) VALUES ('Marco Rossi', '1234', 'waiter') ON CONFLICT (pin) DO NOTHING;

INSERT INTO zones (name) VALUES ('Terrazza Panoramica'), ('Sala Cristallo') ON CONFLICT DO NOTHING;
