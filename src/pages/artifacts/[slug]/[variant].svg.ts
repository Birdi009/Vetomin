import type { APIRoute, GetStaticPaths } from 'astro';
import { artwork } from '../../../lib/artwork';
import { studyKeys, getStudy, type StudyKey } from '../../../lib/studies';
export const getStaticPaths: GetStaticPaths = () => studyKeys.flatMap(slug => getStudy(slug).artifacts.map(item=>({params:{slug,variant:item.key},props:{slug,variant:item.key}})));
export const GET: APIRoute = ({props}) => new Response(artwork(props.slug as StudyKey,props.variant),{headers:{'Content-Type':'image/svg+xml; charset=utf-8'}});
