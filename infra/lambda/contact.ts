import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const ses=new SESv2Client({});
const max=(v:unknown,n:number)=>String(v??'').trim().slice(0,n);
const emailOk=(v:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const response=(statusCode:number,body:unknown)=>({statusCode,headers:{'content-type':'application/json','access-control-allow-origin':process.env.ALLOWED_ORIGIN||'*'},body:JSON.stringify(body)});

export const handler=async(event:any)=>{
  const origin=event.headers?.origin||event.headers?.Origin||'';
  const allowed=process.env.ALLOWED_ORIGIN||'';
  if(allowed && origin && origin!==allowed) return response(403,{ok:false,error:'origin'});
  let payload:any={}; try{payload=JSON.parse(event.body||'{}')}catch{return response(400,{ok:false,error:'json'})}
  if(payload.website) return response(200,{ok:true});
  const name=max(payload.name,120),email=max(payload.email,180),project=max(payload.project,120),timing=max(payload.timing,120),message=max(payload.message,4000);
  const startedAt=Number(payload.startedAt||0);
  if(startedAt && Date.now()-startedAt<1200) return response(429,{ok:false,error:'too_fast'});
  if(!name||!emailOk(email)||message.length<20) return response(400,{ok:false,error:'validation'});
  const links=(message.match(/https?:\/\//g)||[]).length;
  if(links>4) return response(400,{ok:false,error:'spam'});
  const from=process.env.SES_FROM_EMAIL!,to=process.env.CONTACT_TO_EMAIL!;
  if(!from||!to) return response(503,{ok:false,error:'mail_not_configured'});
  await ses.send(new SendEmailCommand({
    FromEmailAddress:from,
    Destination:{ToAddresses:[to]},
    ReplyToAddresses:[email],
    Content:{Simple:{
      Subject:{Data:`Quiet Compass inquiry — ${project||'new route'}`},
      Body:{
        Text:{Data:`Name: ${name}\nEmail: ${email}\nProject: ${project}\nTiming: ${timing}\n\n${message}`},
        Html:{Data:`<h2>Quiet Compass inquiry</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Project:</strong> ${escapeHtml(project)}</p><p><strong>Timing:</strong> ${escapeHtml(timing)}</p><p>${escapeHtml(message).replace(/\n/g,'<br>')}</p>`}
      }
    }}
  }));
  return response(200,{ok:true});
};
function escapeHtml(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
