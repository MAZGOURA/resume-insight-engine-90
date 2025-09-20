-- Activer RLS sur les tables manquantes détectées par le linter
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Corriger les fonctions en ajoutant search_path
CREATE OR REPLACE FUNCTION public.increment_attestation_counter()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_counter INTEGER;
BEGIN
  UPDATE public.attestation_counter 
  SET counter = counter + 1, 
      updated_at = now()
  WHERE id = 1
  RETURNING counter INTO new_counter;
  
  RETURN new_counter;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_attestation_counter(reset_by_admin TEXT DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  UPDATE public.attestation_counter 
  SET counter = 0,
      last_reset_date = now(),
      last_reset_by = reset_by_admin,
      updated_at = now()
  WHERE id = 1;
  
  RETURN 0;
END;
$$;