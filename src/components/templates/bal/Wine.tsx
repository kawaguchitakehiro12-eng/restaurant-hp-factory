import { SampleLabel } from "@/components/demo/SampleLabel";
import { FadeIn } from "@/components/ui/FadeIn";
import { BalFillImage } from "@/components/templates/bal/ui/BalFillImage";
import { BalSectionHead } from "@/components/templates/bal/ui/BalSectionHead";
import type { BalMenuItem } from "@/types/bal";

type WineProps = {
  wines: BalMenuItem[];
};

function wineCategory(item: BalMenuItem): { label: string; serve: string } {
  const text = [item.badge, item.name, item.nameEn].filter(Boolean).join(" ");
  if (/ボトル|bottle|botella/i.test(text)) return { label: "BOTTLE", serve: "BOTTLE" };
  if (/カヴァ|cava|スパークリング|sparkling|泡|プロセッコ|prosecco|シャンパ|champagne|スプマンテ/i.test(text)) {
    return { label: "SPARKLING", serve: "GLASS" };
  }
  if (/サングリア|sangria/i.test(text)) return { label: "SANGRIA", serve: "GLASS" };
  if (/ロゼ|rosé|rose/i.test(text)) return { label: "ROSADO", serve: "GLASS" };
  return { label: item.badge || "HOUSE", serve: "GLASS" };
}

export function Wine({ wines }: WineProps) {
  if (wines.length === 0) return null;

  const feature = [...wines].reverse().find((item) => item.image);

  return (
    <section id="wine" className="bal-section bal-wine">
      <div className="bal-shell bal-wine-layout">
        <FadeIn className="bal-wine-aside">
          <BalSectionHead
            en="WINE"
            ja="ワインは、気取らずグラスで。"
            lead="スペインとイタリアを中心に。迷ったら「今日の気分」を伝えてください。"
            tone="cream"
          />
          {feature ? (
            <div className="bal-wine-photo" style={{ position: "relative", aspectRatio: "4 / 5" }}>
              <BalFillImage
                src={feature.image}
                alt={feature.name}
                className="bal-photo object-cover"
                sizes="(min-width: 1024px) 26rem, 80vw"
              />
              {feature.isSample ? <SampleLabel className="demo-sample-label--image" /> : null}
            </div>
          ) : null}
        </FadeIn>

        <FadeIn delay={0.08} className="bal-wine-card">
          <div className="bal-wine-card-head">
            <p className="bal-wine-card-title">CARTA DE VINOS</p>
            <p className="bal-wine-card-ja">ワインリスト</p>
          </div>
          <ol className="bal-wine-list">
            {wines.map((item, index) => {
              const category = wineCategory(item);
              return (
                <li key={`${item.name}-${index}`} className="bal-wine-row">
                  <span className="bal-wine-no">{String(index + 1).padStart(2, "0")}</span>
                  <div className="bal-wine-text">
                    <p className="bal-wine-meta">
                      <span className="bal-wine-cat">{category.label}</span>
                      {item.nameEn ? <span className="bal-wine-en">{item.nameEn}</span> : null}
                    </p>
                    <p className="bal-wine-name">
                      {item.name}
                      {item.isSample ? <SampleLabel /> : null}
                    </p>
                    {item.description ? <p className="bal-wine-desc">{item.description}</p> : null}
                  </div>
                  <p className="bal-wine-price">
                    <span>{category.serve}</span>
                    {item.price}
                  </p>
                </li>
              );
            })}
          </ol>
        </FadeIn>
      </div>
    </section>
  );
}
