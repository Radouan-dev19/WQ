# WQ — Marhba Wasilla :)

Application Next.js mobile-first pour un questionnaire privé, chaleureux et ludique. Les réponses sont enregistrées dans Supabase et consultables depuis le tableau de bord du propriétaire. Aucun compte ni renseignement de contact n’est demandé à la personne qui répond.

## Lancer le projet

```bash
npm install
copy .env.example .env.local
npm run dev
```

Renseigner dans `.env.local` l’URL et la clé publique `anon` du projet Supabase.

## Préparer Supabase

1. Ouvrir **SQL Editor** dans Supabase.
2. Exécuter [`supabase/schema.sql`](supabase/schema.sql).
3. Copier **Project URL** et **anon public key** depuis **Project Settings → API** dans `.env.local`.

La sécurité RLS autorise seulement l’insertion depuis l’application publique. La lecture, la modification et la suppression ne sont pas accordées aux visiteurs. Les réponses restent visibles dans **Table Editor → questionnaire_responses** pour le propriétaire du projet.

## Déployer sur Vercel

1. Importer le dépôt GitHub privé dans Vercel.
2. Ajouter `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans les variables d’environnement du projet.
3. Déployer. Vercel détecte automatiquement Next.js.

Chaque nouvelle réponse crée un UUID. Si l’envoi échoue, le brouillon reste conservé dans le navigateur et le bouton permet de réessayer sans tout recommencer.

## Vérifications

```bash
npm run lint
npm run build
```
