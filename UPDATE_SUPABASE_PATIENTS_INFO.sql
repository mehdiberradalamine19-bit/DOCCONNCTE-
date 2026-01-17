-- ============================================
-- SCRIPT SQL POUR METTRE À JOUR LA TABLE PATIENTS
-- ============================================
-- Ce script ajoute les nouveaux champs pour les informations médicales des patients
-- Copiez-collez ce script dans l'éditeur SQL de Supabase
-- ============================================

-- Ajouter les nouveaux champs à la table patients si elles n'existent pas déjà

-- Groupe sanguin
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'blood_type'
  ) THEN
    ALTER TABLE patients ADD COLUMN blood_type TEXT;
  END IF;
END $$;

-- Adresse
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'address'
  ) THEN
    ALTER TABLE patients ADD COLUMN address TEXT;
  END IF;
END $$;

-- Ville
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'city'
  ) THEN
    ALTER TABLE patients ADD COLUMN city TEXT;
  END IF;
END $$;

-- Code postal
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE patients ADD COLUMN postal_code TEXT;
  END IF;
END $$;

-- Date de naissance
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE patients ADD COLUMN date_of_birth TEXT;
  END IF;
END $$;

-- Allergies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'allergies'
  ) THEN
    ALTER TABLE patients ADD COLUMN allergies TEXT;
  END IF;
END $$;

-- Antécédents médicaux
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'medical_history'
  ) THEN
    ALTER TABLE patients ADD COLUMN medical_history TEXT;
  END IF;
END $$;

-- Contact d'urgence (nom)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'emergency_contact'
  ) THEN
    ALTER TABLE patients ADD COLUMN emergency_contact TEXT;
  END IF;
END $$;

-- Contact d'urgence (téléphone)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'emergency_phone'
  ) THEN
    ALTER TABLE patients ADD COLUMN emergency_phone TEXT;
  END IF;
END $$;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Après avoir exécuté ce script, tous les nouveaux champs seront disponibles
-- dans la table patients et pourront être utilisés par l'application
-- ============================================
