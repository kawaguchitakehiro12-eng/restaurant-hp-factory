'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
/** Re-authorize server preview before its short-lived image capabilities expire. */
export function MediaPreviewRefresh(){const router=useRouter();useEffect(()=>{if(process.env.NEXT_PUBLIC_MEDIA_UPLOAD_ENABLED!=='development')return;const refresh=()=>{if(document.visibilityState==='visible')router.refresh()},timer=setInterval(refresh,120000);document.addEventListener('visibilitychange',refresh);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',refresh)}},[router]);return null;}
