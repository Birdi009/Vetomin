import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import { artwork } from '../../lib/artwork';
import { studyKeys, getStudy, type StudyKey } from '../../lib/studies';
export const getStaticPaths: GetStaticPaths = () => studyKeys.flatMap(slug => [...new Set(['after',...getStudy(slug).artifacts.map(item=>item.key)])].flatMap(variant => [640,1280].flatMap(width => (['webp','avif'] as const).map(format => ({ params:{ file:`${slug}-${variant}-${width}.${format}` },props:{slug,variant,width,format} })))));
export const GET: APIRoute = async ({props}) => {
  const {slug,variant,width,format} = props as {slug:StudyKey;variant:string;width:number;format:'avif'|'webp'};
  const pipeline = sharp(Buffer.from(artwork(slug,variant))).resize(width);
  const bytes = format==='avif' ? await pipeline.avif({quality:64,effort:3}).toBuffer() : await pipeline.webp({quality:84}).toBuffer();
  return new Response(new Uint8Array(bytes),{headers:{'Content-Type':`image/${format}`}});
};
