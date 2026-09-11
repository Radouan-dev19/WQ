import Link from "next/link";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="welcome-page">
      <div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" />
      <section className="welcome-card">
        <div className="welcome-mark" aria-hidden="true"><Sparkles size={22} /></div>
        <p className="eyebrow">Une petite parenthèse rien que pour toi</p>
        <h1>Marhba Wassila <span>:)</span></h1>
        <p className="welcome-subtitle">Petit questionnaire pour mieux te connaître <span>:)</span><br />Essaye d’avoir les bonnes réponses <span>;)</span></p>
        <div className="promise"><Clock3 size={19} aria-hidden="true" /><p>Promis, ce n’est ni un examen de chirurgie dentaire, ni un interrogatoire 😌<br /><strong>Normalement ça prend moins de 10 minutes.</strong></p></div>
        <Link className="button button-primary welcome-button" href="/questionnaire">Commencer <ArrowRight size={19} aria-hidden="true" /></Link>
        <p className="tiny-note">Certaines réponses peuvent avoir de lourdes conséquences… comme choisir le mauvais plat préféré 👀</p>
      </section>
      <p className="personal-signature">Fait avec curiosité, douceur et une petite dose de mauvaise foi.</p>
    </main>
  );
}

