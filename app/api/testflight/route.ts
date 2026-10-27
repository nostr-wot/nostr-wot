import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { validateOrigin, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { emailService } from '@/lib/email';
import { parseTestFlightRequest, testFlightEmail } from '@/lib/testflight';
export const runtime = 'nodejs';
const json = (body: object, status = 200) => NextResponse.json(body, {status, headers:{'Cache-Control':'no-store'}});
export async function POST(request: Request) {
  if (!validateOrigin(request)) return json({error:'Invalid origin'},403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({error:'Expected JSON'},415);
  // A shared workshop Wi-Fi must allow many different attendees.
  if (!checkRateLimit(`testflight:ip:${getClientIdentifier(request)}`,{limit:120,windowMs:3600000}).allowed || !checkRateLimit('testflight:global',{limit:400,windowMs:3600000}).allowed) return json({error:'Please try later'},429);
  let body: Record<string,unknown>;
  try {
    const reader=request.body?.getReader(); if(!reader) return json({error:'Missing body'},400);
    const chunks:Uint8Array[]=[];let size=0;
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4096){await reader.cancel();return json({error:'Request too large'},413)}chunks.push(value)}
    body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { return json({error:'Invalid request'},400); }
  const parsed=parseTestFlightRequest(body);
  if (!parsed) return json({error:'Check your email and consent'},400);
  const secret=process.env.RECAPTCHA_SECRET_KEY;
  if(secret){
    if(typeof body.recaptchaToken!=='string'||body.recaptchaToken.length>2048)return json({error:'Verification required'},400);
    try{
      const response=await fetch('https://www.google.com/recaptcha/api/siteverify',{method:'POST',body:new URLSearchParams({secret,response:body.recaptchaToken}),signal:AbortSignal.timeout(8000)});
      const result=await response.json();
      if(!result.success||result.score<0.5||result.action!=='testflight'||!['nostrwot.com','www.nostrwot.com'].includes(result.hostname))return json({error:'Verification failed'},400);
    }catch{return json({error:'Verification unavailable'},503)}
  }
  const key=createHash('sha256').update(parsed.appleId.toLowerCase()).digest('hex');
  if(!checkRateLimit(`testflight:email:${key}`,{limit:3,windowMs:3600000}).allowed)return json({error:'Please try later'},429);
  const sent=await emailService.send(testFlightEmail(parsed.appleId));
  if(!sent.success)return json({error:'Could not send your request'},503);
  return json({success:true});
}
