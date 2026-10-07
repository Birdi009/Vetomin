export const handler=async(event:any)=>{
  let payload:any={};try{payload=JSON.parse(event.body||'{}')}catch{}
  const safe={
    name:String(payload.name||'unknown').slice(0,80),
    path:String(payload.path||'').slice(0,240),
    detail:sanitize(payload.detail),
    ts:Number(payload.ts||Date.now())
  };
  console.log(JSON.stringify({type:'qc_analytics',...safe}));
  return {statusCode:204,headers:{'access-control-allow-origin':process.env.ALLOWED_ORIGIN||'*'},body:''};
};
function sanitize(v:any){
  if(!v||typeof v!=='object')return {};
  const out:Record<string,string|number|boolean>={};
  for(const [k,val] of Object.entries(v).slice(0,12)){
    if(['string','number','boolean'].includes(typeof val)) out[String(k).slice(0,60)]=typeof val==='string'?String(val).slice(0,120):val as number|boolean;
  }
  return out;
}
