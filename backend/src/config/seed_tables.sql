-- Riva Beach Table Seeding

-- 1. Insert some tables into Terrazza Panoramica
INSERT INTO tables (zone_id, table_number, seats, position_x, position_y) 
SELECT id, '101', 4, 100, 100 FROM zones WHERE name = 'Terrazza Panoramica'
UNION ALL
SELECT id, '102', 2, 250, 100 FROM zones WHERE name = 'Terrazza Panoramica'
UNION ALL
SELECT id, '103', 6, 400, 100 FROM zones WHERE name = 'Terrazza Panoramica'
ON CONFLICT DO NOTHING;

-- 2. Insert some tables into Sala Cristallo
INSERT INTO tables (zone_id, table_number, seats, position_x, position_y) 
SELECT id, '201', 4, 100, 300 FROM zones WHERE name = 'Sala Cristallo'
UNION ALL
SELECT id, '202', 4, 250, 300 FROM zones WHERE name = 'Sala Cristallo'
ON CONFLICT DO NOTHING;
