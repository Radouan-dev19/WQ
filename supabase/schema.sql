-- À exécuter dans le SQL Editor d’un nouveau projet Supabase.
-- Aucune réponse n’est lisible depuis le site ou avec la clé publique.
begin;
create table if not exists public.responses (
  id uuid primary key,
  submitted_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 60),
  questionnaire_version text not null,
  consent_at timestamptz not null default now(),
  consent_version text not null default '2026-09-10-v1',
  answers jsonb not null check (jsonb_typeof(answers) = 'array')
);
create index if not exists responses_submitted_at_idx on public.responses (submitted_at desc);
alter table public.responses enable row level security;
revoke all on table public.responses from public, anon, authenticated;
-- Le propriétaire consulte, exporte ou supprime depuis son tableau de bord Supabase.
grant all on table public.responses to service_role;

create or replace function public.submit_answers(submission jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  submission_id uuid;
  participant text;
  answer jsonb;
  allowed_ids text[] := array['weekend','superpower','food','planning','home','energy','communication','tiny_joy','faith','marriage','future','ask_back'];
  titles text[] := array[
    'Ton dimanche idéal, il ressemble à quoi ?',
    'On te prête un super-pouvoir. Tu prends lequel ?',
    'Le plat qui peut sauver ta journée ?',
    '« On part demain. » Tu réponds quoi ?',
    'Un foyer où tu te sens bien, c’est comment ?',
    'Pour recharger tes batteries, tu as besoin…',
    'Quand quelque chose te contrarie, qu’est-ce qui t’aide ?',
    'Un petit truc qui te met instantanément de bonne humeur ?',
    'Quelle place aimerais-tu donner à la foi dans ton futur foyer ?',
    'Dans le mariage, quelles qualités comptent le plus pour toi ?',
    'Un projet de vie que tu aimerais pouvoir partager à deux ?',
    'À ton tour : tu aimerais me poser quelle question ?'
  ];
  seen text[] := array[]::text[];
  normalized jsonb := '[]'::jsonb;
  previous public.responses%rowtype;
  idx integer;
begin
  if jsonb_typeof(submission) is distinct from 'object' or octet_length(submission::text) > 65000 then
    raise exception 'Envoi invalide';
  end if;
  if submission->'consent' is distinct from 'true'::jsonb or submission->>'version' is distinct from '1' then
    raise exception 'Accord ou version invalide';
  end if;
  if jsonb_typeof(submission->'name') is distinct from 'string' or
     jsonb_typeof(submission->'id') is distinct from 'string' then raise exception 'Identité invalide'; end if;
  participant := btrim(submission->>'name');
  if char_length(participant) not between 1 and 60 then raise exception 'Prénom invalide'; end if;
  submission_id := (submission->>'id')::uuid;
  if jsonb_typeof(submission->'answers') is distinct from 'array' then raise exception 'Réponses invalides'; end if;
  if jsonb_array_length(submission->'answers') <> 12 then raise exception '12 réponses attendues'; end if;
  for answer in select value from jsonb_array_elements(submission->'answers') loop
    if jsonb_typeof(answer) is distinct from 'object' or jsonb_typeof(answer->'id') is distinct from 'string' then
      raise exception 'Question invalide';
    end if;
    if not ((answer->>'id') = any(allowed_ids)) or (answer->>'id') = any(seen) then raise exception 'Question inconnue ou répétée'; end if;
    if not (answer ? 'value') or jsonb_typeof(answer->'value') not in ('string','null') then raise exception 'Réponse invalide'; end if;
    if char_length(answer->>'value') > 1000 then raise exception 'Réponse trop longue'; end if;
    seen := array_append(seen, answer->>'id');
    idx := array_position(allowed_ids, answer->>'id');
    normalized := normalized || jsonb_build_array(jsonb_build_object('id', answer->>'id', 'question', titles[idx], 'value', answer->'value'));
  end loop;
  -- Sérialise l’écriture et le plafond pour empêcher une course entre envois.
  perform pg_advisory_xact_lock(19371824);
  select * into previous from public.responses where id = submission_id;
  if found then
    if previous.name = participant and previous.answers = normalized and previous.questionnaire_version = '1' then
      return submission_id;
    end if;
    raise exception 'Cet identifiant correspond déjà à un autre envoi';
  end if;
  if (select count(*) from public.responses where submitted_at > now() - interval '1 hour') >= 30 then
    raise exception 'Trop d’envois. Réessayez plus tard.';
  end if;
  insert into public.responses (id, name, questionnaire_version, answers)
  values (submission_id, participant, '1', normalized);
  return submission_id;
end;
$$;
revoke all on function public.submit_answers(jsonb) from public, anon, authenticated;
grant execute on function public.submit_answers(jsonb) to anon;
commit;
