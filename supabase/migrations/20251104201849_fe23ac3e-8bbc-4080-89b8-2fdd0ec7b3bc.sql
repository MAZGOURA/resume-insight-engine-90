-- Create test orders with correct enum values
DO $$
DECLARE
  test_user_id UUID := '50cd47bb-0c1b-4172-8752-cbedb353e324';
  order1_id UUID := gen_random_uuid();
  order2_id UUID := gen_random_uuid();
  order3_id UUID := gen_random_uuid();
  product1_id UUID;
  product2_id UUID;
  product3_id UUID;
  product4_id UUID;
BEGIN
  -- Get product IDs
  SELECT id INTO product1_id FROM products WHERE sku = 'PERF-001' LIMIT 1;
  SELECT id INTO product2_id FROM products WHERE sku = 'COL-001' LIMIT 1;
  SELECT id INTO product3_id FROM products WHERE sku = 'BODY-001' LIMIT 1;
  SELECT id INTO product4_id FROM products WHERE sku = 'PERF-002' LIMIT 1;

  -- Order 1: Delivered
  INSERT INTO orders (id, user_id, order_number, status, payment_status, subtotal, shipping_amount, tax_amount, discount_amount, total_amount, shipping_address, created_at, shipped_at, delivered_at)
  VALUES (
    order1_id,
    test_user_id,
    'ORD' || TO_CHAR(NOW() - INTERVAL '30 days', 'YYYYMMDD') || '-' || SUBSTRING(order1_id::text, 1, 8),
    'delivered',
    'completed',
    335.98,
    15.00,
    35.10,
    0,
    386.08,
    '{"city": "Casablanca", "country": "Morocco", "address_line1": "123 Main St", "postal_code": "20000"}'::jsonb,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '25 days'
  );

  INSERT INTO order_items (order_id, product_id, quantity, price, total)
  VALUES 
    (order1_id, product1_id, 1, 189.99, 189.99),
    (order1_id, product2_id, 1, 145.00, 145.00);

  -- Order 2: Shipped
  INSERT INTO orders (id, user_id, order_number, status, payment_status, subtotal, shipping_amount, tax_amount, discount_amount, total_amount, shipping_address, created_at, shipped_at)
  VALUES (
    order2_id,
    test_user_id,
    'ORD' || TO_CHAR(NOW() - INTERVAL '10 days', 'YYYYMMDD') || '-' || SUBSTRING(order2_id::text, 1, 8),
    'shipped',
    'completed',
    195.00,
    15.00,
    21.00,
    10.00,
    221.00,
    '{"city": "Rabat", "country": "Morocco", "address_line1": "456 Avenue Mohammed V", "postal_code": "10000"}'::jsonb,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '8 days'
  );

  INSERT INTO order_items (order_id, product_id, quantity, price, total)
  VALUES 
    (order2_id, product4_id, 1, 165.00, 165.00),
    (order2_id, product3_id, 1, 29.99, 29.99);

  -- Order 3: Processing
  INSERT INTO orders (id, user_id, order_number, status, payment_status, subtotal, shipping_amount, tax_amount, discount_amount, total_amount, shipping_address, created_at)
  VALUES (
    order3_id,
    test_user_id,
    'ORD' || TO_CHAR(NOW() - INTERVAL '2 days', 'YYYYMMDD') || '-' || SUBSTRING(order3_id::text, 1, 8),
    'processing',
    'completed',
    329.98,
    15.00,
    34.50,
    0,
    379.48,
    '{"city": "Marrakech", "country": "Morocco", "address_line1": "789 Rue de la Kasbah", "postal_code": "40000"}'::jsonb,
    NOW() - INTERVAL '2 days'
  );

  INSERT INTO order_items (order_id, product_id, quantity, price, total)
  VALUES 
    (order3_id, product1_id, 1, 189.99, 189.99),
    (order3_id, product4_id, 1, 139.99, 139.99);

  -- Add some test reviews
  INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved, is_verified_purchase)
  VALUES 
    (product1_id, test_user_id, 5, 'Amazing fragrance!', 'The scent lasts all day and I get compliments every time I wear it.', true, true),
    (product2_id, test_user_id, 4, 'Great daily cologne', 'Fresh and clean, perfect for work. Maybe a bit light for evening.', true, true),
    (product3_id, test_user_id, 5, 'Best body spray ever', 'Smells amazing and very affordable. Will buy again!', true, true);

END $$;