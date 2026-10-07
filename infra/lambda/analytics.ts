import {parseBody,safeAnalytics} from './input.js';
export const handler=async(event:any)=>{
 const headers:Record<string,string>=Object.fromEntries(Object.entries(event.headers||{}).map(([key,value])=>[key.toLowerCase(),String(value)]));
 const allowed=process.env.ALLOWED_ORIGIN||'';
 const response=(statusCode:number)=>({statusCode,headers:{'cache-control':'no-store',...(allowed?{'access-control-allow-origin':allowed,'vary':'Origin'}:{})},body:''});
 if(!allowed||headers.origin!==allowed)return response(403);
 try{const safe=safeAnalytics(parseBody(String(event.body||''),Boolean(event.isBase64Encoded),headers['content-type']||''));console.log(JSON.stringify({type:'qc_analytics',...safe}));return response(204);}catch{return response(400);}
};
