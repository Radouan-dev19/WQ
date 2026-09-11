"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCESS_KEY = "wq-site-access-v1";
const PASSWORD_SALT = "wq-site-access-v1";

async function digestPassword(password: string) {
  const bytes = new TextEncoder().encode(`${PASSWORD_SALT}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function SitePasswordGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "locked" | "unlocked">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Access is kept only for the current browser tab.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(sessionStorage.getItem(ACCESS_KEY) === "granted" ? "unlocked" : "locked");
  }, []);

  const unlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) return;

    setChecking(true);
    setError("");

    const expectedHash = process.env.NEXT_PUBLIC_SITE_PASSWORD_HASH;
    const submittedHash = await digestPassword(password);

    if (expectedHash && submittedHash === expectedHash) {
      sessionStorage.setItem(ACCESS_KEY, "granted");
      setStatus("unlocked");
      setPassword("");
    } else {
      setError(expectedHash ? "Ce mot de passe n’est pas le bon." : "L’accès privé n’est pas encore configuré.");
    }

    setChecking(false);
  };

  if (status === "unlocked") return children;

  if (status === "checking") {
    return <main className="access-page"><div className="loading-page"><LoaderCircle className="spin-icon" /> Vérification de l’accès…</div></main>;
  }

  return (
    <main className="access-page">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <section className="access-card" aria-labelledby="access-title">
        <div className="access-mark" aria-hidden="true"><LockKeyhole size={24} /></div>
        <p className="eyebrow">Accès privé</p>
        <h1 id="access-title">Entre le mot de passe</h1>
        <p className="access-intro">Cette petite parenthèse est réservée à la personne qui a reçu le lien.</p>
        <form onSubmit={unlock}>
          <label className="field-label" htmlFor="site-password">Mot de passe</label>
          <input
            id="site-password"
            className="text-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "access-error" : undefined}
            autoFocus
          />
          {error && <p id="access-error" className="validation-error" role="alert">{error}</p>}
          <Button type="submit" disabled={checking || !password}>
            {checking ? <><span className="spinner" /> Vérification…</> : <>Accéder au questionnaire</>}
          </Button>
        </form>
      </section>
    </main>
  );
}
