-- =====================================================
-- CUSTOMER DATA FETCHING UPDATES
-- This file contains the SQL queries and updates needed to fetch real customer data
-- =====================================================

-- 1. Query to fetch customer profiles with order information
-- This query joins the profiles table with orders to get customer metrics
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.created_at,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    MAX(o.created_at) as last_order_date
FROM profiles p
LEFT JOIN orders o ON p.id = o.user_id
GROUP BY p.id, p.first_name, p.last_name, p.created_at
ORDER BY p.created_at DESC;

-- 2. Alternative query to get customer data with email (if stored in auth.users)
-- This joins the profiles table with auth.users to get email addresses
SELECT 
    p.id,
    u.email,
    p.first_name,
    p.last_name,
    p.created_at,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    MAX(o.created_at) as last_order_date
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
LEFT JOIN orders o ON p.id = o.user_id
GROUP BY p.id, u.email, p.first_name, p.last_name, p.created_at
ORDER BY p.created_at DESC;

-- 3. Query to get customer statistics for the dashboard
SELECT 
    COUNT(DISTINCT p.id) as total_customers,
    COUNT(DISTINCT CASE WHEN o.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN p.id END) as new_this_month,
    AVG(o.total_amount) as average_order_value
FROM profiles p
LEFT JOIN orders o ON p.id = o.user_id;

-- 4. Query to get VIP customers (spent over $1000)
SELECT 
    p.id,
    u.email,
    p.first_name,
    p.last_name,
    p.created_at,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_spent,
    MAX(o.created_at) as last_order_date
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
LEFT JOIN orders o ON p.id = o.user_id
GROUP BY p.id, u.email, p.first_name, p.last_name, p.created_at
HAVING SUM(o.total_amount) >= 1000
ORDER BY total_spent DESC;

-- 5. Query to get customer distribution by order count
SELECT 
    customer_type,
    COUNT(*) as customer_count
FROM (
    SELECT 
        p.id,
        CASE 
            WHEN COUNT(o.id) = 0 THEN 'New'
            WHEN COUNT(o.id) BETWEEN 1 AND 2 THEN 'Regular'
            WHEN COUNT(o.id) >= 3 THEN 'Frequent'
            ELSE 'New'
        END as customer_type
    FROM profiles p
    LEFT JOIN orders o ON p.id = o.user_id
    GROUP BY p.id
) as customer_groups
GROUP BY customer_type;

-- 6. Function to get customer metrics (can be used in the application)
CREATE OR REPLACE FUNCTION get_customer_metrics()
RETURNS TABLE(
    total_customers BIGINT,
    new_this_month BIGINT,
    average_order_value DECIMAL,
    vip_customers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM profiles) as total_customers,
        (SELECT COUNT(*) FROM profiles WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as new_this_month,
        (SELECT AVG(total_amount) FROM orders) as average_order_value,
        (SELECT COUNT(*) FROM (
            SELECT p.id
            FROM profiles p
            LEFT JOIN orders o ON p.id = o.user_id
            GROUP BY p.id
            HAVING SUM(o.total_amount) >= 1000
        ) as vip) as vip_customers;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. View to simplify customer data fetching
CREATE OR REPLACE VIEW customer_summary AS
SELECT 
    p.id,
    u.email,
    p.first_name,
    p.last_name,
    p.created_at,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    MAX(o.created_at) as last_order_date,
    CASE 
        WHEN SUM(o.total_amount) >= 1000 THEN 'VIP'
        WHEN SUM(o.total_amount) >= 500 THEN 'Premium'
        WHEN COUNT(o.id) >= 3 THEN 'Regular'
        ELSE 'New'
    END as customer_status
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
LEFT JOIN orders o ON p.id = o.user_id
GROUP BY p.id, u.email, p.first_name, p.last_name, p.created_at;

-- Usage example:
-- SELECT * FROM customer_summary ORDER BY total_spent DESC;