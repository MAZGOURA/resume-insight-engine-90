-- Table pour tracker les vues de produits (pour recommandations)
CREATE TABLE IF NOT EXISTS public.product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_product_views_user ON public.product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product ON public.product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_session ON public.product_views(session_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON public.product_views(viewed_at DESC);

-- Table pour stocker les similarités entre produits
CREATE TABLE IF NOT EXISTS public.product_similarities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  similar_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  similarity_score DECIMAL(3,2) CHECK (similarity_score >= 0 AND similarity_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, similar_product_id)
);

-- Index pour les requêtes de similarité
CREATE INDEX IF NOT EXISTS idx_product_sim_product ON public.product_similarities(product_id, similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_product_sim_similar ON public.product_similarities(similar_product_id);

-- Enable RLS
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_similarities ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour product_views
CREATE POLICY "Anyone can insert product views"
  ON public.product_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own product views"
  ON public.product_views
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all product views"
  ON public.product_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- RLS Policies pour product_similarities
CREATE POLICY "Anyone can view product similarities"
  ON public.product_similarities
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product similarities"
  ON public.product_similarities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );