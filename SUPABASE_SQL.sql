-- ============================================
-- SCRIPT SQL POUR CRÉER LES TABLES SUPABASE
-- ============================================
-- Copiez-collez ce script complet dans l'éditeur SQL de Supabase
-- ============================================

-- 1. Créer la table appointments (Rendez-vous)
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  type TEXT NOT NULL CHECK (type IN ('In-person', 'Video Call')),
  consultation_type TEXT,
  notes TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- 2. Créer la table patients (Patients)
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL,
  age TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- 3. Créer la table analyses (Analyses médicales)
CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  patient_email TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('blood', 'urine', 'imaging', 'cardiac', 'other')),
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'normal', 'abnormal')),
  laboratory TEXT,
  ordered_by TEXT,
  results TEXT,
  numeric_results JSONB,
  doctor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_analyses_patient_email ON analyses(patient_email);
CREATE INDEX IF NOT EXISTS idx_analyses_date ON analyses(date);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);

-- 4. Activer Row Level Security (RLS) pour la sécurité
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques de sécurité (pour permettre l'accès)
-- Politique pour appointments (tous peuvent lire/écrire pour le moment)
DROP POLICY IF EXISTS "Enable all operations for appointments" ON appointments;
CREATE POLICY "Enable all operations for appointments" ON appointments
  FOR ALL USING (true) WITH CHECK (true);

-- Politique pour patients (tous peuvent lire/écrire pour le moment)
DROP POLICY IF EXISTS "Enable all operations for patients" ON patients;
CREATE POLICY "Enable all operations for patients" ON patients
  FOR ALL USING (true) WITH CHECK (true);

-- Politique pour analyses (tous peuvent lire/écrire pour le moment)
DROP POLICY IF EXISTS "Enable all operations for analyses" ON analyses;
CREATE POLICY "Enable all operations for analyses" ON analyses
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- FIN DU SCRIPT
-- ============================================
