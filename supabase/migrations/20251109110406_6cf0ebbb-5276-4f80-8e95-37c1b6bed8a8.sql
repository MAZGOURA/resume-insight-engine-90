-- Remove duplicate foreign key constraint on products.brand_id
-- This constraint was added in the optimization migration but already existed

ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_brand;
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_category;

-- Re-add the constraints with proper names (if they don't already exist)
DO $$ 
BEGIN
    -- Only add brand constraint if no foreign key exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_brand_id_fkey' 
        AND table_name = 'products'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT products_brand_id_fkey 
        FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
    END IF;
    
    -- Only add category constraint if no foreign key exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_category_id_fkey' 
        AND table_name = 'products'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT products_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;