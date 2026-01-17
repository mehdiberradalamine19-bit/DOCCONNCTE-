-- ============================================
-- SCRIPT SQL POUR AJOUTER TOUTES LES COLONNES
-- AUX INFORMATIONS DES PATIENTS
-- ============================================
-- Ce script vérifie et ajoute toutes les colonnes nécessaires
-- pour le formulaire "Mes Informations"
-- Copiez-collez ce script dans l'éditeur SQL de Supabase
-- ============================================

-- Ajouter les colonnes manquantes pour les informations personnelles
DO $$
BEGIN
  -- Date de naissance
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE patients ADD COLUMN date_of_birth TEXT;
    RAISE NOTICE 'Colonne date_of_birth ajoutée';
  END IF;

  -- Adresse
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'address'
  ) THEN
    ALTER TABLE patients ADD COLUMN address TEXT;
    RAISE NOTICE 'Colonne address ajoutée';
  END IF;

  -- Ville
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'city'
  ) THEN
    ALTER TABLE patients ADD COLUMN city TEXT;
    RAISE NOTICE 'Colonne city ajoutée';
  END IF;

  -- Code postal
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE patients ADD COLUMN postal_code TEXT;
    RAISE NOTICE 'Colonne postal_code ajoutée';
  END IF;

  -- Groupe sanguin
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'blood_type'
  ) THEN
    ALTER TABLE patients ADD COLUMN blood_type TEXT;
    RAISE NOTICE 'Colonne blood_type ajoutée';
  END IF;

  -- Allergies
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'allergies'
  ) THEN
    ALTER TABLE patients ADD COLUMN allergies TEXT;
    RAISE NOTICE 'Colonne allergies ajoutée';
  END IF;

  -- Antécédents médicaux
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'medical_history'
  ) THEN
    ALTER TABLE patients ADD COLUMN medical_history TEXT;
    RAISE NOTICE 'Colonne medical_history ajoutée';
  END IF;

  -- Contact d'urgence
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'emergency_contact'
  ) THEN
    ALTER TABLE patients ADD COLUMN emergency_contact TEXT;
    RAISE NOTICE 'Colonne emergency_contact ajoutée';
  END IF;

  -- Téléphone d'urgence
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'emergency_phone'
  ) THEN
    ALTER TABLE patients ADD COLUMN emergency_phone TEXT;
    RAISE NOTICE 'Colonne emergency_phone ajoutée';
  END IF;

  -- Notes du médecin
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'doctor_notes'
  ) THEN
    ALTER TABLE patients ADD COLUMN doctor_notes TEXT;
    RAISE NOTICE 'Colonne doctor_notes ajoutée';
  END IF;

  -- S'assurer que les colonnes de base existent (au cas où)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'id'
  ) THEN
    ALTER TABLE patients ADD COLUMN id TEXT PRIMARY KEY;
    RAISE NOTICE 'Colonne id ajoutée';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'email'
  ) THEN
    ALTER TABLE patients ADD COLUMN email TEXT UNIQUE NOT NULL;
    RAISE NOTICE 'Colonne email ajoutée';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'name'
  ) THEN
    ALTER TABLE patients ADD COLUMN name TEXT NOT NULL;
    RAISE NOTICE 'Colonne name ajoutée';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE patients ADD COLUMN first_name TEXT NOT NULL;
    RAISE NOTICE 'Colonne first_name ajoutée';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'phone'
  ) THEN
    ALTER TABLE patients ADD COLUMN phone TEXT;
    RAISE NOTICE 'Colonne phone ajoutée';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'gender'
  ) THEN
    ALTER TABLE patients ADD COLUMN gender TEXT;
    RAISE NOTICE 'Colonne gender ajoutée';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'age'
  ) THEN
    ALTER TABLE patients ADD COLUMN age TEXT;
    RAISE NOTICE 'Colonne age ajoutée';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'password'
  ) THEN
    ALTER TABLE patients ADD COLUMN password TEXT NOT NULL DEFAULT 'default';
    RAISE NOTICE 'Colonne password ajoutée';
  END IF;

END $$;

-- Vérifier que toutes les colonnes existent
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Après avoir exécuté ce script, toutes les colonnes
-- nécessaires pour "Mes Informations" seront disponibles
-- ============================================
