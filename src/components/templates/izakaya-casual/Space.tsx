import { FadeIn } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaSectionHeading } from "@/components/templates/izakaya-casual/ui/IzakayaSectionHeading";
import {
  guessIzkPhotoFocus,
  izkPhotoFocusClass,
} from "@/components/templates/izakaya-casual/utils/izkPhotoFocus";
import type {
  IzakayaCasualGalleryImage,
  IzakayaCasualSpace,
} from "@/types/izakaya-casual";

type SpaceProps = {
  space: IzakayaCasualSpace;
  galleryImages?: IzakayaCasualGalleryImage[];
};

type Scene = {
  key: string;
  title: string;
  line: string;
  image?: string;
  alt?: string;
  isSample?: boolean;
};

function extractSeats(features: string[]) {
  const joined = features.join(" ");
  const counter = joined.match(/カウンター\s*(\d+)/);
  const table = joined.match(/テーブル\s*(\d+)/);
  return {
    counter: counter?.[1] ?? null,
    table: table?.[1] ?? null,
    total:
      counter && table
        ? String(Number(counter[1]) + Number(table[1]))
        : null,
  };
}

function buildScenes(
  space: IzakayaCasualSpace,
  galleryImages: IzakayaCasualGalleryImage[],
): Scene[] {
  const g = galleryImages;
  return [
    {
      key: "solo",
      title: "ひとり飲み",
      line: "カウンターで、串と生を。ふらっと寄れる席。",
      image: space.image || g[0]?.src,
      alt: space.title || g[0]?.alt || "カウンター",
      isSample: space.isSample || g[0]?.isSample,
    },
    {
      key: "friends",
      title: "友人と",
      line: "テーブルでシェア。仕事帰りの一杯にぴったり。",
      image: g[1]?.src || space.image,
      alt: g[1]?.alt || "テーブル席",
      isSample: g[1]?.isSample || space.isSample,
    },
    {
      key: "party",
      title: "宴会",
      line: "少人数から幹事案件まで。にぎやかにどうぞ。",
      image: g[3]?.src || g[2]?.src || space.image,
      alt: g[3]?.alt || g[2]?.alt || "宴会席",
      isSample: g[3]?.isSample || g[2]?.isSample || space.isSample,
    },
  ];
}

export function Space({ space, galleryImages = [] }: SpaceProps) {
  if (!space.image && !space.title) return null;

  const seats = extractSeats(space.features);
  const scenes = buildScenes(space, galleryImages);

  return (
    <IzakayaSection id="space" tone="ink" className="izk-space-section">
      <IzakayaSectionHeading
        light
        kicker="SPACE"
        title="どんな使い方でも。"
        subtitle={space.description || "気軽に、にぎやかに。"}
      />

      <div className="izk-space-seats">
        {seats.counter ? (
          <div className="izk-space-seat">
            <p className="izk-space-seat-label">カウンター</p>
            <p className="izk-space-seat-value">{seats.counter}</p>
          </div>
        ) : null}
        {seats.table ? (
          <div className="izk-space-seat">
            <p className="izk-space-seat-label">テーブル</p>
            <p className="izk-space-seat-value">{seats.table}</p>
          </div>
        ) : null}
        {seats.total ? (
          <div className="izk-space-seat">
            <p className="izk-space-seat-label">総席</p>
            <p className="izk-space-seat-value">{seats.total}</p>
          </div>
        ) : null}
      </div>

      <div className="izk-space-scenes">
        {scenes.map((scene, i) => (
          <FadeIn key={scene.key} delay={i * 0.05} className="izk-space-scene">
            <div className="izk-space-scene-photo">
              {scene.image ? (
                <>
                  <FlexibleImageFill
                    src={scene.image}
                    alt={scene.alt || scene.title}
                    className={`izk-image-fill object-cover ${izkPhotoFocusClass(
                      guessIzkPhotoFocus(`${scene.alt ?? ""} ${scene.title}`),
                    )}`}
                    sizes="(max-width: 900px) 100vw, 33vw"
                  />
                  <div className="izk-photo-grade" aria-hidden />
                  {scene.isSample ? (
                    <SampleLabel className="demo-sample-label--image" />
                  ) : null}
                </>
              ) : (
                <div className="izk-space-scene-empty" aria-hidden />
              )}
              <div className="izk-space-scene-label">
                <h3 className="izk-space-scene-title">{scene.title}</h3>
                <p className="izk-space-scene-line">{scene.line}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {space.title ? (
        <p className="izk-space-caption">{space.title}</p>
      ) : null}
    </IzakayaSection>
  );
}
