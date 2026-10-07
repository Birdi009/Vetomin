export type CmsEntry={title:string;description:string;href?:string;category?:string;minutes?:number};
export async function loadRemoteCms():Promise<CmsEntry[]>{
  const url=import.meta.env.CMS_FEED_URL;
  if(!url)return [];
  try{
    const r=await fetch(url,{headers:{accept:'application/json'}});
    if(!r.ok)return [];
    const data=await r.json();
    if(!Array.isArray(data))return [];
    return data.slice(0,24).map((x:any)=>({
      title:String(x.title||'Untitled').slice(0,140),
      description:String(x.description||'').slice(0,360),
      href:x.href?String(x.href):undefined,
      category:String(x.category||'CMS').slice(0,40),
      minutes:Number(x.minutes||0)||undefined
    }));
  }catch{return []}
}
