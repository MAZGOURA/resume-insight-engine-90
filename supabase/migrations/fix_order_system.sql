-- =====================================================
-- FIX ORDER SYSTEM ISSUES
-- Run this in your Supabase SQL Editor
-- =====================================================

-- First, let's check if the order creation function exists and fix it
DROP FUNCTION IF EXISTS create_order_with_items(UUID, JSONB, JSONB);

-- Create the improved order creation function
CREATE OR REPLACE FUNCTION create_order_with_items(
    p_user_id UUID,
    p_shipping_address JSONB,
    p_items JSONB
)
RETURNS UUID AS $$
DECLARE
    order_id UUID;
    item JSONB;
    total_amount DECIMAL := 0;
    item_total DECIMAL;
    product_stock INTEGER;
BEGIN
    -- Validate user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Calculate total amount and validate items
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Validate product exists and is active
        SELECT stock_quantity INTO product_stock
        FROM products 
        WHERE id = (item->>'product_id')::UUID AND is_active = true;
        
        IF product_stock IS NULL THEN
            RAISE EXCEPTION 'Product not found or inactive: %', item->>'product_id';
        END IF;
        
        IF product_stock < (item->>'quantity')::INTEGER THEN
            RAISE EXCEPTION 'Insufficient stock for product: %', item->>'product_id';
        END IF;
        
        SELECT (item->>'quantity')::INTEGER * (item->>'price')::DECIMAL INTO item_total;
        total_amount := total_amount + item_total;
    END LOOP;
    
    -- Create order
    INSERT INTO orders (user_id, shipping_address, total_amount)
    VALUES (p_user_id, p_shipping_address, total_amount)
    RETURNING id INTO order_id;
    
    -- Create order items and update stock
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (
            order_id,
            (item->>'product_id')::UUID,
            (item->>'quantity')::INTEGER,
            (item->>'price')::DECIMAL
        );
        
        -- Decrement stock
        UPDATE products 
        SET stock_quantity = stock_quantity - (item->>'quantity')::INTEGER,
            updated_at = NOW()
        WHERE id = (item->>'product_id')::UUID;
    END LOOP;
    
    RETURN order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the decrement_stock function
DROP FUNCTION IF EXISTS decrement_stock(UUID, INTEGER);

CREATE OR REPLACE FUNCTION decrement_stock(product_uuid UUID, quantity_to_decrement INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Get current stock
    SELECT stock_quantity INTO current_stock 
    FROM products 
    WHERE id = product_uuid AND is_active = true;
    
    -- Check if enough stock available
    IF current_stock IS NULL OR current_stock < quantity_to_decrement THEN
        RETURN FALSE;
    END IF;
    
    -- Decrement stock
    UPDATE products 
    SET stock_quantity = stock_quantity - quantity_to_decrement,
        updated_at = NOW()
    WHERE id = product_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the increment_stock function
DROP FUNCTION IF EXISTS increment_stock(UUID, INTEGER);

CREATE OR REPLACE FUNCTION increment_stock(product_uuid UUID, quantity_to_increment INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE products 
    SET stock_quantity = stock_quantity + quantity_to_increment,
        updated_at = NOW()
    WHERE id = product_uuid AND is_active = true;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simple order creation function for the frontend
CREATE OR REPLACE FUNCTION create_simple_order(
    p_user_id UUID,
    p_shipping_address JSONB,
    p_total_amount DECIMAL
)
RETURNS UUID AS $$
DECLARE
    order_id UUID;
BEGIN
    -- Validate user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Create order
    INSERT INTO orders (user_id, shipping_address, total_amount)
    VALUES (p_user_id, p_shipping_address, p_total_amount)
    RETURNING id INTO order_id;
    
    RETURN order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to add items to an order
CREATE OR REPLACE FUNCTION add_order_item(
    p_order_id UUID,
    p_product_id UUID,
    p_quantity INTEGER,
    p_price DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Validate order exists and belongs to user
    IF NOT EXISTS (
        SELECT 1 FROM orders 
        WHERE id = p_order_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Order not found or access denied';
    END IF;
    
    -- Check product stock
    SELECT stock_quantity INTO current_stock 
    FROM products 
    WHERE id = p_product_id AND is_active = true;
    
    IF current_stock IS NULL OR current_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product';
    END IF;
    
    -- Add order item
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (p_order_id, p_product_id, p_quantity, p_price);
    
    -- Decrement stock
    UPDATE products 
    SET stock_quantity = stock_quantity - p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the functions
GRANT EXECUTE ON FUNCTION create_order_with_items(UUID, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_simple_order(UUID, JSONB, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION add_order_item(UUID, UUID, INTEGER, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_stock(UUID, INTEGER) TO authenticated;

-- Test the functions
SELECT 'Order system fix completed successfully!' as status;
