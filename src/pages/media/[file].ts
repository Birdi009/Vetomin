import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import { caseKeys } from '../../data/cases';
import { conceptArt } from '../../lib/concept-art';
export const getStaticPaths: GetStaticPaths = async () => caseKeys.flatMap(slug => ['after','before'].flatMap(state => [640,1280].flatMap(width => ['webp','avif'].map(format => ({params:{file:`${slug}${state==='before'?'-before':''}-${width}.${format}`},props:{slug,state,width,format}})))));
export const GET: APIRoute = async ({props}) => {
  const {slug,state,width,format} = props as {slug:string;state:'before'|'after';width:number;format:'webp'|'avif'};
  const image = sharp(Buffer.from(conceptArt(slug,state))).resize(width);
  const bytes = format === 'avif' ? await image.avif({quality:65}).toBuffer() : await image.webp({quality:80}).toBuffer();
  return new Response(new Uint8Array(bytes), {headers:{'Content-Type':`image/${format}`,'Cache-Control':'public, max-age=3600'}});
};
