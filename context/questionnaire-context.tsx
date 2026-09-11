"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createInitialState, RESULT_KEY, socialOptions, STORAGE_KEY } from "@/lib/questionnaire";
import type { QuestionnaireAnswers, QuestionnaireState, SubmittedQuestionnaire } from "@/types/questionnaire";

type ContextValue = {
  state: QuestionnaireState;
  ready: boolean;
  savedDraft: QuestionnaireState | null;
  begin: () => void;
  updateAnswers: (patch: Partial<QuestionnaireAnswers>) => void;
  setStep: (step: number) => void;
  resume: () => void;
  restart: () => void;
  markSubmitted: () => SubmittedQuestionnaire;
};

const QuestionnaireContext = createContext<ContextValue | null>(null);

export function QuestionnaireProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<QuestionnaireState>(() => createInitialState());
  const [savedDraft, setSavedDraft] = useState<QuestionnaireState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as QuestionnaireState;
        if (parsed.version === 1 && parsed.started && parsed.currentStep >= 0) {
          const savedRanking = parsed.answers.classementReseauxSociaux ?? [];
          parsed.answers.classementReseauxSociaux = [
            ...savedRanking.filter((network) => socialOptions.includes(network)),
            ...socialOptions.filter((network) => !savedRanking.includes(network)),
          ];
          parsed.answers.animalChoice ??= "";
          parsed.answers.animalAutre ??= "";
          // The draft comes from an external browser store and is restored after hydration.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSavedDraft(parsed);
        }
      }
    } catch { localStorage.removeItem(STORAGE_KEY); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !savedDraft && state.started) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, savedDraft, state]);

  const updateAnswers = useCallback((patch: Partial<QuestionnaireAnswers>) => {
    setState((current) => ({ ...current, answers: { ...current.answers, ...patch } }));
  }, []);
  const begin = useCallback(() => setState((current) => current.started ? current : { ...current, started: true }), []);
  const setStep = useCallback((step: number) => setState((current) => ({ ...current, currentStep: step })), []);
  const resume = useCallback(() => { if (savedDraft) setState(savedDraft); setSavedDraft(null); }, [savedDraft]);
  const restart = useCallback(() => { localStorage.removeItem(STORAGE_KEY); setState(createInitialState(true)); setSavedDraft(null); }, []);
  const markSubmitted = useCallback(() => {
    const completed: SubmittedQuestionnaire = { ...state, completedAt: new Date().toISOString() };
    localStorage.removeItem(STORAGE_KEY); sessionStorage.setItem(RESULT_KEY, JSON.stringify(completed));
    return completed;
  }, [state]);
  const value = useMemo(() => ({ state, ready, savedDraft, begin, updateAnswers, setStep, resume, restart, markSubmitted }), [state, ready, savedDraft, begin, updateAnswers, setStep, resume, restart, markSubmitted]);
  return <QuestionnaireContext.Provider value={value}>{children}</QuestionnaireContext.Provider>;
}

export function useQuestionnaire() {
  const value = useContext(QuestionnaireContext);
  if (!value) throw new Error("useQuestionnaire doit être utilisé dans QuestionnaireProvider");
  return value;
}
