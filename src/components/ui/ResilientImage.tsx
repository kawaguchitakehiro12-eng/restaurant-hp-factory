"use client";
import {useState,type ImgHTMLAttributes} from "react";
import {useMediaUpload} from '@/components/customer/MediaUploadContext';
type Props=Omit<ImgHTMLAttributes<HTMLImageElement>,"src">&{src:string};
/** Display-only fallback: never edits the stored image URL. */
export function ResilientImage({src:source,alt="",onError,...props}:Props){
 const media=useMediaUpload(),src=media?.preview(source)??source;
 const[failed,setFailed]=useState<string|null>(null),fallback="/branding/photo-unavailable.svg";
 const resolved=!src||failed===src?fallback:src;
 // eslint-disable-next-line @next/next/no-img-element
 return <img {...props} src={resolved} alt={alt} data-image-fallback={failed===src?"true":undefined} onError={event=>{setFailed(src);onError?.(event)}}/>;
}
