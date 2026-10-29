/** Apply a confirmed publication once, without waiting for slower relays. */
export async function publishWithConfirmation<T extends {status:string}>(
 relays:string[],send:(relay:string)=>Promise<T>,onAccepted:()=>void,onReport:(report:T)=>void,
):Promise<T[]>{
 let confirmed=false;
 return Promise.all(relays.map(async relay=>{
  const report=await send(relay);
  if(report.status==='accepted'&&!confirmed){confirmed=true;onAccepted()}
  onReport(report);
  return report;
 }));
}
