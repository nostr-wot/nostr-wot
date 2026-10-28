export function qrLink(anchor){anchor.classList.add("direct-link");}
export async function setupQRs(){document.querySelectorAll("#instalar a[href],#recursos a[href]").forEach(qrLink);}
