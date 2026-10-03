import { useEffect } from 'react';
import { galleryImageURL } from '@/lib/gallery-images';
export function useGalleryPrefetch(images:{src:string;type?:string}[],index:number|null) {
  useEffect(()=>{
    if(index===null || images.length<2)return;
    for(const next of new Set([(index+1)%images.length,(index-1+images.length)%images.length])) {
      const item=images[next];
      if(item.type==='video')continue;
      const image=new Image();image.src=galleryImageURL(item.src,1600,'lightbox');
    }
  },[images,index]);
}
