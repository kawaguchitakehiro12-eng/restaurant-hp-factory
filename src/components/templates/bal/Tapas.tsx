"use client";

import { useRef } from "react";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { FadeIn } from "@/components/ui/FadeIn";
import { BalFillImage } from "@/components/templates/bal/ui/BalFillImage";
import { BalSectionHead } from "@/components/templates/bal/ui/BalSectionHead";
import type { BalMenuItem } from "@/types/bal";

type TapasProps = {
  tapas: BalMenuItem[];
};

export function Tapas({ tapas }: TapasProps) {
  const trackRef = useRef<HTMLUListElement>(null);

  if (tapas.length === 0) return null;

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".bal-tapa");
    const step = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <section id="tapas" className="bal-section bal-tapas">
      <div className="bal-shell">
        <FadeIn>
          <BalSectionHead
            en="TAPAS"
            ja="小皿をシェアして、少しずつ。"
            lead="まずは2〜3皿から。足りなければ、また頼めばいい。"
          />
        </FadeIn>

        <div className="bal-tapas-controls">
          <p className="bal-tapas-count">
            <strong>{String(tapas.length).padStart(2, "0")}</strong> PLATES
          </p>
          <p className="bal-tapas-hint" aria-hidden>
            SWIPE →
          </p>
          <div className="bal-tapas-arrows">
            <button type="button" onClick={() => scrollBy(-1)} aria-label="前のタパスへ">
              ←
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="次のタパスへ">
              →
            </button>
          </div>
        </div>
      </div>

      <ul ref={trackRef} className="bal-tapas-track" aria-label="タパス一覧">
        {tapas.map((item, index) => (
          <li key={`${item.name}-${index}`} className="bal-tapa">
            <div className="bal-tapa-plate" style={{ position: "relative", aspectRatio: "1 / 1" }}>
              <div className="bal-tapa-photo" style={{ position: "absolute", inset: 0 }}>
                {item.image ? (
                  <BalFillImage
                    src={item.image}
                    alt={item.name}
                    className="bal-photo object-cover"
                    sizes="(min-width: 1024px) 16rem, 60vw"
                  />
                ) : (
                  <span className="bal-tile bal-tile--olive" style={{ position: "absolute", inset: 0 }} />
                )}
              </div>
              <span className="bal-tapa-no">{String(index + 1).padStart(2, "0")}</span>
              {item.badge ? <span className="bal-tapa-badge">{item.badge}</span> : null}
              {item.isSample ? <SampleLabel className="demo-sample-label--image" /> : null}
            </div>
            <div className="bal-tapa-body">
              {item.nameEn ? <p className="bal-tapa-en">{item.nameEn}</p> : null}
              <h3 className="bal-tapa-name">{item.name}</h3>
              {item.description ? <p className="bal-tapa-desc">{item.description}</p> : null}
              <p className="bal-tapa-price">{item.price}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
