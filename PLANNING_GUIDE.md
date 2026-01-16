# 📅 Guide du Planning Intelligent

## Vue d'ensemble

Le système de planning intelligent permet de :
- ✅ Limiter le retard du médecin
- ✅ Éviter une salle d'attente surchargée
- ✅ Reste simple à configurer pour le médecin
- ✅ Gérer différents types de rendez-vous avec durées variables

## 🚀 Installation

### 1. Exécuter le script SQL supplémentaire

Après avoir créé les tables de base, exécutez le fichier `PLANNING_SQL.sql` dans l'éditeur SQL de Supabase.

Ce script crée :
- Les colonnes supplémentaires dans `appointments`
- La table `appointment_types` (types de rendez-vous)
- La table `doctor_planning_settings` (paramètres du médecin)
- La table `appointment_sessions` (suivi des consultations)
- La table `appointment_statistics` (statistiques)

### 2. Redémarrer l'application

```bash
npm run dev
```

## 📋 Fonctionnalités

### 1. Types de rendez-vous

Le système propose 3 types de rendez-vous par défaut :

- **Consultation rapide** : 10 minutes
- **Consultation normale** : 15 minutes (par défaut)
- **Consultation longue** : 30 minutes

Le patient choisit le type lors de la réservation, et le planning s'adapte automatiquement.

### 2. Buffers automatiques

Les buffers sont des créneaux "tampon" qui absorbent les retards ou consultations longues.

**Configuration possible :**
- **Par nombre de consultations** : 1 buffer toutes les X consultations (ex: toutes les 3)
- **Par heure** : 1 buffer par heure (ex: à 9h00, 10h00, etc.)

**Durée du buffer** : Configurable (par défaut 15 minutes)

### 3. Mode de planning

- **Strict** : Créneaux fixes, pas de flexibilité
- **Flexible** : Adaptation automatique selon les retards

### 4. Gestion du retard

Le système calcule en temps réel :
- Le retard estimé du médecin
- L'heure d'arrivée conseillée pour le patient
- Possibilité d'envoyer une notification SMS

### 5. Statistiques

Le médecin peut consulter :
- Durée moyenne réelle des consultations
- Retard moyen par journée
- Retard maximum
- Taux de complétion

## 👨‍⚕️ Interface Médecin

### Paramètres de planning

1. Allez dans le dashboard médecin
2. Cliquez sur "Paramètres de Planning"
3. Configurez :
   - Mode de planning (strict/flexible)
   - Heures de travail
   - Durée de base des créneaux
   - Configuration des buffers

### Statistiques

Les statistiques s'affichent automatiquement dans le dashboard pour chaque journée.

## 👤 Interface Patient

### Réservation avec type de RDV

1. Sélectionnez un médecin
2. Choisissez une date
3. **Sélectionnez la durée de consultation** (rapide/normal/long)
4. Choisissez le type de consultation (consultation, prise de sang, etc.)
5. Choisissez le mode (présentiel/vidéo)
6. Sélectionnez un créneau disponible

### Affichage du retard

Si le médecin a un retard, le patient verra :
- Un message d'alerte avec le retard estimé
- L'heure d'arrivée conseillée
- Un bouton pour recevoir une notification SMS

## 🔧 Configuration technique

### Structure de base de données

```sql
-- Types de rendez-vous
appointment_types (id, name, duration, description)

-- Paramètres du médecin
doctor_planning_settings (
  doctor_email,
  mode,
  base_slot_duration,
  buffer_mode,
  buffer_frequency,
  buffer_duration,
  working_hours_start,
  working_hours_end
)

-- Sessions de consultation
appointment_sessions (
  appointment_id,
  scheduled_start_time,
  actual_start_time,
  duration,
  delay
)
```

### Calcul des créneaux

Le système génère automatiquement les créneaux disponibles en tenant compte :
- Des rendez-vous existants
- De la durée de chaque type de rendez-vous
- Des buffers configurés
- Des heures de travail

### Calcul du retard

Le retard est calculé en temps réel en comparant :
- L'heure prévue de début
- L'heure réelle de début (si disponible)
- La durée réelle vs durée prévue

## 📱 Notifications

### SMS pour retard

Quand un patient clique sur "Recevoir une notification par SMS", le système peut :
1. Envoyer un SMS avec l'heure d'arrivée conseillée
2. Envoyer une mise à jour si le retard change

**Note** : L'intégration SMS nécessite un service externe (Twilio, etc.)

## 🎯 Prochaines étapes

Pour activer les notifications SMS :
1. Intégrer un service SMS (Twilio, etc.)
2. Ajouter les fonctions dans `database.ts`
3. Créer un endpoint pour envoyer les SMS

## 📊 Exemple d'utilisation

### Scénario 1 : Planning flexible avec buffers

1. Médecin configure :
   - Mode : Flexible
   - Buffer : 1 toutes les 3 consultations
   - Durée buffer : 15 minutes

2. Patient réserve :
   - Consultation normale (15 min) à 9h00
   - Consultation longue (30 min) à 9h15
   - Consultation rapide (10 min) à 9h45
   - **Buffer automatique** à 9h55

3. Si le médecin a un retard :
   - Le buffer absorbe le retard
   - Les patients suivants sont notifiés

### Scénario 2 : Statistiques

À la fin de la journée, le médecin voit :
- 20 rendez-vous au total
- 18 terminés
- Durée moyenne : 16.5 minutes
- Retard moyen : 5 minutes
- Retard maximum : 15 minutes

## 🐛 Dépannage

### Les créneaux ne s'affichent pas correctement

1. Vérifiez que les paramètres de planning sont configurés
2. Vérifiez les heures de travail
3. Vérifiez que les rendez-vous ont bien une durée

### Le retard ne s'affiche pas

1. Vérifiez que `actualStartTime` est renseigné
2. Vérifiez que les rendez-vous sont en statut "in-progress" ou "completed"

### Les statistiques sont vides

1. Vérifiez que des rendez-vous sont terminés
2. Vérifiez que `actualStartTime` et `actualEndTime` sont renseignés
