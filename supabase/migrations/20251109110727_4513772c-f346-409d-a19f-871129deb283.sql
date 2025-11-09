-- Clean up duplicate FK constraints between products and brands/categories
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_brand;
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_category;

-- Ensure desired constraints remain (no-op if they already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='products' AND constraint_name='products_brand_id_fkey'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id)
      REFERENCES brands(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='products' AND constraint_name='products_category_id_fkey'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id)
      REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;