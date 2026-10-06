import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';

const slugs=['atlas','fieldnote','threshold'];
const widths=[640,1280];
const formats=['webp','avif'] as const;
export const getStaticPaths: GetStaticPaths = async()=>slugs.flatMap(slug=>widths.flatMap(width=>formats.map(format=>({params:{file:`${slug}-${width}.${format}`},props:{slug,width,format}}))));

function svg(slug:string,width:number){
  const height=Math.round(width*.75);
  const hue={atlas:'#6f8e96',fieldnote:'#7f956e',threshold:'#8b9197'}[slug]||'#8d806f';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="#f2ede4"/>
    <circle cx="260" cy="240" r="170" fill="${hue}" opacity=".26"/>
    <circle cx="980" cy="740" r="300" fill="${hue}" opacity=".12"/>
    <path d="M70 690 C280 430 420 760 650 430 S1000 250 1140 120" fill="none" stroke="${hue}" stroke-width="5" opacity=".7"/>
    <path d="M120 170 H1080 M120 450 H1080 M120 730 H1080" stroke="#1d1d1a" opacity=".08"/>
    <text x="90" y="115" font-size="40" font-family="Georgia,serif" fill="#1d1d1a">${slug.toUpperCase()} / QUIET COMPASS</text>
  </svg>`;
}
export const GET: APIRoute = async({props})=>{
  const {slug,width,format}=props as {slug:string,width:number,format:'webp'|'avif'};
  let pipe=sharp(Buffer.from(svg(slug,width))).resize(width);
  const body= format==='avif' ? await pipe.avif({quality:58}).toBuffer() : await pipe.webp({quality:72}).toBuffer();
  return new Response(body,{headers:{'Content-Type':format==='avif'?'image/avif':'image/webp','Cache-Control':'public,max-age=31536000,immutable'}});
};