import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
const pages=[
  {slug:'home',title:'Quiet Compass',sub:'Calm wayfinding for purposeful digital work'},
  {slug:'work',title:'Work — Quiet Compass',sub:'Evidence before adjectives'},
  {slug:'about',title:'About — Quiet Compass',sub:'Experimentation behaves like punctuation'},
  {slug:'journal',title:'Journal — Quiet Compass',sub:'Notes from the route'},
  {slug:'contact',title:'Contact — Quiet Compass',sub:'Start with the destination'},
  {slug:'projects-atlas',title:'Atlas — Quiet Compass',sub:'A calmer operating system'},
  {slug:'projects-fieldnote',title:'Fieldnote — Quiet Compass',sub:'Making expertise legible'},
  {slug:'projects-threshold',title:'Threshold — Quiet Compass',sub:'Fewer steps, better decisions'}
];
export const getStaticPaths:GetStaticPaths=async()=>pages.map(p=>({params:{slug:p.slug},props:p}));
export const GET:APIRoute=async({props})=>{
  const {title,sub}=props as {title:string,sub:string};
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f3efe7"/><circle cx="1010" cy="520" r="300" fill="#78908a" opacity=".14"/><path d="M90 480 C300 300 470 540 690 320 S960 140 1110 210" fill="none" stroke="#78908a" stroke-width="5"/><text x="90" y="135" font-family="Arial" font-size="26" letter-spacing="4" fill="#6f6a60">QUIET COMPASS</text><text x="90" y="285" font-family="Georgia" font-size="72" fill="#171714">${title}</text><text x="90" y="355" font-family="Arial" font-size="30" fill="#6f6a60">${sub}</text></svg>`;
  const body=await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(body),{headers:{'Content-Type':'image/png','Cache-Control':'public,max-age=31536000,immutable'}});
};