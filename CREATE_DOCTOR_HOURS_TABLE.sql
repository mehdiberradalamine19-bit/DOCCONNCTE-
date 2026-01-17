-- ============================================
-- SCRIPT SQL POUR CRÉER LA TABLE DES HORAIRES
-- DES MÉDECINS
-- ============================================
-- Ce script crée la table 'doctor_planning_settings'
-- pour stocker les horaires d'ouverture des médecins
-- Copiez-collez ce script dans l'éditeur SQL de Supabase
-- ============================================

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS doctor_planning_settings (
  id SERIAL PRIMARY KEY,
  doctor_email TEXT UNIQUE NOT NULL,
  doctor_id TEXT,
  doctor_name TEXT,
  mode TEXT DEFAULT 'flexible', -- 'strict' ou 'flexible'
  working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- Jours travaillés (0=dimanche, 1=lundi, ..., 6=samedi)
  working_hours JSONB DEFAULT '[{"start":"09:00","end":"12:00"},{"start":"14:00","end":"18:00"}]', -- Plages horaires [{start: "09:00", end: "12:00"}, ...]
  buffer_mode TEXT DEFAULT 'per-consultations', -- 'per-consultations' ou 'per-hour'
  buffer_frequency INTEGER DEFAULT 3,
  average_consultation_duration INTEGER, -- en minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour une recherche rapide par email
CREATE INDEX IF NOT EXISTS idx_doctor_planning_settings_email ON doctor_planning_settings(doctor_email);

-- Index pour une recherche rapide par doctor_id
CREATE INDEX IF NOT EXISTS idx_doctor_planning_settings_doctor_id ON doctor_planning_settings(doctor_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_doctor_planning_settings_updated_at ON doctor_planning_settings;
CREATE TRIGGER update_doctor_planning_settings_updated_at
  BEFORE UPDATE ON doctor_planning_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Après avoir exécuté ce script, la table doctor_planning_settings
-- sera créée avec toutes les colonnes nécessaires pour gérer les horaires
-- ============================================
