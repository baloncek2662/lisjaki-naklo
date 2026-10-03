import type { ImgHTMLAttributes } from 'react';
import { galleryImageURL, imageWidths, type ImageMode } from '@/lib/gallery-images';

type Props = ImgHTMLAttributes<HTMLImageElement> & {src:string;mode?:ImageMode};
export function GalleryImage({src,mode='thumbnail',sizes,...props}:Props) {
  const widths=imageWidths[mode];
  const transformed=galleryImageURL(src,widths[1],mode);
  return <img {...props} src={transformed}
    srcSet={transformed===src?undefined:widths.map(width=>`${galleryImageURL(src,width,mode)} ${width}w`).join(', ')}
    sizes={sizes??(mode==='thumbnail'?'(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw':'100vw')}
    decoding="async" onError={e=>{
      const image=e.currentTarget;
      if(image.getAttribute('src')!==src){image.removeAttribute('srcset');image.src=src;}
    }} />;
}
