"use client";

import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Home, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { religionLabels, RESULT_KEY } from "@/lib/questionnaire";
import type { SubmittedQuestionnaire } from "@/types/questionnaire";

function List({ values }: { values: string[] }) {
  return <div className="podium">{values.map((value, index) => <p key={value}><strong>{index + 1}.</strong> {value}</p>)}</div>;
}

export function Result() {
  const [result, setResult] = useState<SubmittedQuestionnaire | null | undefined>(undefined);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RESULT_KEY);
      // The completed result lives in sessionStorage and only exists in the browser.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult(raw ? JSON.parse(raw) as SubmittedQuestionnaire : null);
    } catch { setResult(null); }
  }, []);

  if (result === undefined) return <main className="result-page"><div className="loading-page">Préparation du verdict…</div></main>;
  if (!result) return <main className="result-page"><section className="empty-result"><h1>Aucun verdict à afficher pour l’instant.</h1><p>Le récapitulatif apparaît ici juste après l’envoi du questionnaire.</p><Link className="button button-primary" href="/questionnaire">Ouvrir le questionnaire</Link></section></main>;

  const a = result.answers;
  const country = a.paysDeReve === "Autre pays musulman" && a.paysDeReveAutre ? a.paysDeReveAutre : a.paysDeReve;
  return <main className="result-page">
    <div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" />
    <div className="result-shell">
      <motion.header className="result-hero" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <PartyPopper size={31} aria-hidden="true" />
        <p className="eyebrow">Le questionnaire a parlé</p>
        <h1>Verdict final 😌</h1>
        <p>Tu as survécu au questionnaire, et tes réponses ont bien été enregistrées.</p>
      </motion.header>

      <section className="summary-grid" aria-label="Résumé des réponses">
        <article className="summary-card"><h2>Anniversaire</h2><p className="summary-value">Le {a.jourDeNaissance} octobre 🎂</p><p className="summary-comment">Je prends note 📓</p></article>
        <article className="summary-card"><h2>Nourriture</h2><p className="summary-value">{a.nourritureCategorie}{a.platFavori ? ` · ${a.platFavori}` : ""}</p><p className="summary-comment">Une information utile pour éviter les longues négociations devant un menu.</p></article>
        <article className="summary-card"><h2>Ta journée réussie</h2><List values={a.successfulDay} /></article>
        <article className="summary-card"><h2>Trois qualités</h2><p className="summary-value">{a.qualities.map((value) => value === "Autre" && a.qualitiesAutre ? `Autre : ${a.qualitiesAutre}` : value).join(" · ")}</p><p className="summary-comment">Tu es trop modeste, je suis sûr que tu en as plus.</p></article>
        <article className="summary-card"><h2>Trois petits défauts</h2><p className="summary-value">{a.defauts.map((value) => value === "Autre" && a.defautsAutre ? `Autre : ${a.defautsAutre}` : value).join(" · ")}</p><p className="summary-comment">Dossier classé confidentiel… en théorie.</p></article>
        <article className="summary-card"><h2>Mariage</h2><p className="summary-value">Idéalement vers {a.ageMariageIdeal} ans</p><p className="summary-comment">Le comité prend acte de cette estimation.</p></article>
        <article className="summary-card"><h2>Religion et foyer</h2><p className="summary-value">{a.religionImportance ? `${a.religionImportance}/5 · ${religionLabels[a.religionImportance - 1]}` : "—"}</p></article>
        <article className="summary-card"><h2>Top 3 voyage</h2><List values={a.paysMusulmansAVisiter} /></article>
        <article className="summary-card wide-card"><h2>Réseaux sociaux</h2><List values={a.classementReseauxSociaux} /><p className="summary-comment">Favori&nbsp;: <span className="favorite-network">{a.classementReseauxSociaux[0]}</span> — information manifestement stratégique.</p></article>
      </section>

      {expanded && <motion.section className="full-summary" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
        <h2>Toutes tes autres réponses</h2>
        <dl>
          <div><dt>Ce qui te met de bonne humeur</dt><dd>{a.moodBoosters.join(" · ")}{a.moodBoosterAutre ? ` · ${a.moodBoosterAutre}` : ""}</dd></div>
          <div><dt>Projet professionnel</dt><dd>{a.planCarriere}</dd></div>
          <div><dt>Dans le couple</dt><dd>{a.coupleReligionActions.join(" · ")}</dd></div>
          <div><dt>Pour les enfants</dt><dd>{a.enfantsReligionPriorites.join(" · ")}</dd></div>
          <div><dt>Pays où vivre</dt><dd>{country}</dd></div>
          <div><dt>Petites attentions</dt><dd>{a.cadeauPref.join(" · ")}{a.cadeauAutre ? ` · ${a.cadeauAutre}` : ""}</dd></div>
          <div><dt>Journée libre</dt><dd>{a.freeDayChoice}</dd></div>
          <div><dt>Choix du restaurant</dt><dd>{a.decisionNourriture}</dd></div>
          <div><dt>Animal de compagnie</dt><dd>{a.animalChoice || "Pas encore répondu"}{a.animalChoice === "Oui, un autre animal" && a.animalAutre ? ` · ${a.animalAutre}` : ""}</dd></div>
          <div><dt>Continuer la discussion</dt><dd>{a.accordSurReseau === "yes" ? "Oui 😌" : "Non 🥲"}</dd></div>
          {a.messageLibre && <div><dt>Un dernier mot</dt><dd className="free-message">{a.messageLibre}</dd></div>}
        </dl>
      </motion.section>}

      <div className="review-action"><Button type="button" variant="secondary" onClick={() => setExpanded((value) => !value)}>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />} Revoir mes réponses</Button></div>
      <footer className="result-footer"><h2>Merci d’avoir joué le jeu Wassila :)</h2><Link className="button" href="/"><Home size={18} /> Retour à l’accueil</Link></footer>
    </div>
  </main>;
}
