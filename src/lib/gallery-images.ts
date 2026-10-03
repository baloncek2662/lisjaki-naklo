export type ImageMode = 'thumbnail' | 'lightbox';
export const imageWidths = {thumbnail:[320,640,960],lightbox:[960,1600,2560]};
export function galleryImageURL(src:string,width:number,mode:ImageMode,enabled = import.meta.env.PROD):string {
  if(!enabled || !src.startsWith('/images/') || !/\.(jpe?g|png|webp|avif)$/i.test(src))return src;
  const fit=mode==='thumbnail'?'cover':'scale-down';
  return `/cdn-cgi/image/fit=${fit},width=${width},${mode==='thumbnail'?`height=${width},`:''}quality=${mode==='thumbnail'?80:85},format=auto,metadata=none,onerror=redirect${src.split('/').map(encodeURIComponent).join('/')}`;
}
