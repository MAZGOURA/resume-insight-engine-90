-- Add product analytics table
CREATE TABLE IF NOT EXISTS public.product_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'cart_add', 'purchase')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_product_analytics_product_id ON public.product_analytics(product_id);
CREATE INDEX idx_product_analytics_event_type ON public.product_analytics(event_type);
CREATE INDEX idx_product_analytics_created_at ON public.product_analytics(created_at DESC);

-- Enable RLS
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics (for tracking)
CREATE POLICY "Anyone can insert product analytics"
ON public.product_analytics
FOR INSERT
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view product analytics"
ON public.product_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Add checkbox control field to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS show_compare_price BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.products.show_compare_price IS 'Controls whether to display comparison price even if set. Allows admin to disable discount display without removing the compare_price value.';