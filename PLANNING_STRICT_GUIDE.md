# 📅 Guide du Planning Intelligent Strict

## ⚠️ RÈGLE ABSOLUE

**Le patient NE CHOISIT JAMAIS la durée exacte de la consultation**

- Les créneaux sont générés automatiquement par le système
- Le planning est plein par défaut sur les horaires d'ouverture
- Le patient choisit UNIQUEMENT le type de rendez-vous (RAPIDE, NORMAL, LONG)

## 🎯 Objectif du Système

1. Limiter le retard du médecin
2. Éviter l'encombrement de la salle d'attente
3. Rester simple à utiliser pour le médecin

## 📋 Architecture

### 1. Unités de Base

- **15 minutes = unité de base** (NON MODIFIABLE)
- Tous les créneaux sont générés automatiquement en multiples de 15 minutes

### 2. Types de Rendez-vous (Prédéfinis)

Le médecin configure des types, PAS des durées libres :

| Type | Créneaux | Durée |
|------|----------|-------|
| **RAPIDE** | 1 créneau | 15 minutes |
| **NORMAL** | 1 créneau | 15 minutes |
| **LONG** | 2 créneaux | 30 minutes |

**Règles :**
- Le patient choisit UNIQUEMENT le type
- Le système bloque automatiquement le nombre de créneaux nécessaires
- Aucun champ "durée libre" ou "durée personnalisée"

### 3. Génération Automatique des Créneaux

Le système génère automatiquement :
- Des créneaux de 15 minutes
- Sur toute la plage horaire définie par le médecin
- Le planning est **PLEIN par défaut**

**Configuration médecin :**
- Horaires d'ouverture (ex: 09h-12h / 14h-18h)
- Jours travaillés (lundi à vendredi, etc.)

### 4. Buffers Invisibles au Patient

Les buffers sont des créneaux tampon **INVISIBLES** qui servent à :
- Absorber le retard
- Rattraper une consultation longue

**Configuration :**
- **Option A** : 1 buffer de 15 min toutes les X consultations
- **Option B** : 1 buffer de 15 min par heure

**Important :** Les buffers ne sont PAS réservables et n'apparaissent PAS dans l'interface patient.

### 5. Gestion Automatique du Retard

Le système calcule en temps réel :
- Le temps réel écoulé
- Comparaison avec le planning théorique
- Estimation du retard actuel

**Affichage patient :**
- "Retard estimé : +X minutes"
- Heure d'arrivée ajustée proposée

### 6. Paramètres Médecin

Le médecin peut choisir :
- **Planning STRICT** : aucun décalage automatique
- **Planning FLEXIBLE** : ajustement intelligent
- Durée moyenne réelle observée (statistique, PAS imposée)

### 7. Statistiques Automatiques

Calculées automatiquement :
- Durée moyenne réelle des consultations
- Retard moyen par jour
- Efficacité des buffers

## 🚀 Installation

### 1. Exécuter le script SQL

Exécutez `PLANNING_SQL_V2.sql` dans l'éditeur SQL de Supabase.

Ce script crée :
- Colonnes supplémentaires dans `appointments`
- Table `appointment_types` (types prédéfinis)
- Table `doctor_planning_settings` (paramètres)
- Table `appointment_sessions` (suivi)
- Table `appointment_statistics` (statistiques)

### 2. Structure de Base de Données

```sql
-- Types de rendez-vous
appointment_types (
  id: 'rapide' | 'normal' | 'long',
  slots: 1 ou 2 (nombre de créneaux de 15 min)
)

-- Paramètres médecin
doctor_planning_settings (
  working_hours: JSONB [{start: "09:00", end: "12:00"}, ...],
  working_days: INTEGER[] [1,2,3,4,5],
  buffer_mode: 'per-consultations' | 'per-hour',
  buffer_frequency: INTEGER
)
```

## 📱 Utilisation

### Interface Médecin

1. **Configuration du Planning**
   - Définir les horaires d'ouverture (peut être plusieurs plages)
   - Sélectionner les jours travaillés
   - Configurer les buffers (mode et fréquence)
   - Choisir le mode (strict/flexible)

2. **Statistiques**
   - Consultées automatiquement dans le dashboard
   - Durée moyenne, retard moyen, etc.

### Interface Patient

1. **Réservation**
   - Sélectionner un médecin
   - Choisir une date
   - **Choisir le TYPE de rendez-vous** (RAPIDE, NORMAL, LONG)
   - Choisir le type de consultation (consultation, prise de sang, etc.)
   - Choisir le mode (présentiel/vidéo)
   - **Sélectionner un créneau disponible** (générés automatiquement)

2. **Affichage du Retard**
   - Si le médecin a un retard, affichage automatique
   - Heure d'arrivée conseillée
   - Possibilité de notification SMS

## 🔧 Logique Technique

### Génération des Créneaux

```typescript
// 1. Vérifier si c'est un jour travaillé
// 2. Pour chaque plage horaire :
//    - Générer des créneaux de 15 min
//    - Marquer les créneaux occupés
//    - Marquer les buffers (invisibles)
// 3. Filtrer selon le type choisi
```

### Blocage Automatique

Quand un patient réserve un type LONG (2 créneaux) :
- Le système bloque automatiquement 2 créneaux consécutifs
- Les créneaux suivants deviennent indisponibles

### Calcul du Retard

```typescript
// Pour chaque rendez-vous :
// 1. Comparer heure prévue vs heure réelle de début
// 2. Comparer durée prévue vs durée réelle
// 3. Calculer le retard accumulé
// 4. Afficher au patient suivant
```

## ✅ Vérifications

### Règles Respectées

- ✅ Patient ne choisit jamais la durée
- ✅ Créneaux générés automatiquement
- ✅ Planning plein par défaut
- ✅ Buffers invisibles au patient
- ✅ Types prédéfinis (RAPIDE=1, NORMAL=1, LONG=2)
- ✅ Blocage automatique des créneaux
- ✅ Gestion automatique du retard
- ✅ Statistiques automatiques

## 📊 Exemple Concret

### Scénario : Consultation LONG à 9h00

1. **Patient choisit** : Type LONG
2. **Système bloque** : 9h00 et 9h15 (2 créneaux)
3. **Patient suivant** : Ne voit que les créneaux disponibles (9h30, 9h45, etc.)
4. **Si retard** : Le système calcule et affiche le retard estimé

### Scénario : Buffer toutes les 3 consultations

1. Consultation 1 : 9h00 (NORMAL)
2. Consultation 2 : 9h15 (RAPIDE)
3. Consultation 3 : 9h30 (NORMAL)
4. **Buffer invisible** : 9h45 (non réservable)
5. Consultation 4 : 10h00 (disponible)

## 🎯 Résultat

Un système de planning médical intelligent, automatique et professionnel qui :
- Respecte strictement les règles métier
- Limite les retards
- Évite l'encombrement
- Reste simple à utiliser
