create table if not exists public.questionnaire_responses (
  id uuid primary key,
  created_at timestamptz not null default now(),
  jour_de_naissance smallint not null check (jour_de_naissance between 1 and 31),
  nourriture_categorie text not null,
  plat_favori text,
  mood_boosters text[] not null check (cardinality(mood_boosters) between 1 and 2),
  successful_day text[] not null check (cardinality(successful_day) between 1 and 3),
  qualities text[] not null check (cardinality(qualities) = 3),
  defauts text[] not null check (cardinality(defauts) = 3),
  age_mariage_ideal smallint not null check (age_mariage_ideal between 21 and 30),
  plan_carriere text not null,
  religion_importance smallint not null check (religion_importance between 1 and 5),
  couple_religion_actions text[] not null check (cardinality(couple_religion_actions) between 1 and 3),
  enfants_religion_priorites text[] not null check (cardinality(enfants_religion_priorites) between 1 and 3),
  pays_musulmans_a_visiter text[] not null check (cardinality(pays_musulmans_a_visiter) = 3),
  pays_de_reve text not null,
  classement_reseaux_sociaux text[] not null check (cardinality(classement_reseaux_sociaux) = 5),
  reseau_social_prefere text not null,
  cadeau_pref text[] not null check (cardinality(cadeau_pref) between 1 and 2),
  free_day_choice text not null,
  decision_nourriture text not null,
  accord_sur_reseau boolean not null,
  final_no_attempts smallint not null default 0 check (final_no_attempts >= 0),
  answers jsonb not null check (jsonb_typeof(answers) = 'object')
);

alter table public.questionnaire_responses enable row level security;

revoke all on table public.questionnaire_responses from public, anon, authenticated;
grant insert on table public.questionnaire_responses to anon, authenticated;

drop policy if exists "public_can_only_submit_questionnaire" on public.questionnaire_responses;
create policy "public_can_only_submit_questionnaire"
on public.questionnaire_responses
for insert
to anon, authenticated
with check (
  jour_de_naissance between 1 and 31
  and age_mariage_ideal between 21 and 30
  and religion_importance between 1 and 5
  and cardinality(qualities) = 3
  and cardinality(defauts) = 3
  and cardinality(pays_musulmans_a_visiter) = 3
  and cardinality(classement_reseaux_sociaux) = 5
);

comment on table public.questionnaire_responses is
'Réponses du questionnaire. Les visiteurs peuvent uniquement insérer; la lecture reste réservée au propriétaire dans Supabase.';
