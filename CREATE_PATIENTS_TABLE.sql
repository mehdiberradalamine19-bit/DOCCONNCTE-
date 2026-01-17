-- ============================================
-- SCRIPT SQL POUR CRÉER LA TABLE PATIENTS
-- ============================================
-- Ce script crée la table patients avec toutes les colonnes nécessaires
-- Copiez-collez ce script dans l'éditeur SQL de Supabase
-- ============================================

-- Créer la table patients si elle n'existe pas
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  phone TEXT,
  gender TEXT,
  age TEXT,
  password TEXT NOT NULL,
  blood_type TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  date_of_birth TEXT,
  allergies TEXT,
  medical_history TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);

-- Activer Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Créer une politique de sécurité (tous peuvent lire/écrire pour le moment)
DROP POLICY IF EXISTS "Enable all operations for patients" ON patients;
CREATE POLICY "Enable all operations for patients" ON patients
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Après avoir exécuté ce script, la table patients sera créée
-- et prête à recevoir les données des nouveaux comptes
-- ============================================
