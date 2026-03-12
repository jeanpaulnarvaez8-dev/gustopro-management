-- Riva Beach Management System - Menu & Modifiers Schema

-- Categories are already in the base schema, but let's ensure they are there
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER,
    tax_rate DECIMAL(5,2) DEFAULT 10.00
);

-- Modifier Groups (e.g., "Cottura Carne", "Aggiunte", "Senza Ingredienti")
CREATE TABLE IF NOT EXISTS modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    min_selection INTEGER DEFAULT 0,
    max_selection INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT false
);

-- Modifiers (e.g., "Al sangue", "Ben cotta", "Extra Pomodoro")
CREATE TABLE IF NOT EXISTS modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_extra DECIMAL(10,2) DEFAULT 0.00
);

-- Link Menu Items to Modifier Groups
CREATE TABLE IF NOT EXISTS item_modifier_groups (
    item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, group_id)
);

-- Seed some Categories
INSERT INTO categories (name, sort_order) VALUES 
('Antipasti', 1),
('Secondi', 2),
('Pizzeria', 3),
('Bar & Drink', 4)
ON CONFLICT DO NOTHING;

-- Seed some Modifier Groups
INSERT INTO modifier_groups (name, min_selection, max_selection, is_required) VALUES 
('Cottura Carne', 1, 1, true),
('Aggiunte Pizza', 0, 5, false),
('Varianti Drink', 0, 3, false)
ON CONFLICT DO NOTHING;
