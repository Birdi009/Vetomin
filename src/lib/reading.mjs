/** An estimate from actual article text, not a marketing label. */
export function readingMinutes(body = '') {
 const text = body.replace(/```[\s\S]*?```/g,' ').replace(/<[^>]*>/g,' ').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[#*_>`~]/g,' ');
 const words=text.trim().split(/\s+/).filter(Boolean).length;
 return Math.max(1,Math.ceil(words/220));
}
