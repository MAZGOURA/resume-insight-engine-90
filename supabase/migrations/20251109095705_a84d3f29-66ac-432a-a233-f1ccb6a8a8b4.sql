-- Create product_categories junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public viewing
CREATE POLICY "Product categories are viewable by everyone"
  ON product_categories FOR SELECT
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);

-- Migrate existing product category data to the new junction table
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id 
FROM products 
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;