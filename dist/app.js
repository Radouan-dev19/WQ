import { config } from './config.js';
import { questions, chapters } from './questions.js';
import { isConfigured, sendSubmission } from './data.js';

const $ = (selector) => document.querySelector(selector);
const card = $('#card');
const controls = $('#controls');
const live = isConfigured();
const state = { screen:'intro', index:0, name:'', answers:Array(questions.length).fill(null), breaks:new Set(), editing:false, consent:false, sending:false, pending:null, done:false };
let toastTimer;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button = (label, id, classes='') => `<button class="button ${classes}" id="${id}">${label}</button>`;
function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; toastTimer = setTimeout(()=>$('#toast').textContent='',4000); }
function error(message) { let node = $('#error'); if (!node) { node=document.createElement('p'); node.id='error'; node.className='error'; node.setAttribute('role','alert'); card.append(node); } node.textContent=message; }
function animate() { card.style.animation='none'; void card.offsetWidth; card.style.animation=''; $('#question-title')?.setAttribute('tabindex','-1'); $('#question-title')?.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
function header() {
  const progress = state.screen==='intro' ? 0 : state.screen==='question' || state.screen==='break' ? state.index : 12;
  $('#chapter').textContent=state.screen==='review'?'ON RELIT AVANT DE PARTAGER':state.screen==='done'?'LA DISCUSSION PEUT CONTINUER':chapters[Math.min(2,Math.floor(state.index/4))];
  $('#counter').textContent=state.screen==='intro'?'12 QUESTIONS · ≈ 5 MIN':state.screen==='question'?`${String(state.index+1).padStart(2,'0')} / 12`:state.screen==='review'?'À TOI DE CHOISIR':'BIEN JOUÉ';
  $('#progress-fill').style.width=`${progress/12*100}%`;
  $('.progress').setAttribute('aria-valuenow',progress);
  document.querySelectorAll('.chapter-track span').forEach((el,i)=>el.classList.toggle('active',i===Math.min(2,Math.floor(progress/4))));
}
function render() {
  header(); card.className='card'; controls.innerHTML='';
  if (state.screen==='intro') intro();
  if (state.screen==='question') question();
  if (state.screen==='break') interlude();
  if (state.screen==='review') review();
  if (state.screen==='done') done();
  animate();
}
function intro() {
  card.classList.add('intro');
  card.innerHTML=`<div class="card-top"><span class="eyebrow">UNE RENCONTRE, À TON RYTHME</span><span class="symbol" aria-hidden="true">✳</span></div><h1 id="question-title">On commence par ton petit nom ?</h1><p class="hint">Un peu d’humour, du quotidien et ce qui compte pour toi dans le mariage.</p><form id="name-form"><label class="field-label" for="name">Ton prénom ou ton pseudo</label><input class="text-field" id="name" name="name" autocomplete="given-name" placeholder="Moi, c’est…" maxlength="60" required value="${escapeHtml(state.name)}"><button type="submit" hidden>Commencer</button></form><p class="intro-note">Tu peux passer chaque question. À la fin, tu choisis de partager tes réponses avec ${escapeHtml(config.recipientName)}. <button id="learn-more">En savoir plus</button></p>`;
  controls.innerHTML=button('C’est parti <span aria-hidden="true">↗</span>','start','full');
  const start=()=>{ const input=$('#name'); if (!input.value.trim()) { input.setCustomValidity('Un prénom ou un pseudo, et c’est parti.'); input.reportValidity(); return; } state.name=input.value.trim(); state.screen='question'; render(); };
  $('#name').addEventListener('input',()=>$('#name').setCustomValidity(''));
  $('#name-form').addEventListener('submit',e=>{e.preventDefault();start();}); $('#start').onclick=start;
  $('#learn-more').onclick=()=>$('#info-dialog').showModal();
  $('#footnote').textContent='Un premier échange, sans pression et sans note de compatibilité.';
}
function question() {
  const q=questions[state.index];
  card.innerHTML=`<div class="card-top"><span class="eyebrow">${q.options?'À TOI DE CHOISIR':'AVEC TES MOTS'}</span><span class="symbol" aria-hidden="true">${q.mark}</span></div><h1 id="question-title">${q.title}</h1><p class="hint">${q.hint}</p>${q.options?`<div class="options" role="group" aria-labelledby="question-title">${q.options.map((option,i)=>`<button class="option" data-option="${i}" aria-pressed="${state.answers[state.index]===option}"><span class="option-letter" aria-hidden="true">${state.answers[state.index]===option?'✓':String.fromCharCode(65+i)}</span><span>${escapeHtml(option)}</span></button>`).join('')}</div>`:`<label class="field-label" for="answer">Ta réponse (facultative)</label><textarea id="answer" class="text-field" maxlength="1000" placeholder="${escapeHtml(q.placeholder)}">${escapeHtml(state.answers[state.index]||'')}</textarea><p class="char-count"><span id="char-count">${(state.answers[state.index]||'').length}</span> / 1 000</p>`}`;
  controls.innerHTML=`<button class="text-button" id="back">← Retour</button>${button(state.editing?'Valider la modification':state.index===11?'Relire mes réponses':'La suite <span aria-hidden="true">→</span>','next')}`;
  const skip=document.createElement('button'); skip.className='text-button skip'; skip.textContent='Je passe cette question'; skip.onclick=()=>{state.answers[state.index]=null;advance();};card.append(skip);
  if(q.options) document.querySelectorAll('[data-option]').forEach(el=>el.onclick=()=>{state.answers[state.index]=q.options[Number(el.dataset.option)];document.querySelectorAll('[data-option]').forEach(other=>{const selected=other===el;other.setAttribute('aria-pressed',selected);other.querySelector('.option-letter').textContent=selected?'✓':String.fromCharCode(65+Number(other.dataset.option));});});
  else $('#answer').oninput=()=>{state.answers[state.index]=$('#answer').value;$('#char-count').textContent=$('#answer').value.length;};
  $('#next').onclick=advance;
  $('#back').onclick=()=>{if(state.editing){state.editing=false;state.screen='review';}else if(state.index===0)state.screen='intro';else state.index--;render();};
  $('#footnote').textContent='Tu peux être sincère, hésiter, ou passer. C’est toi qui choisis.';
}
function advance() {
  if(typeof state.answers[state.index]==='string')state.answers[state.index]=state.answers[state.index].trim()||null;
  if(state.editing){state.editing=false;state.screen='review';render();return;}
  state.index++;
  if(state.index>=questions.length)state.screen='review';
  else if([4,8].includes(state.index)&&!state.breaks.has(state.index)){state.breaks.add(state.index);state.screen='break';}
  render();
}
function interlude() {
  card.classList.add('break-card');
  card.innerHTML=`<span class="symbol" aria-hidden="true">${state.index===4?'✳':'♡'}</span><h1 id="question-title">${state.index===4?'La glace est officiellement brisée.':'On laisse une petite place à l’essentiel ?'}</h1><p class="hint">${state.index===4?'Et personne n’a eu besoin de demander « tu fais quoi dans la vie ? ». Place à ton quotidien.':'La foi, le mariage, les projets… Tu partages ce qui te ressemble, à ton rythme.'}</p>`;
  controls.innerHTML=button(state.index===4?'On continue →':'C’est parti →','continue','full');$('#continue').onclick=()=>{state.screen='question';render();};
}
function review() {
  card.innerHTML=`<div class="card-top"><span class="eyebrow">LE DERNIER MOT EST À TOI</span><span class="symbol" aria-hidden="true">✓</span></div><h1 id="question-title">Ça te ressemble, ${escapeHtml(state.name)} ?</h1><p class="hint">Relis tes réponses avant de les partager. Une question passée reste sans réponse.</p><ol class="review-list">${questions.map((q,i)=>`<li><div class="review-row"><h2>${i+1}. ${q.title}</h2>${!state.pending?`<button class="edit-button" data-edit="${i}" aria-label="Modifier la réponse ${i+1}">Modifier</button>`:''}</div><p>${escapeHtml(state.answers[i]||'Question passée')}</p></li>`).join('')}</ol>${live?`<label class="consent"><input type="checkbox" id="consent" ${state.consent?'checked':''} ${state.pending?'disabled':''}><span>J’accepte que mes réponses soient enregistrées en ligne et lues par ${escapeHtml(config.recipientName)} pour faire connaissance en vue du mariage, y compris ce que j’ai choisi de partager sur ma foi. Je peux lui demander de les supprimer.</span></label>`:'<p class="consent">Tu testes un aperçu : aucune réponse ne sera envoyée ni enregistrée. Le stockage sera activé après la connexion à Supabase.</p>'}`;
  controls.innerHTML=button(live?'Partager mes réponses ↗':'Terminer l’aperçu ✓','submit','full');
  document.querySelectorAll('[data-edit]').forEach(el=>el.onclick=()=>{state.index=Number(el.dataset.edit);state.editing=true;state.screen='question';render();});
  if(live)$('#consent').onchange=()=>state.consent=$('#consent').checked;
  $('#submit').onclick=submit;
  $('#footnote').textContent=live?'Tes réponses sont envoyées uniquement après ton accord.':'Cet aperçu ne conserve rien après la fermeture ou l’actualisation de la page.';
}
async function submit() {
  if(state.sending)return;
  if(!live){state.done=true;state.screen='done';render();celebrate();return;}
  if(!state.consent){error('Coche ton accord si tu souhaites partager tes réponses.');$('#consent').focus();return;}
  state.pending??={id:crypto.randomUUID(),name:state.name,consent:true,version:'1',answers:questions.map((q,i)=>({id:q.id,value:state.answers[i]}))};
  state.sending=true;render();$('#submit').disabled=true;$('#submit').textContent='Enregistrement en cours…';
  try { await sendSubmission(state.pending);state.done=true;state.screen='done';render();celebrate(); }
  catch(e){error(`${e.message} Une fois l’envoi commencé, les réponses sont figées pour éviter les doublons.`);$('#submit').disabled=false;$('#submit').textContent='Réessayer l’envoi';}
  finally{state.sending=false;}
}
function done() {
  card.classList.add('break-card');
  card.innerHTML=`<span class="symbol" aria-hidden="true">✳</span><h1 id="question-title">${live?'Un peu moins inconnus.':'Et voilà, on se connaît un peu mieux.'}</h1><p class="hint">${live?`Merci ${escapeHtml(state.name)}. Tes réponses ont bien été enregistrées. À vous de poursuivre la discussion, avec respect et à votre rythme.`:'L’aperçu est terminé. Aucune réponse n’a été enregistrée. Dans la version connectée, elles seront envoyées uniquement avec ton accord.'}</p>${live?`<p class="receipt">Référence de ton envoi<br>${escapeHtml(state.pending.id)}</p>`:''}`;
  $('#footnote').textContent='Un questionnaire ouvre la discussion. Le reste se découvre ensemble.';
  if(!live){controls.innerHTML=button('Rejouer l’aperçu ↺','restart','secondary full');$('#restart').onclick=()=>location.reload();}
}
function celebrate() {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  for(let i=0;i<24;i++){const el=document.createElement('i');el.className='confetti';el.setAttribute('aria-hidden','true');el.style.cssText=`--x:${Math.random()*440-220}px;--y:${Math.random()*380-180}px;--r:${Math.random()*700}deg;background:${['#dfff78','#173c32','#c6d9ff'][i%3]}`;document.body.append(el);setTimeout(()=>el.remove(),1300);}
}
$('#demo-banner').hidden=live;
$('#info-button').onclick=()=>$('#info-dialog').showModal();
$('#close-info').onclick=()=>$('#info-dialog').close();
$('#info-dialog').addEventListener('click',e=>{if(e.target===$('#info-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#privacy-copy').innerHTML=live?`<p>Ce petit jeu sert à faire connaissance à deux, en vue du mariage. Chaque question est facultative, notamment celle sur la foi.</p><p>Au dernier écran, tu peux relire et modifier tes réponses. Avec ton accord, ton prénom ou pseudo et tes réponses seront enregistrés dans une base Supabase et accessibles au propriétaire de ce questionnaire, ${escapeHtml(config.recipientName)}.</p><p>Rien n’est envoyé avant ton accord. Il n’y a ni réponse publique, ni score de compatibilité. Tu peux contacter cette personne pour demander la suppression de ton envoi.</p><p>Si tu fermes ou actualises la page avant l’envoi, ta progression est perdue.</p>`:'<p>Ceci est un aperçu du jeu. Aucune réponse n’est envoyée ou enregistrée : tu peux le parcourir pour découvrir les questions.</p><p>La version connectée permettra de partager tes réponses avec la personne qui t’a envoyé le lien, après relecture et avec ton accord. Tu pourras toujours passer une question.</p>';
window.addEventListener('beforeunload',e=>{if(live&&state.name&&!state.done){e.preventDefault();e.returnValue='';}});
render();
// Lecture seule : aucune réponse personnelle n’est exposée aux outils du navigateur.
const context=document.modelContext;
if(context?.registerTool){try{Promise.resolve(context.registerTool({name:'read_questionnaire_progress',description:'Lire l’étape courante du questionnaire, sans révéler ni envoyer de réponses.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Aucun paramètre attendu.');return {screen:state.screen,questionNumber:state.screen==='question'?state.index+1:null,total:questions.length,storageEnabled:live};}})).catch(()=>{});}catch{}}
