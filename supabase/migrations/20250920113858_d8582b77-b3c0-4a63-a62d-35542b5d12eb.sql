-- Corriger la dernière fonction pour avoir un search_path fixe
CREATE OR REPLACE FUNCTION public.reset_attestation_counter(reset_by_admin text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;