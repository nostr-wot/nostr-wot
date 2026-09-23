/** Restricted editorial Markdown. Never parse or execute source HTML. */
export function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function safeLink(label,url){try{const u=new URL(url);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return escapeHtml(label);}catch{return escapeHtml(label);}return `<a href="${escapeHtml(url)}" rel="noreferrer">${escapeHtml(label)}</a>`;}
function inline(s){
 const pattern=/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*\n]+)\*\*|`([^`\n]+)`|https?:\/\/[^\s<>"']+/g;
 let result='',last=0;
 for(const m of s.matchAll(pattern)){
  result+=escapeHtml(s.slice(last,m.index));
  if(m[1])result+=safeLink(m[1],m[2]);
  else if(m[3])result+='<strong>'+escapeHtml(m[3])+'</strong>';
  else if(m[4])result+='<code>'+escapeHtml(m[4])+'</code>';
  else{let url=m[0].replace(/[.,;:!?]+$/,'');while(url.endsWith(')')&&(url.match(/\)/g)?.length||0)>(url.match(/\(/g)?.length||0))url=url.slice(0,-1);result+=safeLink(url,url)+escapeHtml(m[0].slice(url.length));}
  last=m.index+m[0].length;
 }
 return result+escapeHtml(s.slice(last));
}
export function editorialHtml(body) {
 return body.replace(/\r\n?/g,'\n').trim().split(/\n\s*\n/).map(p=>p.startsWith('## ')?`<h2>${inline(p.slice(3))}</h2>`:`<p style="white-space:pre-wrap">${inline(p).replace(/\n/g,'<br>')}</p>`).join('\n');
}
