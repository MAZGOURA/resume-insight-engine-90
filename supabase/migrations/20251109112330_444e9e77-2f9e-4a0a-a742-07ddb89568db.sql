-- Remove duplicate foreign key constraint on reviews table
-- Keep only the named constraint fk_reviews_product
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;