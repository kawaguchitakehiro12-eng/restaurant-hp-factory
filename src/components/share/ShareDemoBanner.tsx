"use client";
import {useEffect,useRef} from "react";
type ShareDemoBannerProps = {
  prospectLabel: string;
};

export function ShareDemoBanner({ prospectLabel }: ShareDemoBannerProps) {
  const banner=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const element=banner.current;if(!element)return;
    const update=()=>document.documentElement.style.setProperty('--share-banner-offset',Math.max(0,element.getBoundingClientRect().bottom)+'px');
    const observer=new ResizeObserver(update);observer.observe(element);window.addEventListener('scroll',update,{passive:true});update();
    return()=>{observer.disconnect();window.removeEventListener('scroll',update);document.documentElement.style.removeProperty('--share-banner-offset');};
  },[]);
  return (
    <div ref={banner} className="share-demo-banner" role="note">
      <p className="share-demo-banner-line">
        こちらは<strong>{prospectLabel}</strong>様向けに作成したサンプルサイトです
      </p>
      <p className="share-demo-banner-sub">
        写真・文章・メニュー等はご利用開始前に変更できます
      </p>
    </div>
  );
}
