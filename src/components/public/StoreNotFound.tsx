type StoreNotFoundProps = {
  slug: string;
};

export function StoreNotFound({ slug }: StoreNotFoundProps) {
  return (
    <div className="public-store-status">
      <div className="public-store-status-card">
        <p className="public-store-status-brand">SAKUPAGE</p>
        <h1>サイトが見つかりません</h1>
        <p>
          「{slug}」に該当する店舗サイトは見つかりませんでした。
          <br />
          URLをご確認ください。
        </p>
      </div>
    </div>
  );
}
