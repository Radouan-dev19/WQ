"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, LoaderCircle, LockKeyhole, RotateCcw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuestionnaire } from "@/context/questionnaire-context";
import {
  animalOptions, careerOptions, childrenReligionOptions, countryOptions, coupleReligionOptions, flawOptions,
  flow, foodCategories, foodDecisionOptions, freeDayOptions, giftOptions, moodOptions,
  qualityOptions, religionLabels, socialOptions, successfulDayOptions, travelOptions,
  validateStep,
} from "@/lib/questionnaire";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SelectionGrid } from "@/components/ui/selection-grid";
import { SortableRanking } from "@/components/ui/sortable-ranking";
import { submitQuestionnaire } from "@/lib/supabase-questionnaire";

const foodReactions = [
  "Une décision diplomatique très sérieuse vient d’être prise.",
  "Noté. Cette information pourra servir pour une future commande 👀",
  "Je respecte ce choix… pour le moment 😌",
];

function SingleChoice({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return <SelectionGrid options={options} selected={value ? [value] : []} onChange={(values) => onChange(values.at(-1) ?? "")} />;
}

function StepContent({ step, foodReaction, setFoodReaction }: { step: number; foodReaction: string; setFoodReaction: (value: string) => void }) {
  const { state, updateAnswers } = useQuestionnaire();
  const a = state.answers;

  if (step === 0) return <>
    <h1>Quel jour d’octobre est ton anniversaire&nbsp;?</h1>
    <p className="question-intro">On commence doucement. Le mois est déjà connu, il ne manque que le détail qui évite une catastrophe annuelle.</p>
    <div className="day-grid" role="group" aria-label="Jour de naissance en octobre">
      {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => <button key={day} type="button" className={`day-button ${a.jourDeNaissance === day ? "active" : ""}`} aria-pressed={a.jourDeNaissance === day} onClick={() => updateAnswers({ jourDeNaissance: day })}>{day}</button>)}
    </div>
    {a.jourDeNaissance && <p className="reaction">J’en prends note 📝</p>}
  </>;

  if (step === 1) return <>
    <h1>On parle nourriture&nbsp;?</h1>
    <p className="question-intro">Quelle cuisine gagne le plus souvent ton cœur&nbsp;?</p>
    <SingleChoice options={foodCategories} value={a.nourritureCategorie} onChange={(nourritureCategorie) => updateAnswers({ nourritureCategorie })} />
    <div className="field-block"><label className="field-label" htmlFor="plat-favori">Et ton plat préféré, si tu devais en choisir un&nbsp;?</label><input id="plat-favori" className="text-input" value={a.platFavori} onChange={(event) => updateAnswers({ platFavori: event.target.value })} placeholder="Réponse facultative" maxLength={100} /></div>
  </>;

  if (step === 2) return <>
    <h1>Qu’est-ce qui te remet vite de bonne humeur&nbsp;?</h1>
    <p className="question-intro">Choisis jusqu’à deux réponses. Oui, dormir compte comme une vraie stratégie.</p>
    <SelectionGrid options={moodOptions} selected={a.moodBoosters} onChange={(moodBoosters) => updateAnswers({ moodBoosters })} max={2} columns={2} />
    {a.moodBoosters.includes("Autre") && <div className="field-block"><label className="field-label" htmlFor="mood-autre">Ta réponse</label><input id="mood-autre" className="text-input" value={a.moodBoosterAutre} onChange={(event) => updateAnswers({ moodBoosterAutre: event.target.value })} maxLength={120} /></div>}
  </>;

  if (step === 3) return <>
    <h1>À quoi reconnais-tu une journée réussie&nbsp;?</h1>
    <p className="question-intro">Choisis jusqu’à trois choses qui te font dire&nbsp;: «&nbsp;aujourd’hui, c’était une bonne journée&nbsp;».</p>
    <SelectionGrid options={successfulDayOptions} selected={a.successfulDay} onChange={(successfulDay) => updateAnswers({ successfulDay })} max={3} columns={2} />
  </>;

  if (step === 4) return <>
    <h1>Choisis exactement trois qualités qui te ressemblent.</h1>
    <p className="question-intro">Le moment de te vendre un peu, avec élégance bien sûr.</p>
    <SelectionGrid options={qualityOptions} selected={a.qualities} onChange={(qualities) => updateAnswers({ qualities })} max={3} exact={3} columns={2} />
    {a.qualities.includes("Autre") && <div className="field-block"><label className="field-label" htmlFor="quality-other">Quelle qualité&nbsp;?</label><input id="quality-other" className="text-input" value={a.qualitiesAutre} onChange={(event) => updateAnswers({ qualitiesAutre: event.target.value })} placeholder="Par exemple : créative…" maxLength={100} /></div>}
  </>;

  if (step === 5) return <>
    <h1>Maintenant, exactement trois petits défauts.</h1>
    <p className="question-intro"><strong>Promis, tes réponses ne seront pas utilisées contre toi devant un tribunal.</strong><br />Dans une future discussion, en revanche… je ne garantis rien 😌</p>
    <SelectionGrid options={flawOptions} selected={a.defauts} onChange={(defauts) => updateAnswers({ defauts })} max={3} exact={3} columns={2} />
    {a.defauts.includes("Autre") && <div className="field-block"><label className="field-label" htmlFor="flaw-other">Quel défaut&nbsp;?</label><input id="flaw-other" className="text-input" value={a.defautsAutre} onChange={(event) => updateAnswers({ defautsAutre: event.target.value })} placeholder="Par exemple : je réfléchis trop…" maxLength={100} /></div>}
  </>;

  if (step === 6) return <>
    <h1>À quel âge imagines-tu idéalement te marier&nbsp;?</h1>
    <p className="question-intro">Fais défiler et choisis ton âge. Cette réponse est très officiellement enregistrée.</p>
    <div className="age-wheel" role="group" aria-label="Âge idéal pour le mariage">
      {Array.from({ length: 10 }, (_, index) => index + 21).map((age) => <button key={age} type="button" className={`age-button ${a.ageMariageIdeal === age ? "active" : ""}`} aria-pressed={a.ageMariageIdeal === age} onClick={() => updateAnswers({ ageMariageIdeal: age })}>{age}</button>)}
    </div>
    {a.ageMariageIdeal && a.ageMariageIdeal > 22 && <p className="reaction">C’est beaucoup trop loin ça… choix à refaire 😂<br /><small>P.S. Ton vrai choix est quand même bien enregistré.</small></p>}
  </>;

  if (step === 7) return <>
    <h1>Comment imagines-tu ta carrière en dentaire / orthodontie&nbsp;?</h1>
    <p className="question-intro">Entre ambition professionnelle, équilibre et famille, quelle option se rapproche le plus de ton projet&nbsp;?</p>
    <SingleChoice options={careerOptions} value={a.planCarriere} onChange={(planCarriere) => updateAnswers({ planCarriere })} />
  </>;

  if (step === 8) return <>
    <h1>Quelle place aimerais-tu donner à la religion dans ta vie de famille&nbsp;?</h1>
    <div className="respect-note"><LockKeyhole size={19} aria-hidden="true" /><span>Il n’y a pas de bonne formule à réciter ici. Réponds simplement selon ce qui compte pour toi.</span></div>
    <div className="religion-scale" role="group" aria-label="Importance de la religion de 1 à 5">{religionLabels.map((label, index) => <button key={label} type="button" className={`scale-button ${a.religionImportance === index + 1 ? "active" : ""}`} aria-label={`${index + 1} sur 5 : ${label}`} aria-pressed={a.religionImportance === index + 1} onClick={() => updateAnswers({ religionImportance: index + 1 })}>{index + 1}</button>)}</div>
    <p className="scale-label">{a.religionImportance ? religionLabels[a.religionImportance - 1] : "Choisis un niveau pour voir sa signification."}</p>
  </>;

  if (step === 9) return <>
    <h1>Dans un couple, qu’aimerais-tu construire sur ce plan&nbsp;?</h1>
    <p className="question-intro">Choisis jusqu’à trois habitudes ou intentions qui te semblent importantes.</p>
    <SelectionGrid options={coupleReligionOptions} selected={a.coupleReligionActions} onChange={(coupleReligionActions) => updateAnswers({ coupleReligionActions })} max={3} columns={2} />
  </>;

  if (step === 10) return <>
    <h1>Et pour la transmission aux enfants&nbsp;?</h1>
    <p className="question-intro">Quelles seraient tes trois priorités au maximum&nbsp;?</p>
    <SelectionGrid options={childrenReligionOptions} selected={a.enfantsReligionPriorites} onChange={(enfantsReligionPriorites) => updateAnswers({ enfantsReligionPriorites })} max={3} columns={2} />
  </>;

  if (step === 11) {
    const available = travelOptions.filter((option) => !a.paysMusulmansAVisiter.includes(option));
    return <>
      <h1>Ton top 3 des pays musulmans à visiter&nbsp;?</h1>
      <p className="question-intro">Ajoute exactement trois destinations, puis mets-les dans ton ordre préféré.</p>
      <div className="choice-pool" aria-label="Destinations disponibles">{available.map((option) => <button type="button" className="pool-chip" key={option} disabled={a.paysMusulmansAVisiter.length >= 3} onClick={() => updateAnswers({ paysMusulmansAVisiter: [...a.paysMusulmansAVisiter, option] })}>+ {option}</button>)}</div>
      <SortableRanking items={a.paysMusulmansAVisiter} onChange={(paysMusulmansAVisiter) => updateAnswers({ paysMusulmansAVisiter })} removable />
    </>;
  }

  if (step === 12) return <>
    <h1>Dans quel pays pourrais-tu imaginer vivre plus tard&nbsp;?</h1>
    <p className="question-intro">Même si la réponse aujourd’hui peut encore changer demain.</p>
    <SingleChoice options={countryOptions} value={a.paysDeReve} onChange={(paysDeReve) => updateAnswers({ paysDeReve })} />
    {a.paysDeReve === "Autre pays musulman" && <div className="field-block"><label className="field-label" htmlFor="country-other">Lequel&nbsp;?</label><input id="country-other" className="text-input" value={a.paysDeReveAutre} onChange={(event) => updateAnswers({ paysDeReveAutre: event.target.value })} maxLength={80} /></div>}
  </>;

  if (step === 13) return <>
    <h1>Classe ces réseaux du préféré au moins utilisé.</h1>
    <p className="question-intro">Classe les six réseaux en faisant glisser les lignes, ou en utilisant les flèches. Le premier servira pour une toute dernière question.</p>
    <SortableRanking items={a.classementReseauxSociaux} onChange={(classementReseauxSociaux) => updateAnswers({ classementReseauxSociaux })} />
  </>;

  if (step === 14) return <>
    <h1>Quelles petites attentions te font le plus plaisir&nbsp;?</h1>
    <p className="question-intro">Choisis-en trois au maximum. Ceci ressemble beaucoup à une fiche de révision utile.</p>
    <SelectionGrid options={giftOptions} selected={a.cadeauPref} onChange={(cadeauPref) => updateAnswers({ cadeauPref })} max={3} columns={2} />
    {a.cadeauPref.includes("Autre") && <div className="field-block"><label className="field-label" htmlFor="gift-other">Ton idée</label><input id="gift-other" className="text-input" value={a.cadeauAutre} onChange={(event) => updateAnswers({ cadeauAutre: event.target.value })} maxLength={100} /></div>}
  </>;

  if (step === 15) return <>
    <h1>Une journée totalement libre, tu en fais quoi&nbsp;?</h1>
    <p className="question-intro">Aucune obligation, aucun réveil agressif, aucun programme imposé.</p>
    <SingleChoice options={freeDayOptions} value={a.freeDayChoice} onChange={(freeDayChoice) => updateAnswers({ freeDayChoice })} />
  </>;

  if (step === 16) return <>
    <h1>Si on n’est pas d’accord sur le restaurant, qui décide&nbsp;?</h1>
    <p className="question-intro">Une question fondamentale pour la paix du foyer.</p>
    <SingleChoice options={foodDecisionOptions} value={a.decisionNourriture} onChange={(decisionNourriture) => { updateAnswers({ decisionNourriture }); setFoodReaction(foodReactions[Math.floor(Math.random() * foodReactions.length)]); }} />
    {a.decisionNourriture && <p className="reaction" aria-live="polite">{foodReaction}</p>}
  </>;

  if (step === 17) return <>
    <h1>Est-ce que tu souhaiterais avoir un animal plus tard&nbsp;?</h1>
    <p className="question-intro">Un chat de préférence… mais les autres candidatures peuvent être étudiées 🐈</p>
    <SingleChoice options={animalOptions} value={a.animalChoice} onChange={(animalChoice) => updateAnswers({ animalChoice, animalAutre: animalChoice === "Oui, un autre animal" ? a.animalAutre : "" })} />
    {a.animalChoice === "Oui, un autre animal" && <div className="field-block"><label className="field-label" htmlFor="animal-other">Quel animal aimerais-tu&nbsp;?</label><input id="animal-other" className="text-input" value={a.animalAutre} onChange={(event) => updateAnswers({ animalAutre: event.target.value })} placeholder="Par exemple : un chien, un lapin…" maxLength={80} /></div>}
  </>;

  const favorite = a.classementReseauxSociaux[0] || socialOptions[0];
  const answered = a.accordSurReseau !== null;
  const chooseNo = () => {
    if (a.finalNoAttempts === 0) updateAnswers({ finalNoAttempts: 1 });
    else updateAnswers({ accordSurReseau: "no", finalNoAttempts: a.finalNoAttempts + 1 });
  };
  return <>
    <h1>Bon… maintenant la vraie dernière question 👀</h1>
    <p className="question-intro">Est-ce qu’on pourrait continuer à discuter sur <strong>{favorite}</strong>, avec des vocaux aussi pour plus de fluidité&nbsp;? 😌</p>
    <div className="final-choice-zone">
      <Button type="button" onClick={() => updateAnswers({ accordSurReseau: "yes" })} disabled={answered}>Oui, avec plaisir</Button>
      <Button type="button" variant="secondary" className={a.finalNoAttempts === 1 && !answered ? "fleeing" : ""} onClick={chooseNo} disabled={answered}>Non</Button>
    </div>
    <p className="final-message" aria-live="polite">{a.accordSurReseau === "yes" ? "Très bonne réponse… j’aurais été surpris du contraire 😌" : a.accordSurReseau === "no" ? "Aïe… au moins l’honnêteté est validée 🥲" : a.finalNoAttempts === 1 ? "Ce bouton avait visiblement besoin d’un instant pour réfléchir 😂" : ""}</p>
    {a.accordSurReseau === "yes" && <div className="confetti" aria-hidden="true">{Array.from({ length: 16 }, (_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties} />)}</div>}
    <div className="field-block final-message-field">
      <label className="field-label" htmlFor="message-libre">Dis-m’en plus sur toi ou si tu as quelque chose à rajouter :)</label>
      <textarea id="message-libre" className="text-input textarea-input" rows={5} value={a.messageLibre ?? ""} onChange={(event) => updateAnswers({ messageLibre: event.target.value })} placeholder="Je t’écoute…" maxLength={1000} />
      <p className="helper">Facultatif · {(a.messageLibre ?? "").length}/1000</p>
    </div>
  </>;
}

