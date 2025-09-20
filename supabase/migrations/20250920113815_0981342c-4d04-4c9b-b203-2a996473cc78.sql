-- Corriger les problèmes de sécurité RLS
-- Activer RLS sur les tables qui n'ont pas RLS activé mais ont des politiques

-- Activer RLS sur admin_profiles si elle existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_profiles') THEN
        ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Corriger les fonctions pour avoir un search_path fixe
CREATE OR REPLACE FUNCTION public.get_student_request_count(student_email text)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::INTEGER
  FROM public.attestation_requests ar
  JOIN public.students s ON s.id = ar.student_id
  WHERE s.email = student_email
  AND ar.year_requested = EXTRACT(YEAR FROM now());
$function$;

CREATE OR REPLACE FUNCTION public.increment_attestation_counter()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;