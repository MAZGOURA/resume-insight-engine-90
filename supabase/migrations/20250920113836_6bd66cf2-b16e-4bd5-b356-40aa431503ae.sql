-- Activer RLS sur toutes les tables publiques qui ont des politiques mais pas RLS activé
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attestation_requests ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;