export function Questionnaire() {
  const router = useRouter();
  const { state, ready, savedDraft, begin, resume, restart, setStep, markSubmitted } = useQuestionnaire();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [foodReaction, setFoodReaction] = useState(foodReactions[0]);
  const step = state.currentStep;
  const meta = flow[step];
  const isLast = step === flow.length - 1;
  const progress = ((step + 1) / flow.length) * 100;

  useEffect(() => { if (ready && !savedDraft) begin(); }, [ready, savedDraft, begin]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const header = useMemo(() => meta.label === "Dernière question" ? "Dernière question" : `Question ${meta.question} sur 16${"substep" in meta ? ` · ${meta.substep}` : ""}`, [meta]);
  const next = () => {
    const validation = validateStep(step, state.answers);
    if (validation) { setError(validation); return; }
    setError("");
    setStep(Math.min(flow.length - 1, step + 1));
  };
  const previous = () => { setError(""); setStep(Math.max(0, step - 1)); };
  const submit = async () => {
    const validation = validateStep(step, state.answers);
    if (validation) { setError(validation); return; }
    setSubmitting(true); setError("");
    try {
      await submitQuestionnaire(state);
      markSubmitted(); router.push("/resultat");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Une erreur est survenue. Tes réponses sont conservées sur ce téléphone, tu peux réessayer.");
    } finally { setSubmitting(false); }
  };

  if (!ready) return <main className="questionnaire-page"><div className="loading-page"><LoaderCircle className="spin-icon" /> Préparation du questionnaire…</div></main>;

  return <main className="questionnaire-page">
    <div className="ambient ambient-one" aria-hidden="true" />
    <div className="questionnaire-shell">
      <header className="questionnaire-header"><div className="header-line"><p className="question-number">{header}</p><p className="question-topic">{meta.label}</p></div><Progress value={progress} /></header>
      <AnimatePresence mode="wait">
        <motion.section key={step} className="question-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .22 }}>
          <p className="step-kicker"><span /> Pour mieux te connaître</p>
          <div className="question-content"><StepContent step={step} foodReaction={foodReaction} setFoodReaction={setFoodReaction} /></div>
          {error && <p className="validation-error" role="alert">{error}</p>}
          {isLast && state.answers.accordSurReseau && <div className="submit-panel"><p><Heart size={15} aria-hidden="true" /> Tout est prêt. Tes réponses seront enregistrées en une seule fois.</p><Button type="button" onClick={submit} disabled={submitting}>{submitting ? <><span className="spinner" /> Enregistrement…</> : <><Sparkles size={18} /> Valider mes réponses</>}</Button></div>}
          <footer className="question-footer">
            <Button type="button" variant="ghost" onClick={previous} disabled={step === 0 || submitting}><ArrowLeft size={18} /> Précédent</Button>
            {!isLast && <Button type="button" onClick={next}>Continuer <ArrowRight size={18} /></Button>}
          </footer>
        </motion.section>
      </AnimatePresence>
    </div>
    {savedDraft && <div className="resume-overlay" role="presentation"><div className="resume-dialog" role="dialog" aria-modal="true" aria-labelledby="resume-title"><h2 id="resume-title">Tu avais commencé… Continuer&nbsp;?</h2><p>J’ai gardé tes réponses sur ce téléphone pour que tu n’aies pas à tout recommencer.</p><div className="resume-actions"><Button type="button" onClick={resume}>Continuer</Button><Button type="button" variant="secondary" onClick={restart}><RotateCcw size={17} /> Recommencer</Button></div></div></div>}
  </main>;
}
