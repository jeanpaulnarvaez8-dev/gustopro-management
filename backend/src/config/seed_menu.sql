-- Riva Beach Menu Seeding (High Fidelity)

-- 1. Get Category IDs (assuming they exist from previous migration)
-- Antipasti, Secondi, Pizzeria, Bar & Drink

-- 2. Insert Menu Items
INSERT INTO menu_items (category_id, name, description, base_price, preparation_time_mins) 
VALUES 
((SELECT id FROM categories WHERE name = 'Pizzeria'), 'Puccia Salentina', 'Puccia artigianale con capocollo, caciocavallo e pomodori secchi.', 9.00, 10),
((SELECT id FROM categories WHERE name = 'Secondi'), 'Grigliata di Pesce', 'Selezione di pescato del giorno alla brace.', 22.00, 20),
((SELECT id FROM categories WHERE name = 'Bar & Drink'), 'Spritz Riva', 'La nostra variante dello spritz classico con frutti di bosco.', 8.00, 5)
ON CONFLICT DO NOTHING;

-- 3. Link Modifiers to Items
-- For Puccia Salentina: Add Aggiunte Pizza group
INSERT INTO item_modifier_groups (item_id, group_id) 
SELECT m.id, mg.id 
FROM menu_items m, modifier_groups mg 
WHERE m.name = 'Puccia Salentina' AND mg.name = 'Aggiunte Pizza'
ON CONFLICT DO NOTHING;

-- For Grigliata: Add Cottura group
INSERT INTO item_modifier_groups (item_id, group_id) 
SELECT m.id, mg.id 
FROM menu_items m, modifier_groups mg 
WHERE m.name = 'Grigliata di Pesce' AND mg.name = 'Cottura Carne' -- Using same for fish just for seed
ON CONFLICT DO NOTHING;

-- Add some specific modifier options
INSERT INTO modifiers (group_id, name, price_extra) VALUES 
((SELECT id FROM modifier_groups WHERE name = 'Aggiunte Pizza'), 'Extra Burrata', 2.50),
((SELECT id FROM modifier_groups WHERE name = 'Aggiunte Pizza'), 'Senza Pomodori Secchi', 0.00),
((SELECT id FROM modifier_groups WHERE name = 'Cottura Carne'), 'Ben Cotta', 0.00),
((SELECT id FROM modifier_groups WHERE name = 'Cottura Carne'), 'Al Sangue', 0.00)
ON CONFLICT DO NOTHING;
