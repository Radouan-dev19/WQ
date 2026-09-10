# On se capte ?

Un jeu en français pour faire connaissance à deux en vue du mariage : humour léger, quotidien, communication, foi et projets. Douze questions facultatives, une à la fois, avec deux petites transitions animées et une relecture avant partage. Aucun score de compatibilité.

**État actuel : aperçu fonctionnel, stockage non connecté.** Aucun envoi ni enregistrement tant que `dist/config.js` est vide. Le mode aperçu le précise à l’écran. Les réponses en cours restent uniquement en mémoire de la page, puis sont envoyées en une fois au serveur avec l’accord explicite de la personne. L’actualisation ou la fermeture avant l’envoi perd cette progression.

## Activer le stockage gratuit

1. Créer un compte sur https://supabase.com et un projet **Free**. Choisir une région européenne si les participants sont en Europe. Garder le mot de passe de la base dans son gestionnaire de mots de passe ; il ne sert pas au site.
2. Dans **SQL Editor**, exécuter tout le fichier `supabase/schema.sql`.
3. Dans les paramètres du projet / connexion, relever l’URL `https://…supabase.co` et la clé publique **publishable**, commençant par `sb_publishable_`.
4. Renseigner seulement ces deux valeurs dans `dist/config.js`. Remplacer aussi `recipientName` par son prénom, pour que la personne sache qui reçoit ses réponses.
5. Ne jamais mettre de clé **secret**, **service_role**, mot de passe ou réponse de participant dans le dépôt GitHub. La clé publishable est destinée au navigateur ; les droits dans la base assurent la protection.
6. Faire un envoi de test consenti puis vérifier sa présence dans **Table Editor → responses**. Le test réel de bout en bout et des droits doit être réalisé une fois Supabase connecté, avant d’envoyer le lien aux participants.

## Lire les réponses plus tard

Se connecter à son tableau de bord Supabase, ouvrir **Table Editor → responses**. Chaque ligne contient le prénom/pseudo, la date, le consentement et les réponses avec le texte des questions. Le champ `answers` s’ouvre comme JSON. L’interface Supabase permet d’exporter la table ou de supprimer une ligne sur demande. Le site public ne peut ni consulter ni modifier les réponses.

Pour afficher une ligne par question dans **SQL Editor** :

```sql
select r.name, r.submitted_at,
       a.value->>'question' as question,
       coalesce(a.value->>'value', 'Question passée') as reponse
from public.responses r
cross join lateral jsonb_array_elements(r.answers) with ordinality a(value, position)
order by r.submitted_at desc, r.id, a.position;
```

L’accès au tableau de bord est réservé aux membres du projet Supabase. N’y inviter que les personnes autorisées à lire les réponses.

## Mettre sur GitHub Pages

1. Créer un dépôt GitHub **public** pour bénéficier de Pages avec GitHub Free, puis y envoyer les fichiers de ce dossier sur la branche `main`.
2. Dans **Settings → Pages → Build and deployment → Source**, sélectionner **GitHub Actions**.
3. Lancer le workflow **Publier le questionnaire sur GitHub Pages** dans l’onglet Actions si aucun push ne le déclenche.
4. Récupérer le lien fourni par le déploiement Pages. Tous les chemins sont relatifs pour fonctionner aussi sous `https://utilisateur.github.io/nom-du-depot/`.

Seul `dist/` est publié. Le SQL, les tests et ce guide restent dans le dépôt, mais aucune donnée de participant n’y est stockée.

L’interface s’adapte au téléphone. Le manifeste fournit un affichage autonome sur les navigateurs compatibles et permet d’ajouter le site à l’écran d’accueil suivant le navigateur. Ce n’est pas une application distribuée sur les boutiques. Il n’y a pas de mode hors connexion : la connexion est nécessaire pour l’envoi.

## Gratuité et limites

Au 10 septembre 2026 : GitHub Pages est disponible avec un dépôt public sur GitHub Free. Supabase Free inclut 500 Mo de base et peut mettre le projet en pause après une semaine d’inactivité ; le réactiver depuis le tableau de bord si nécessaire. Le sous-domaine GitHub est gratuit ; un nom de domaine personnalisé acheté ailleurs est facultatif. Les offres peuvent évoluer.

- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://supabase.com/pricing
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/database/functions
- https://supabase.com/docs/guides/getting-started/api-keys

## Développement et vérification

Node.js 22 ou plus récent ; aucune dépendance à installer.

```sh
npm run dev
npm run check
npm test
```

Les tests couvrent le consentement, le mode aperçu sans appel réseau, les échecs, la confirmation du serveur et la réutilisation de l’identifiant. Ils ne remplacent pas le test réel Supabase. Les réponses reçues sont protégées par RLS et la révocation des droits `anon`/`authenticated`. Seule la fonction d’insertion est accessible au public ; elle valide le contenu, exige le consentement, empêche les doublons et plafonne globalement à 30 nouveaux envois par heure. Ce plafond est adapté à un lien partagé personnellement ; un service à grande audience demanderait une protection contre les abus plus élaborée.

Pour vérifier le SQL dans un PostgreSQL éphémère local (facultatif, aucune dépendance pour le site) :

```sh
npm install --prefix .sites-runtime/sql-check --no-save @electric-sql/pglite
node tests/database-check.mjs
```

Un outil navigateur facultatif peut lire l’étape courante sans exposer les réponses. Il est ignoré sur les navigateurs incompatibles.

Pour modifier les questions, éditer `dist/questions.js` **et** les identifiants/libellés de `supabase/schema.sql` ; incrémenter la version du questionnaire côté interface et base si la structure change. Les libellés des anciens envois sont conservés avec leurs réponses.
