import { config } from './config.js';
import { questions } from './questions.js';
export function isConfigured(settings = config) {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(settings.supabaseUrl) &&
    /^sb_publishable_[a-zA-Z0-9_-]+$/.test(settings.supabasePublishableKey);
}
export function validateSubmission(payload) {
  if (!payload || typeof payload.name !== 'string' || payload.name.trim().length < 1 || payload.name.trim().length > 60) throw new Error('Indique un prénom ou un pseudo (60 caractères maximum).');
  if (payload.consent !== true) throw new Error('Ton accord est nécessaire pour envoyer tes réponses.');
  if (typeof payload.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.id) || payload.version !== '1') throw new Error('L’identifiant ou la version de l’envoi est invalide.');
  if (!Array.isArray(payload.answers) || payload.answers.length !== 12 || payload.answers.some(a => !a || typeof a.id !== 'string' || (a.value !== null && (typeof a.value !== 'string' || a.value.length > 1000)))) throw new Error('Certaines réponses ne sont pas valides.');
  if (new Set(payload.answers.map(a => a.id)).size !== 12 || payload.answers.some(a => !questions.some(q => q.id === a.id))) throw new Error('Certaines questions ne sont pas valides.');
}
export async function sendSubmission(payload, { settings = config, fetcher = fetch } = {}) {
  validateSubmission(payload);
  if (!isConfigured(settings)) throw new Error('Cet aperçu ne peut pas encore enregistrer de réponses.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetcher(`${settings.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/submit_answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: settings.supabasePublishableKey },
      body: JSON.stringify({ submission: payload }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('L’enregistrement n’a pas été confirmé. Tes réponses restent ici : réessaie dans un instant.');
    const receipt = await response.json();
    if (receipt !== payload.id) throw new Error('L’enregistrement n’a pas été confirmé. Tu peux réessayer.');
    return receipt;
  } catch (error) {
    if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('La connexion a été interrompue. Garde cette page ouverte, puis réessaie.');
    throw error;
  } finally { clearTimeout(timeout); }
}
