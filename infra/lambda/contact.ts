import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { parseBody, validateInquiry, type Fields } from './input.js';
const ses = new SESv2Client({});
const escapeHtml = (value:string) => value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const handler = async (event:any) => {
  const headers:Record<string,string> = Object.fromEntries(Object.entries(event.headers || {}).map(([key,value])=>[key.toLowerCase(),String(value)]));
  const origin=headers.origin||'';
  const allowed=process.env.ALLOWED_ORIGIN||'';
  const formEncoded=(headers['content-type']||'').includes('application/x-www-form-urlencoded');
  const returnURL=process.env.CONTACT_RETURN_URL||'';
  const reply=(statusCode:number,body:{ok:boolean;message:string;errors?:Record<string,string>}) => {
    const common={'cache-control':'no-store','x-content-type-options':'nosniff',...(allowed?{'access-control-allow-origin':allowed,'vary':'Origin'}:{})};
    if(!formEncoded)return {statusCode,headers:{...common,'content-type':'application/json'},body:JSON.stringify(body)};
    let back='';try{const url=new URL(returnURL);if(url.protocol==='https:'&&url.origin===allowed)back=`<p><a href="${escapeHtml(url.href)}">Return to Quiet Compass</a></p>`;}catch{}
    const errors=Object.entries(body.errors||{}).map(([key,message])=>`<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(message)}</li>`).join('');
    return {statusCode,headers:{...common,'content-type':'text/html; charset=utf-8','content-security-policy':"default-src 'none'; base-uri 'none'; frame-ancestors 'none'"},body:`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${body.ok?'Message accepted':'Message not sent'} — Quiet Compass</title><body><main><h1>${body.ok?'Your project note was accepted':'Your project note was not sent'}</h1><p>${escapeHtml(body.message)}</p>${errors?'<ul>'+errors+'</ul>':''}${body.ok?'':'<p>Use your browser’s Back button to return and correct your note. Save a copy before leaving the form.</p>'}${back}</main></body></html>`};
  };
  if(!allowed||!origin||origin!==allowed)return reply(403,{ok:false,message:'This origin is not allowed to submit.'});
  const method=event.requestContext?.http?.method||event.httpMethod||'POST';
  if(method!=='POST')return reply(405,{ok:false,message:'Use POST to submit a project note.'});
  let input:Fields;
  try { input=parseBody(String(event.body||''),Boolean(event.isBase64Encoded),headers['content-type']||''); }
  catch {return reply(400,{ok:false,message:'The request could not be read. Keep the note within 4,000 characters.'});}
  if(input.website)return reply(400,{ok:false,message:'The note could not be accepted.'});
  const {fields,errors}=validateInquiry(input);
  if(Object.keys(errors).length)return reply(400,{ok:false,message:'Please correct the fields below.',errors});
  const startedAt=Number(input.startedAt||0);
  if(startedAt&&(!Number.isFinite(startedAt)||Date.now()-startedAt<1200))return reply(429,{ok:false,message:'Please wait a moment and review your note before sending.'});
  if((fields.message.match(/https?:\/\//g)||[]).length>4)return reply(400,{ok:false,message:'Please include no more than four links.'});
  const from=process.env.SES_FROM_EMAIL||'',to=process.env.CONTACT_TO_EMAIL||'';
  if(!from||!to)return reply(503,{ok:false,message:'Email delivery is not configured. Please keep a copy of your note.'});
  try {
    const result=await ses.send(new SendEmailCommand({FromEmailAddress:from,Destination:{ToAddresses:[to]},ReplyToAddresses:[fields.email],Content:{Simple:{Subject:{Data:`Quiet Compass inquiry — ${fields.project||'new project'}`},Body:{Text:{Data:`Name: ${fields.name}\nEmail: ${fields.email}\nProject: ${fields.project}\nTiming: ${fields.timing}\n\n${fields.message}`},Html:{Data:`<h2>Quiet Compass inquiry</h2>${['name','email','project','timing','message'].map(key=>`<p><strong>${key}:</strong> ${escapeHtml(fields[key]).replace(/\n/g,'<br>')}</p>`).join('')}`}}}}}));
    if(!result.MessageId)throw new Error('Not accepted');
    console.log(JSON.stringify({type:'qc_contact',result:'accepted'}));
    return reply(200,{ok:true,message:'The email service accepted your project note for delivery. This confirmation is not an inbox delivery receipt.'});
  } catch {
    console.warn(JSON.stringify({type:'qc_contact',result:'failed'}));
    return reply(502,{ok:false,message:'We could not confirm email acceptance. Keep a copy and try again later.'});
  }
};
