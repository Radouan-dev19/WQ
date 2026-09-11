import type { QuestionnaireAnswers, QuestionnaireState } from "@/types/questionnaire";

export const STORAGE_KEY = "marhba-wassila-draft-v1";
export const RESULT_KEY = "marhba-wassila-result-v1";

export const foodCategories = ["Cuisine marocaine", "Italienne", "Asiatique", "Burgers / fast-food", "Grillades", "Poisson / fruits de mer / sushi", "Autre"];
export const moodOptions = ["Manger quelque chose que j’aime 🍰", "Parler avec quelqu’un que j’apprécie", "Recevoir une attention / un cadeau", "Sortir prendre l’air", "Dormir 😴", "Rire", "Écouter de la musique", "Passer du temps avec ma famille", "Avoir un moment seule", "Faire du sport", "Autre"];
export const successfulDayOptions = ["J’ai été productive", "J’ai appris quelque chose", "J’ai passé du temps avec les personnes que j’aime", "J’ai beaucoup rigolé", "J’ai pris soin de moi", "J’ai avancé dans mes objectifs", "J’ai accompli mes prières correctement", "J’ai eu du temps pour me reposer", "J’ai fait quelque chose de spontané", "Autre"];
export const qualityOptions = ["Attentionnée", "Ambitieuse", "Généreuse", "Drôle", "Loyale", "Patiente", "Respectueuse", "Organisée", "Empathique", "Déterminée", "Calme", "Honnête", "Affectueuse", "Autre"];
export const flawOptions = ["Têtue", "Impatiente", "Jalouse", "Susceptible", "Désordonnée", "Trop perfectionniste", "Réservée", "Parfois trop directe", "Rancunière", "Stressée", "Indécise", "Trop exigeante", "Autre"];
export const careerOptions = ["Travailler à temps plein et développer ma carrière", "Travailler, mais garder beaucoup de temps pour ma famille", "Travailler à temps partiel", "Arrêter éventuellement de travailler pour m’occuper de mon foyer", "Ça dépendra surtout de ma situation à ce moment-là"];
export const religionLabels = ["Importante, sans être centrale", "Présente dans les moments importants", "Très présente au quotidien", "Une base forte du foyer", "Au centre de la vie familiale"];
export const coupleReligionOptions = ["Se rappeler mutuellement les prières", "Apprendre ensemble", "Écouter des rappels ou conférences ensemble", "Lire et étudier davantage le Coran et la Sunnah", "Se conseiller avec douceur", "Fréquenter un environnement positif", "Accomplir certaines pratiques ensemble", "Laisser chacun progresser à son rythme tout en s’encourageant"];
export const childrenReligionOptions = ["Leur apprendre la prière tôt", "Leur apprendre le Coran", "Leur expliquer la religion avec douceur", "Leur donner surtout un bon exemple à la maison", "Leur apprendre la langue arabe", "Les entourer d’un environnement musulman positif", "Leur transmettre de bonnes valeurs et un bon comportement"];
export const travelOptions = ["Arabie saoudite 🇸🇦", "Émirats arabes unis 🇦🇪", "Malaisie 🇲🇾", "Indonésie 🇮🇩", "Turquie 🇹🇷", "Qatar 🇶🇦", "Oman 🇴🇲", "Maroc 🇲🇦", "Égypte 🇪🇬", "Bali"];
export const countryOptions = ["Émirats arabes unis", "Qatar", "Arabie saoudite", "Malaisie", "Turquie", "Autre pays musulman", "Je préfère rester proche de ma famille", "Je ne sais pas encore"];
export const socialOptions = ["Instagram", "Snapchat", "TikTok", "WhatsApp", "Facebook", "X / Twitter"];
export const giftOptions = ["Fleurs 💐", "Chocolat / gourmandises", "Parfum", "Bijoux", "Livre", "Quelque chose lié à un souvenir", "Une sortie surprise", "Un petit cadeau personnalisé", "Un message attentionné suffit", "Autre"];
export const freeDayOptions = ["Dormir jusqu’à ce que mon corps décide lui-même de l’heure", "Sortie / restaurant", "Journée famille", "Journée séries / films", "Shopping", "Voyage improvisé", "Rester seule tranquillement"];
export const foodDecisionOptions = ["Moi évidemment", "Toi, exceptionnellement", "Celui qui a la meilleure idée", "Pierre-feuille-ciseaux", "On commande les deux et on arrête de compliquer la vie"];
export const animalOptions = ["Oui, un chat de préférence 🐈", "Oui, un autre animal", "Non, pas spécialement"];

