export type Fields = Record<string, unknown>;
export function parseBody(body: string, encoded: boolean, contentType: string): Fields {
  if (body.length > 100000) throw new Error('payload_too_large');
  const decoded = encoded ? Buffer.from(body, 'base64').toString('utf8') : body;
  let value: unknown;
  if (contentType.includes('application/x-www-form-urlencoded')) value = Object.fromEntries(new URLSearchParams(decoded));
  else {
    if (contentType && !contentType.includes('application/json')) throw new Error('unsupported_content_type');
    value = JSON.parse(decoded || '{}');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid_json');
  if (Buffer.byteLength(JSON.stringify(value), 'utf8') > 16000) throw new Error('payload_too_large');
  return value as Fields;
}
export function validateInquiry(input: Fields): { fields: Record<string,string>; errors: Record<string,string> } {
  const fields: Record<string,string> = {};
  const errors: Record<string,string> = {};
  const limits: Record<string,number> = {name:120,email:180,project:120,timing:120,message:4000};
  for (const [key,limit] of Object.entries(limits)) {
    fields[key] = typeof input[key] === 'string' ? (input[key] as string).trim() : '';
    if (fields[key].length > limit || (key !== 'message' && /[\r\n]/.test(fields[key]))) errors[key] = `Keep ${key} within ${limit} characters and on one line.`;
  }
  if (!fields.name) errors.name = 'Enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.email = 'Enter an email address such as name@example.com.';
  if (fields.message.length < 20 || fields.message.length > 4000) errors.message = 'Describe your project in 20 to 4,000 characters.';
  return {fields,errors};
}
export function safeAnalytics(input: Fields) {
  const events = ['web_vital','theme_change','filter_changed','intent_selected','search_used','contact_succeeded','contact_failed'];
  if (typeof input.name !== 'string' || !events.includes(input.name)) throw new Error('unknown_event');
  const rawPath=typeof input.path==='string'?input.path.split(/[?#]/)[0]:'';
  const allowed=/^\/(?:Vetomin\/)?(?:(?:work|about|contact|journal|colophon)\/|projects\/(?:atlas|fieldnote|threshold)\/|journal\/(?:calm-interfaces|decisions-not-screens|reduced-motion)\/)?$/;
  const path=allowed.test(rawPath)?rawPath:'/other/';
  const source=input.detail&&typeof input.detail==='object'&&!Array.isArray(input.detail)?input.detail as Fields:{};
  const detail: Record<string,string|number> = {};
  if(input.name==='web_vital') {
    if(!['LCP','INP','CLS'].includes(String(source.metric))||!['mobile','desktop'].includes(String(source.device))||typeof source.value!=='number'||!Number.isFinite(source.value)||source.value<0||source.value>120000)throw new Error('invalid_metric');
    detail.metric=String(source.metric);detail.device=String(source.device);detail.value=source.value;
  }
  if(input.name==='theme_change'&&['light','dark'].includes(String(source.theme)))detail.theme=String(source.theme);
  if(input.name==='intent_selected'&&['strategy','identity','web','product'].includes(String(source.intent)))detail.intent=String(source.intent);
  for(const key of ['count','result_count'])if(typeof source[key]==='number'&&Number.isInteger(source[key])&&(source[key] as number)>=0&&(source[key] as number)<=100)detail[key]=source[key] as number;
  return {name:input.name,path,detail,ts:Date.now()};
}
