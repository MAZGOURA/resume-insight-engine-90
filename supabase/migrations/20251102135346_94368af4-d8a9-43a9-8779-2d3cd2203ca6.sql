-- Insert test data for the e-commerce store with proper UUIDs

-- Insert Collections
INSERT INTO collections (id, name, slug, description, is_active, sort_order) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Summer Collection', 'summer-collection', 'Fresh and light fragrances perfect for summer', true, 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Winter Collection', 'winter-collection', 'Warm and cozy scents for winter', true, 2),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Luxury Collection', 'luxury-collection', 'Premium luxury fragrances', true, 3),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Bestsellers', 'bestsellers', 'Our most popular fragrances', true, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert Products with gen_random_uuid() and store them in a temp table
CREATE TEMP TABLE temp_products AS
WITH inserted_products AS (
  INSERT INTO products (name, slug, description, short_description, price, compare_price, cost_price, sku, image_url, category_id, brand_id, stock_quantity, is_active, featured, notes, size) VALUES
  -- Perfumes
  ('Midnight Oud', 'midnight-oud', 'A sophisticated blend of oud wood and amber, perfect for evening wear. This luxurious fragrance combines the richness of Arabian oud with warm amber notes.', 'Sophisticated oud and amber blend', 189.99, 249.99, 95.00, 'PERF-001', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 50, true, true, ARRAY['Oud', 'Amber', 'Sandalwood', 'Leather'], '100ml'),
  ('Rose Éternelle', 'rose-eternelle', 'An elegant rose fragrance with hints of jasmine and vanilla. A timeless classic that embodies romance and sophistication.', 'Elegant rose with jasmine', 165.00, 215.00, 82.00, 'PERF-002', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=400&h=500&fit=crop', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 35, true, true, ARRAY['Rose', 'Jasmine', 'Vanilla', 'Musk'], '75ml'),
  ('Velvet Night', 'velvet-night', 'Sensual and mysterious, with deep floral and oriental notes. Perfect for special occasions and evening events.', 'Sensual oriental blend', 199.99, 259.99, 100.00, 'PERF-003', 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=500&fit=crop', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 28, true, true, ARRAY['Tuberose', 'Patchouli', 'Vanilla', 'Tonka Bean'], '50ml'),
  ('Golden Hour', 'golden-hour', 'Warm and inviting with amber and spice. Captures the magic of sunset in a bottle.', 'Warm amber and spice', 175.00, 225.00, 87.00, 'PERF-004', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=500&fit=crop', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 25, true, false, ARRAY['Amber', 'Cinnamon', 'Cardamom', 'Honey'], '75ml'),
  -- Colognes
  ('Ocean Breeze', 'ocean-breeze', 'Fresh aquatic notes perfect for daily wear. Invigorating and clean, like a walk by the sea.', 'Fresh aquatic daily wear', 145.00, 189.99, 72.00, 'COL-001', 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&h=500&fit=crop', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 60, true, true, ARRAY['Sea Salt', 'Mint', 'Sage', 'Cedar'], '100ml'),
  ('Citrus Haven', 'citrus-haven', 'A refreshing citrus blend that energizes your day. Bright and uplifting with Mediterranean citrus notes.', 'Refreshing citrus blend', 129.99, 169.99, 65.00, 'COL-002', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=500&fit=crop', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 42, true, true, ARRAY['Bergamot', 'Lemon', 'Orange', 'Neroli'], '100ml'),
  ('Urban Legend', 'urban-legend', 'Modern and sophisticated cologne for the contemporary man. Bold and confident.', 'Modern sophisticated blend', 155.00, 199.99, 77.00, 'COL-003', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=500&fit=crop', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 38, true, false, ARRAY['Lavender', 'Vetiver', 'Tobacco', 'Leather'], '100ml'),
  -- Body Sprays
  ('Fresh Cotton', 'fresh-cotton', 'Light and airy body spray with the scent of fresh laundry. Perfect for everyday freshness.', 'Clean fresh cotton scent', 29.99, 39.99, 15.00, 'BODY-001', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 100, true, true, ARRAY['Cotton', 'Linen', 'Musk'], '200ml'),
  ('Tropical Paradise', 'tropical-paradise', 'Exotic fruity body spray with tropical notes. Summer in a bottle.', 'Exotic tropical fruits', 34.99, 44.99, 17.00, 'BODY-002', 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=500&fit=crop', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 85, true, false, ARRAY['Pineapple', 'Coconut', 'Mango', 'Passion Fruit'], '200ml'),
  ('Sport Energy', 'sport-energy', 'Energizing body spray for active lifestyles. Fresh and invigorating.', 'Energizing sport fresh', 32.99, 42.99, 16.00, 'BODY-003', 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 120, true, true, ARRAY['Citrus', 'Mint', 'Green Tea'], '200ml'),
  -- More variety
  ('Noir Elegance', 'noir-elegance', 'Deep and sophisticated with notes of black orchid and dark chocolate.', 'Sophisticated dark fragrance', 210.00, 275.00, 105.00, 'PERF-005', 'https://images.unsplash.com/photo-1528991435120-e73e05a58897?w=400&h=500&fit=crop', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 30, true, true, ARRAY['Black Orchid', 'Dark Chocolate', 'Patchouli'], '100ml'),
  ('Lavender Dreams', 'lavender-dreams', 'Calming lavender with hints of chamomile for a relaxing experience.', 'Calming lavender blend', 139.99, 179.99, 70.00, 'COL-004', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=500&fit=crop', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 45, true, false, ARRAY['Lavender', 'Chamomile', 'Vanilla'], '100ml')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id, sku
)
SELECT * FROM inserted_products;

-- Insert Product Collections relationships using the temp table
INSERT INTO product_collections (product_id, collection_id)
SELECT p.id, 'dddddddd-dddd-dddd-dddd-dddddddddddd'
FROM temp_products p
WHERE p.sku IN ('PERF-001', 'PERF-002', 'COL-001', 'COL-002', 'BODY-001', 'BODY-003')
ON CONFLICT (product_id, collection_id) DO NOTHING;

INSERT INTO product_collections (product_id, collection_id)
SELECT p.id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
FROM temp_products p
WHERE p.sku IN ('COL-001', 'COL-002', 'BODY-001', 'BODY-002')
ON CONFLICT (product_id, collection_id) DO NOTHING;

INSERT INTO product_collections (product_id, collection_id)
SELECT p.id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
FROM temp_products p
WHERE p.sku IN ('PERF-001', 'PERF-003', 'PERF-004')
ON CONFLICT (product_id, collection_id) DO NOTHING;

INSERT INTO product_collections (product_id, collection_id)
SELECT p.id, 'cccccccc-cccc-cccc-cccc-cccccccccccc'
FROM temp_products p
WHERE p.sku IN ('PERF-001', 'PERF-002', 'PERF-003', 'PERF-005')
ON CONFLICT (product_id, collection_id) DO NOTHING;

-- Insert Inventory records using the temp table
INSERT INTO inventory (product_id, quantity, sku, reorder_level)
SELECT p.id, 
  CASE p.sku
    WHEN 'PERF-001' THEN 50
    WHEN 'PERF-002' THEN 35
    WHEN 'PERF-003' THEN 28
    WHEN 'PERF-004' THEN 25
    WHEN 'COL-001' THEN 60
    WHEN 'COL-002' THEN 42
    WHEN 'COL-003' THEN 38
    WHEN 'BODY-001' THEN 100
    WHEN 'BODY-002' THEN 85
    WHEN 'BODY-003' THEN 120
    WHEN 'PERF-005' THEN 30
    WHEN 'COL-004' THEN 45
  END,
  p.sku,
  CASE 
    WHEN p.sku LIKE 'PERF%' THEN 10
    WHEN p.sku LIKE 'COL%' THEN 15
    WHEN p.sku LIKE 'BODY%' THEN 20
  END
FROM temp_products p
ON CONFLICT (product_id) DO NOTHING;

DROP TABLE temp_products;