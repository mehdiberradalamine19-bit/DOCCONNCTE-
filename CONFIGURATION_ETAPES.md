# 📋 Étapes de Configuration Supabase

## ✅ Étape 1 : Tables créées (FAIT ✓)

Les tables sont créées dans Supabase.

## 🔑 Étape 2 : Récupérer vos clés Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **Settings** (Paramètres) dans le menu de gauche
4. Cliquez sur **API** dans le sous-menu
5. Vous verrez deux informations importantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (une longue chaîne)

## 📝 Étape 3 : Configurer le fichier .env

1. Ouvrez le fichier `.env` dans votre projet
2. Remplacez les valeurs par vos propres clés :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_complete
```

**Exemple :**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODU2NzgyMCwiZXhwIjoxOTU0MTQzODIwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🚀 Étape 4 : Tester la connexion

1. Redémarrez le serveur de développement :
   ```bash
   npm run dev
   ```

2. Ouvrez l'application dans votre navigateur

3. Vérifiez la console du navigateur (F12) :
   - Si vous voyez des erreurs de connexion, vérifiez vos clés dans `.env`
   - Si tout fonctionne, vous devriez pouvoir créer des rendez-vous, patients, etc.

## ✅ Étape 5 : Vérifier dans Supabase

1. Allez dans votre projet Supabase
2. Cliquez sur **Table Editor** dans le menu de gauche
3. Vous devriez voir vos 3 tables : `appointments`, `patients`, `analyses`
4. Quand vous créez des données dans l'application, elles apparaîtront ici !

## 🎉 C'est tout !

Votre application est maintenant connectée à Supabase. Toutes les données seront sauvegardées dans la base de données.
