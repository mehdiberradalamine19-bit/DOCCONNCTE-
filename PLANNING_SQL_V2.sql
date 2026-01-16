-- ============================================
-- SCRIPT SQL POUR LE PLANNING INTELLIGENT V2
-- ============================================
-- Système strict : patient ne choisit JAMAIS la durée
-- Créneaux générés automatiquement (15 min de base)
-- ============================================

-- 1. Modifier la table appointments pour le nouveau système
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS doctor_email TEXT,
ADD COLUMN IF NOT EXISTS appointment_type_id TEXT CHECK (appointment_type_id IN ('rapide', 'normal', 'long')),
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 15, -- Calculé automatiquement (slots * 15)
ADD COLUMN IF NOT EXISTS estimated_delay INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP WITH TIME ZONE;

-- Index
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_email ON appointments(doctor_email);
CREATE INDEX IF NOT EXISTS idx_appointments_type_id ON appointments(appointment_type_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date, time);

-- 2. Table appointment_types (Types prédéfinis par le médecin)
CREATE TABLE IF NOT EXISTS appointment_types (
  id TEXT PRIMARY KEY CHECK (id IN ('rapide', 'normal', 'long')),
  name TEXT NOT NULL,
  slots INTEGER NOT NULL CHECK (slots > 0), -- Nombre de créneaux de 15 min (1, 2, etc.)
  description TEXT,
  doctor_email TEXT, -- NULL = types par défaut pour tous
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les types par défaut (RAPIDE=1 créneau, NORMAL=1 créneau, LONG=2 créneaux)
INSERT INTO appointment_types (id, name, slots, description, doctor_email) VALUES
  ('rapide', 'Consultation rapide', 1, '1 créneau de 15 minutes', NULL),
  ('normal', 'Consultation normale', 1, '1 créneau de 15 minutes', NULL),
  ('long', 'Consultation longue', 2, '2 créneaux consécutifs (30 minutes)', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slots = EXCLUDED.slots,
  description = EXCLUDED.description;

-- 3. Table doctor_planning_settings (Paramètres du médecin)
CREATE TABLE IF NOT EXISTS doctor_planning_settings (
  doctor_email TEXT PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('strict', 'flexible')),
  working_hours JSONB NOT NULL, -- [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}]
  working_days INTEGER[] NOT NULL, -- [1,2,3,4,5] = lundi à vendredi (0=dimanche, 6=samedi)
  buffer_mode TEXT NOT NULL CHECK (buffer_mode IN ('per-consultations', 'per-hour')),
  buffer_frequency INTEGER NOT NULL DEFAULT 3, -- toutes les X consultations ou toutes les heures
  average_consultation_duration NUMERIC(5,2), -- calculé automatiquement
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_doctor_settings_email ON doctor_planning_settings(doctor_email);

-- 4. Table appointment_sessions (Suivi des consultations)
CREATE TABLE IF NOT EXISTS appointment_sessions (
  appointment_id TEXT PRIMARY KEY REFERENCES appointments(id) ON DELETE CASCADE,
  scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  scheduled_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- durée prévue en minutes (slots * 15)
  actual_duration INTEGER, -- durée réelle en minutes
  delay INTEGER DEFAULT 0, -- retard en minutes
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_start ON appointment_sessions(scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON appointment_sessions(status);

-- 5. Table appointment_statistics (Statistiques automatiques)
CREATE TABLE IF NOT EXISTS appointment_statistics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  doctor_email TEXT NOT NULL,
  date DATE NOT NULL,
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  average_duration NUMERIC(5,2), -- durée moyenne réelle en minutes
  average_delay NUMERIC(5,2), -- retard moyen en minutes
  max_delay INTEGER, -- retard maximum en minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_email, date)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_statistics_doctor_date ON appointment_statistics(doctor_email, date);

-- 6. Activer RLS sur les nouvelles tables
ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_planning_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_statistics ENABLE ROW LEVEL SECURITY;

-- 7. Créer les politiques de sécurité
-- Types de rendez-vous (tous peuvent lire, médecin peut modifier)
DROP POLICY IF EXISTS "Enable read for appointment_types" ON appointment_types;
CREATE POLICY "Enable read for appointment_types" ON appointment_types
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all for appointment_types" ON appointment_types;
CREATE POLICY "Enable all for appointment_types" ON appointment_types
  FOR ALL USING (true) WITH CHECK (true);

-- Paramètres de planning
DROP POLICY IF EXISTS "Enable all for doctor_settings" ON doctor_planning_settings;
CREATE POLICY "Enable all for doctor_settings" ON doctor_planning_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Sessions
DROP POLICY IF EXISTS "Enable all for sessions" ON appointment_sessions;
CREATE POLICY "Enable all for sessions" ON appointment_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Statistiques
DROP POLICY IF EXISTS "Enable all for statistics" ON appointment_statistics;
CREATE POLICY "Enable all for statistics" ON appointment_statistics
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- FIN DU SCRIPT
-- ============================================
