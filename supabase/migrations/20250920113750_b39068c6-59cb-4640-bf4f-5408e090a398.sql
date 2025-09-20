-- Corriger la colonne phone qui stocke en fait un email
-- Renommer phone en email pour plus de clarté
ALTER TABLE public.attestation_requests 
RENAME COLUMN phone TO email;