export const flow = [
  { question: 1, label: "Anniversaire" }, { question: 2, label: "Plat préféré" },
  { question: 3, label: "Bonne humeur" }, { question: 4, label: "Journée réussie" },
  { question: 5, label: "Qualités" }, { question: 6, label: "Défauts" },
  { question: 7, label: "Mariage" }, { question: 8, label: "Projet professionnel" },
  { question: 9, label: "Religion", substep: "1 sur 3" },
  { question: 9, label: "Religion", substep: "2 sur 3" },
  { question: 9, label: "Religion", substep: "3 sur 3" },
  { question: 10, label: "Voyages" }, { question: 11, label: "Pays où vivre" },
  { question: 12, label: "Réseaux sociaux" }, { question: 13, label: "Petites attentions" },
  { question: 14, label: "Journée libre" }, { question: 15, label: "Négociation importante" },
  { question: 16, label: "Animal de compagnie" }, { question: 17, label: "Dernière question" },
] as const;

export const initialAnswers: QuestionnaireAnswers = {
  jourDeNaissance: null, nourritureCategorie: "", platFavori: "", moodBoosters: [], moodBoosterAutre: "",
  successfulDay: [], qualities: [], qualitiesAutre: "", defauts: [], defautsAutre: "", ageMariageIdeal: null, planCarriere: "",
  religionImportance: null, coupleReligionActions: [], enfantsReligionPriorites: [], paysMusulmansAVisiter: [],
  paysDeReve: "", paysDeReveAutre: "", classementReseauxSociaux: socialOptions, cadeauPref: [], cadeauAutre: "",
  freeDayChoice: "", decisionNourriture: "", animalChoice: "", animalAutre: "", accordSurReseau: null, finalNoAttempts: 0, messageLibre: "",
};

export function createInitialState(started = false): QuestionnaireState {
  return { version: 1, started, currentStep: 0, submissionId: crypto.randomUUID(), startedAt: new Date().toISOString(), answers: structuredClone(initialAnswers) };
}

export function validateStep(step: number, a: QuestionnaireAnswers): string | null {
  const checks: Record<number, string | null> = {
    0: a.jourDeNaissance ? null : "Choisis le jour de ton anniversaire.",
    1: a.nourritureCategorie ? null : "Choisis au moins une catégorie.",
    2: a.moodBoosters.length >= 1 && a.moodBoosters.length <= 2 ? null : "Choisis une ou deux réponses.",
    3: a.successfulDay.length >= 1 && a.successfulDay.length <= 3 ? null : "Choisis entre une et trois réponses.",
    4: a.qualities.length === 3 && (!a.qualities.includes("Autre") || a.qualitiesAutre.trim()) ? null : "Choisis exactement trois qualités et précise « Autre » si besoin.",
    5: a.defauts.length === 3 && (!a.defauts.includes("Autre") || a.defautsAutre.trim()) ? null : "Choisis exactement trois défauts et précise « Autre » si besoin.",
    6: a.ageMariageIdeal ? null : "Choisis un âge.", 7: a.planCarriere ? null : "Choisis la réponse qui te correspond le mieux.",
    8: a.religionImportance ? null : "Choisis un niveau d’importance.",
    9: a.coupleReligionActions.length >= 1 && a.coupleReligionActions.length <= 3 ? null : "Choisis entre une et trois réponses.",
    10: a.enfantsReligionPriorites.length >= 1 && a.enfantsReligionPriorites.length <= 3 ? null : "Choisis entre une et trois réponses.",
    11: a.paysMusulmansAVisiter.length === 3 ? null : "Compose un classement de trois destinations.",
    12: a.paysDeReve ? null : "Choisis une réponse.",
    13: a.classementReseauxSociaux.length === 6 ? null : "Classe les six réseaux.",
    14: a.cadeauPref.length >= 1 && a.cadeauPref.length <= 3 ? null : "Choisis entre une et trois attentions.",
    15: a.freeDayChoice ? null : "Choisis ton programme idéal.",
    16: a.decisionNourriture ? null : "Choisis qui tranche cette question essentielle.",
    17: a.animalChoice && (a.animalChoice !== "Oui, un autre animal" || a.animalAutre.trim()) ? null : a.animalChoice ? "Précise quel autre animal tu aimerais." : "Choisis une réponse.",
    18: a.accordSurReseau ? null : "Choisis ta réponse, même si le bouton Non essaie de négocier.",
  };
  return checks[step] ?? null;
}

export function validateAll(a: QuestionnaireAnswers): string | null {
  for (let i = 0; i < flow.length; i += 1) { const error = validateStep(i, a); if (error) return `Question ${flow[i].question} : ${error}`; }
  return null;
}
