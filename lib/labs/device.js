export function detectDevice({userAgent='',platform='',maxTouchPoints=0}={}){if(/iPhone|iPad|iPod/i.test(userAgent)||/Mac/i.test(platform)&&maxTouchPoints>1)return 'ios';if(/Android/i.test(userAgent))return 'android';return 'desktop'}
export function hasBrowserSigner(scope){return typeof scope?.nostr?.getPublicKey==='function'&&typeof scope?.nostr?.signEvent==='function'}
