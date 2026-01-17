-- Activer RLS sur la table
ALTER TABLE doctor_planning_settings ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture
CREATE POLICY "Les médecins peuvent lire leurs propres horaires"
  ON doctor_planning_settings
  FOR SELECT
  USING (true);

-- Politique pour permettre l'insertion
CREATE POLICY "Les médecins peuvent créer leurs horaires"
  ON doctor_planning_settings
  FOR INSERT
  WITH CHECK (true);

-- Politique pour permettre la mise à jour
CREATE POLICY "Les médecins peuvent modifier leurs horaires"
  ON doctor_planning_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Politique pour permettre la suppression
CREATE POLICY "Les médecins peuvent supprimer leurs horaires"
  ON doctor_planning_settings
  FOR DELETE
  USING (true);
