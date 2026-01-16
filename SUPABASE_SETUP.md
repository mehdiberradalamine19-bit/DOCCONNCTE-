# Configuration Supabase pour DocConnect

## 1. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet
4. Notez votre URL et votre clé anonyme (anon key)

## 2. Créer les tables

Exécutez ces requêtes SQL dans l'éditeur SQL de Supabase :

### Table `appointments`

```sql
CREATE TABLE appointments (
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
CREATE INDEX idx_appointments_patient_email ON appointments(patient_email);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
```

### Table `patients`

```sql
CREATE TABLE patients (
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
CREATE INDEX idx_patients_email ON patients(email);
```

### Table `analyses`

```sql
CREATE TABLE analyses (
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
CREATE INDEX idx_analyses_patient_email ON analyses(patient_email);
CREATE INDEX idx_analyses_date ON analyses(date);
CREATE INDEX idx_analyses_status ON analyses(status);
```

## 3. Activer Row Level Security (RLS)

Pour la sécurité, activez RLS sur toutes les tables :

```sql
-- Activer RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Politiques pour appointments (tous peuvent lire/écrire pour le moment)
CREATE POLICY "Enable all operations for appointments" ON appointments
  FOR ALL USING (true) WITH CHECK (true);

-- Politiques pour patients (tous peuvent lire/écrire pour le moment)
CREATE POLICY "Enable all operations for patients" ON patients
  FOR ALL USING (true) WITH CHECK (true);

-- Politiques pour analyses (tous peuvent lire/écrire pour le moment)
CREATE POLICY "Enable all operations for analyses" ON analyses
  FOR ALL USING (true) WITH CHECK (true);
```

## 4. Configuration des variables d'environnement

1. Copiez `.env.example` vers `.env`
2. Remplissez vos valeurs Supabase :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

## 5. Tester la connexion

Après avoir configuré Supabase, redémarrez le serveur de développement :

```bash
npm run dev
```

Les données seront maintenant stockées dans Supabase au lieu de localStorage.
