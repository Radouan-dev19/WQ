// Vérification locale facultative : voir README. Base éphémère, aucune donnée réelle.
import { PGlite } from '../.sites-runtime/sql-check/node_modules/@electric-sql/pglite/dist/index.js';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { questions } from '../dist/questions.js';
const db=new PGlite();
const schema=await readFile(new URL('../supabase/schema.sql',import.meta.url),'utf8');
await db.exec('create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon, authenticated, service_role;');
await db.exec(schema);
const payload=()=>({id:randomUUID(),name:'Test éphémère',version:'1',consent:true,answers:questions.map(q=>({id:q.id,value:null}))});
const send=data=>db.query('select public.submit_answers($1::jsonb) as receipt',[JSON.stringify(data)]);
await db.exec('set role anon');
const first=payload();first.answers[8].value='Réponse de test';
assert.equal((await send(first)).rows[0].receipt,first.id);
assert.equal((await send(first)).rows[0].receipt,first.id);
await assert.rejects(()=>send({...first,name:'Autre contenu'}),/autre envoi/);
await assert.rejects(()=>send({...payload(),consent:false}),/Accord/);
await assert.rejects(()=>send({...payload(),name:' '}),/Prénom/);
const invalid=payload();invalid.answers[0].value={unexpected:true};await assert.rejects(()=>send(invalid),/Réponse invalide/);
const duplicate=payload();duplicate.answers[1].id=duplicate.answers[0].id;await assert.rejects(()=>send(duplicate),/répétée/);
for(const role of ['anon','authenticated']){
  await db.exec(`reset role; set role ${role}`);
  for(const sql of ['select * from public.responses','delete from public.responses',"update public.responses set name='intrusion'","insert into public.responses(id,name,questionnaire_version,answers) values(gen_random_uuid(),'intrusion','1','[]')"]){
    await assert.rejects(()=>db.exec(sql),/permission denied/);
  }
}
await assert.rejects(()=>send(payload()),/permission denied/);
await db.exec('reset role; set role service_role');
const saved=(await db.query('select * from public.responses')).rows;
assert.equal(saved.length,1);assert.equal(saved[0].answers[8].question,questions[8].title);assert.equal(saved[0].answers[8].value,'Réponse de test');
await db.exec('reset role; set role anon');
for(let i=1;i<30;i++)await send(payload());
await assert.rejects(()=>send(payload()),/Trop d’envois/);
assert.equal((await send(first)).rows[0].receipt,first.id);
await db.close();
console.log('PostgreSQL : insertion, accord, validation, libellés, idempotence, plafond et refus de lecture/modification publics vérifiés.');
