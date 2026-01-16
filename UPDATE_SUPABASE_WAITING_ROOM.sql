-- ============================================
-- MISE À JOUR DU SCHÉMA POUR LA SALLE D'ATTENTE
-- ============================================
-- Exécutez ce script dans l'éditeur SQL de Supabase pour ajouter les colonnes nécessaires
-- ============================================

-- 1. Ajouter les colonnes manquantes à la table appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_type_id TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS symptoms TEXT,
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP WITH TIME ZONE;

-- 2. Mettre à jour la contrainte CHECK pour inclure 'in-progress' dans les statuts
-- D'abord, supprimer la contrainte existante
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Ensuite, recréer la contrainte avec le nouveau statut
ALTER TABLE appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'in-progress'));

-- 3. Créer des index pour améliorer les performances des requêtes de la salle d'attente
CREATE INDEX IF NOT EXISTS idx_appointments_actual_start_time ON appointments(actual_start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status_date ON appointments(status, date);

-- ============================================
-- FIN DU SCRIPT
-- ============================================
