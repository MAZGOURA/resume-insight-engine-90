-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- Create collections table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Policies for collections
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'collections' AND policyname = 'Collections are viewable by everyone'
  ) THEN
    CREATE POLICY "Collections are viewable by everyone"
    ON public.collections
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'collections' AND policyname = 'Authenticated can manage collections'
  ) THEN
    CREATE POLICY "Authenticated can manage collections"
    ON public.collections
    FOR ALL
    USING ( auth.role() = 'authenticated' );
  END IF;
END $$;

-- Create product_collections junction table
CREATE TABLE IF NOT EXISTS public.product_collections (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, collection_id)
);

ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

-- Policies for product_collections
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'product_collections' AND policyname = 'Product collections are viewable by everyone'
  ) THEN
    CREATE POLICY "Product collections are viewable by everyone"
    ON public.product_collections
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'product_collections' AND policyname = 'Authenticated can manage product collections'
  ) THEN
    CREATE POLICY "Authenticated can manage product collections"
    ON public.product_collections
    FOR ALL
    USING ( auth.role() = 'authenticated' );
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_product_collections_product_id ON public.product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id ON public.product_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_active ON public.collections(is_active);