export type YesNo = "yes" | "no" | null;

export interface QuestionnaireAnswers {
  jourDeNaissance: number | null;
  nourritureCategorie: string;
  platFavori: string;
  moodBoosters: string[];
  moodBoosterAutre: string;
  successfulDay: string[];
  qualities: string[];
  defauts: string[];
  ageMariageIdeal: number | null;
  planCarriere: string;
  religionImportance: number | null;
  coupleReligionActions: string[];
  enfantsReligionPriorites: string[];
  paysMusulmansAVisiter: string[];
  paysDeReve: string;
  paysDeReveAutre: string;
  classementReseauxSociaux: string[];
  cadeauPref: string[];
  cadeauAutre: string;
  freeDayChoice: string;
  decisionNourriture: string;
  animalChoice: string;
  animalAutre: string;
  accordSurReseau: YesNo;
  finalNoAttempts: number;
}

export interface QuestionnaireState {
  version: 1;
  started: boolean;
  currentStep: number;
  submissionId: string;
  startedAt: string;
  answers: QuestionnaireAnswers;
}

export interface SubmittedQuestionnaire extends QuestionnaireState {
  completedAt: string;
}
