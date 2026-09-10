import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAll } from "@/lib/questionnaire";
import type { QuestionnaireState } from "@/types/questionnaire";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    if (Number(request.headers.get("content-length") ?? 0) > 50_000) return NextResponse.json({ error: "La réponse envoyée est trop volumineuse." }, { status: 413 });
    const state = await request.json() as QuestionnaireState;
    if (!state || state.version !== 1 || !uuidPattern.test(state.submissionId) || !state.answers) return NextResponse.json({ error: "Les réponses reçues ne sont pas valides." }, { status: 400 });
    const validation = validateAll(state.answers);
    if (validation) return NextResponse.json({ error: validation }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return NextResponse.json({ error: "Supabase n’est pas encore configuré. Tes réponses sont conservées sur ce téléphone." }, { status: 503 });

    const a = state.answers;
    const supabase = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.from("questionnaire_responses").insert({
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
      accord_sur_reseau: a.accordSurReseau === "yes",
      final_no_attempts: a.finalNoAttempts,
      answers: a,
    });
    if (error && error.code !== "23505") throw error;
    return NextResponse.json({ ok: true, id: state.submissionId });
  } catch (error) {
    console.error("Questionnaire submission failed", error);
    return NextResponse.json({ error: "L’enregistrement n’a pas abouti. Tes réponses sont conservées sur ce téléphone, tu peux réessayer." }, { status: 500 });
  }
}
