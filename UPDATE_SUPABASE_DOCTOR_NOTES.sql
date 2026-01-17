-- ============================================
-- SCRIPT SQL POUR AJOUTER LE CHAMP NOTES DU MÉDECIN
-- ============================================
-- Ce script ajoute le champ doctor_notes à la table patients
-- Copiez-collez ce script dans l'éditeur SQL de Supabase
-- ============================================

-- Ajouter le champ doctor_notes si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'doctor_notes'
  ) THEN
    ALTER TABLE patients ADD COLUMN doctor_notes TEXT;
  END IF;
END $$;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Après avoir exécuté ce script, le champ doctor_notes sera disponible
-- pour que les médecins puissent ajouter des notes sur leurs patients
-- ============================================
