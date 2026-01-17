-- Script simple pour ajouter toutes les colonnes manquantes
-- Copiez-collez chaque commande une par une dans Supabase

-- Date de naissance
ALTER TABLE patients ADD COLUMN IF NOT EXISTS date_of_birth TEXT;

-- Adresse
ALTER TABLE patients ADD COLUMN IF NOT EXISTS address TEXT;

-- Ville
ALTER TABLE patients ADD COLUMN IF NOT EXISTS city TEXT;

-- Code postal
ALTER TABLE patients ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Groupe sanguin
ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_type TEXT;

-- Allergies
ALTER TABLE patients ADD COLUMN IF NOT EXISTS allergies TEXT;

-- Antécédents médicaux
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_history TEXT;

-- Contact d'urgence
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- Téléphone d'urgence
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_phone TEXT;

-- Notes du médecin
ALTER TABLE patients ADD COLUMN IF NOT EXISTS doctor_notes TEXT;
