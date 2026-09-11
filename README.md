# WQ — Marhba Wassila :)

Application Next.js mobile-first pour un questionnaire privé, chaleureux et ludique. Les réponses sont enregistrées dans Supabase et consultables depuis le tableau de bord du propriétaire. Aucun compte ni renseignement de contact n’est demandé à la personne qui répond.

## Lancer le projet

```bash
npm install
copy .env.example .env.local
npm run dev
```

Renseigner dans `.env.local` l’URL et la clé publique (publishable) du projet Supabase.

## Préparer Supabase

1. Ouvrir **SQL Editor** dans Supabase.
2. Exécuter [`supabase/schema.sql`](supabase/schema.sql).
3. Copier **Project URL** et **publishable key** depuis **Project Settings → API Keys** dans `.env.local`.

La sécurité RLS autorise seulement l’insertion depuis l’application publique. La lecture, la modification et la suppression ne sont pas accordées aux visiteurs. Les réponses restent visibles dans **Table Editor → questionnaire_responses** pour le propriétaire du projet.

## Déployer sur GitHub Pages

1. Ajouter `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `NEXT_PUBLIC_SITE_PASSWORD_HASH` dans **Settings → Secrets and variables → Actions**.
2. Dans **Settings → Pages**, choisir **GitHub Actions** comme source.
3. Pousser sur `main`. Le workflow construit puis publie automatiquement le site.

GitHub Pages sert uniquement les fichiers statiques. Le navigateur envoie donc les réponses directement à Supabase avec la clé publique. La politique RLS de [`supabase/schema.sql`](supabase/schema.sql) autorise uniquement l’insertion et interdit aux visiteurs de lire, modifier ou supprimer les réponses.

Le mot de passe du site n’est jamais commité. Seule son empreinte SHA-256 est fournie au build via `NEXT_PUBLIC_SITE_PASSWORD_HASH`, calculée à partir de `wq-site-access-v1:<mot-de-passe>`.

Chaque nouvelle réponse crée un UUID. Si l’envoi échoue, le brouillon reste conservé dans le navigateur et le bouton permet de réessayer sans tout recommencer.

## Vérifications

```bash
npm run lint
npm run build
```
