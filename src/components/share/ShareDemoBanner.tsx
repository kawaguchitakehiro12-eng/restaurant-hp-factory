type ShareDemoBannerProps = {
  prospectLabel: string;
};

export function ShareDemoBanner({ prospectLabel }: ShareDemoBannerProps) {
  return (
    <div className="share-demo-banner" role="note">
      <p className="share-demo-banner-line">
        こちらは<strong>{prospectLabel}</strong>様向けに作成したサンプルサイトです
      </p>
      <p className="share-demo-banner-sub">
        写真・文章・メニュー等はご利用開始前に変更できます
      </p>
    </div>
  );
}
