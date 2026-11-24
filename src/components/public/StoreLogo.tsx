'use client';import {safeLogo} from '@/lib/images/logo';import {ResilientImage} from '@/components/ui/ResilientImage';
export function StoreLogo({src,name}:{src?:string;name:string}){let valid='';try{valid=safeLogo(src)}catch{}return valid?<ResilientImage src={valid} alt={name} style={{display:'block',width:'auto',height:44,maxWidth:'min(180px,42vw)',objectFit:'contain'}}/>:<>{name}</>;}
