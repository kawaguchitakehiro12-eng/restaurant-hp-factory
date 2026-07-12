export function ShareExpiredPage() {
  return (
    <div className="share-status-page">
      <div className="share-status-card">
        <h1>公開期間終了</h1>
        <p>このサンプルサイトの公開期間は終了しました</p>
      </div>
    </div>
  );
}

export function ShareNotFoundPage() {
  return (
    <div className="share-status-page">
      <div className="share-status-card">
        <h1>ページが見つかりません</h1>
        <p>共有リンクが無効か、URLが間違っています</p>
      </div>
    </div>
  );
}

export function ShareLoadErrorPage({ message }: { message: string }) {
  return (
    <div className="share-status-page">
      <div className="share-status-card">
        <h1>読み込みに失敗しました</h1>
        <p>{message}</p>
        <p className="share-status-hint">
          通信環境を確認のうえ、ページを再読み込みしてください。
        </p>
      </div>
    </div>
  );
}
