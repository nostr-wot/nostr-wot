'use client';
import {useState} from 'react';
import Script from 'next/script';
export default function RequestForm({spanish}:{spanish:boolean}){
 const [busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('');
 const key=process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
 const t=(es:string,en:string)=>spanish?es:en;
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(busy)return;setBusy(true);setError('');const data=new FormData(e.currentTarget);
 try{let token='';if(key){token=await new Promise<string>((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error()),10000);if(!window.grecaptcha){clearTimeout(timeout);reject(Error());return}window.grecaptcha.ready(()=>{window.grecaptcha.execute(key,{action:'testflight'}).then(v=>{clearTimeout(timeout);resolve(v)},reject)})})}
 const r=await fetch('/api/testflight',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appleId:data.get('appleId'),consent:data.get('consent')==='on',website:data.get('website'),recaptchaToken:token})});if(!r.ok)throw Error();setDone(true);
 }catch{setError(t('No pudimos confirmar el envío. Esperá unos minutos antes de volver a intentar.','We could not confirm your request. Wait a few minutes before trying again.'))}finally{setBusy(false)}}
 if(done)return <div role="status" className="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-8"><h2 className="text-2xl font-semibold">{t('Solicitud enviada','Request sent')}</h2><p className="mt-3">{t('El equipo recibió tu solicitud. La invitación de TestFlight llegará por separado cuando haya una versión disponible.','The team received your request. Your TestFlight invitation will arrive separately when a build is available.')}</p></div>;
 return <>{key&&<Script src={`https://www.google.com/recaptcha/api.js?render=${key}`} strategy="afterInteractive"/>}<form onSubmit={submit} className="space-y-6 rounded-2xl border border-gray-700 bg-gray-900 text-white p-6 sm:p-8">
 <div><label htmlFor="appleId" className="mb-2 block font-medium">{t('Email de tu Apple ID','Apple ID email')}</label><input id="appleId" name="appleId" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} required className="w-full rounded-lg border border-gray-600 bg-gray-950 p-3 text-white" aria-describedby="email-help"/><p id="email-help" className="mt-2 text-sm text-gray-400">{t('Usá el email de tu cuenta de Apple. Nunca te pediremos la contraseña ni códigos de acceso.','Use your Apple Account email. We will never ask for your password or sign-in codes.')}</p></div>
 <div hidden aria-hidden="true"><label>Website<input name="website" defaultValue="" tabIndex={-1} autoComplete="off"/></label></div>
 <label className="flex items-start gap-3 text-sm text-gray-300"><input name="consent" type="checkbox" required className="mt-1 size-5 shrink-0"/><span>{t('Acepto enviar este email a hello@nostrwot.com para gestionar mi invitación a TestFlight. No me suscribe a newsletters.','I agree to send this email to hello@nostrwot.com to manage my TestFlight invitation. This does not subscribe me to newsletters.')}</span></label>
 <button disabled={busy} className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-500 disabled:opacity-50">{busy?t('Enviando…','Sending…'):t('Solicitar invitación','Request invitation')}</button>{error&&<p role="alert" className="text-rose-300">{error}</p>}
 <p className="text-xs text-gray-400">{t('Podés pedir que eliminemos tu solicitud escribiendo a hello@nostrwot.com.','You can ask us to delete your request by emailing hello@nostrwot.com.')}</p>
 </form></>;
}
