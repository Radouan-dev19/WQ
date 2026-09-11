import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { validateAll } from "@/lib/questionnaire";
import type { QuestionnaireState } from "@/types/questionnaire";

let client: SupabaseClient | null = null;

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase n’est pas encore configuré. Tes réponses sont conservées sur ce téléphone.");
  }

  client ??= createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}

export async function submitQuestionnaire(state: QuestionnaireState) {
  const validation = validateAll(state.answers);
  if (validation) throw new Error(validation);

  const a = state.answers;
  const { error } = await getSupabaseClient().from("questionnaire_responses").insert({
    id: state.submissionId,
    jour_de_naissance: a.jourDeNaissance,
    nourriture_categorie: a.nourritureCategorie,
    plat_favori: a.platFavori || null,
    mood_boosters: a.moodBoosters,
    successful_day: a.successfulDay,
    qualities: a.qualities,
    defauts: a.defauts,
    age_mariage_ideal: a.ageMariageIdeal,
    plan_carriere: a.planCarriere,
    religion_importance: a.religionImportance,
    couple_religion_actions: a.coupleReligionActions,
    enfants_religion_priorites: a.enfantsReligionPriorites,
    pays_musulmans_a_visiter: a.paysMusulmansAVisiter,
    pays_de_reve: a.paysDeReve === "Autre pays musulman" && a.paysDeReveAutre ? a.paysDeReveAutre : a.paysDeReve,
    classement_reseaux_sociaux: a.classementReseauxSociaux,
    reseau_social_prefere: a.classementReseauxSociaux[0],
    cadeau_pref: a.cadeauPref,
    free_day_choice: a.freeDayChoice,
    decision_nourriture: a.decisionNourriture,
    animal_choice: a.animalChoice,
    animal_autre: a.animalChoice === "Oui, un autre animal" ? a.animalAutre : null,
    accord_sur_reseau: a.accordSurReseau === "yes",
    final_no_attempts: a.finalNoAttempts,
    answers: a,
  });

  if (error && error.code !== "23505") {
    console.error("Questionnaire submission failed", error);
    throw new Error("L’enregistrement n’a pas abouti. Tes réponses sont conservées sur ce téléphone, tu peux réessayer.");
  }
}
