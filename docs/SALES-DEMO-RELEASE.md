# 営業デモ限定の本番反映候補

固定候補 `f83d05ede0e14a52a8aa61d4ac0e64043451ddbf` の442ファイルを基点とした独立コピー。
元の開発ブランチを直接mergeする候補ではない。開発コミット `5b8791f` から営業デモの修正を選別した。

## 取り込んだ内容

- 5テンプレート切替、未保存編集の保護、住所引き継ぎ、共有URLコピー失敗時の案内。
- 共有期限の1週間上限、更新時刻・閲覧数表示、営業連絡先と公開情報の分離。
- ロゴの形式・容量チェック、5テンプレートのロゴ表示。新R2なしの既存画像方式。
- 新旧Supabaseキーの役割判定、Secretのサーバー専用境界。
- Auth 429/5xx/通信失敗の503経路、SDK更新Set-Cookieの引き継ぎ。
- Sharp/libvipsのLinux runtime依存・trace設定。バージョン更新やネットワークからの依存取得なし。

Previewの接続先固定・所属指紋・Previewビルド設定は取り込まない。
新しい申込/課金/営業運営DB/R2のモジュール・SQL提案は取り込まない。基点にある手動契約等の既存コードは残すが、有料契約受付の完成を意味しない。
営業先への送付は共有URLの手動コピーを使用し、送信フォームと申込モックは候補の共有画面から除外した。

## 必須設定（値の取得・変更は今回行っていない）

|項目|条件|
|---|---|
|NEXT_PUBLIC_APP_URL|現行正式origin `https://restaurant-hp-factory.vercel.app`。変更はallowlist更新と別レビューが必要|
|NEXT_PUBLIC_SUPABASE_URL|本番Project `noxabdulnciuezartiuj` のoriginのみ|
|NEXT_PUBLIC_SUPABASE_ANON_KEY|本番の公開用キー。opaqueキーは接頭辞だけで所属確認としない|
|SUPABASE_SERVICE_ROLE_KEY|本番のサーバー用キー。Nextのビルド子プロセスには渡さない|
|OPERATOR_ATOMIC_WRITES_ENABLED|SQL007事後監査成功後にのみtrue|
|DEMO_DELIVERY_MODE|disabled|
|MANUAL_BILLING_ENABLED / SALES_OPERATIONS_ENABLED|false|
|MEDIA_STORAGE_MODE / SAKUPAGE_COMMERCE_MODE|disabled|
|NEXT_PUBLIC_SAKUPAGE_PREVIEW_ONLY|設定しない|

`scripts/release/build.cjs` が対象・役割・無効フラグ・`.env*`持込みを検査し、公開設定だけでNextをビルドする。
生成物のSecret非混入検査は既存の検証済みスキャナーを再利用する。build guardの合格はバックアップ・DB監査・本番変更承認の代替ではない。
実行時環境にも同じ無効フラグを設定する。ビルド子プロセスへ渡した設定だけで、実行時環境が自動更新されたと扱わない。

## 検証と反映

候補の型/lint/既存回帰を実行し、結果は親フォルダに記録する。
ローカル実ビルドは架空設定・既存の通信/プロセスガードを維持して実行する。完全ビルドに至らない場合は未合格のまま扱う。
帰宅後の写真アップロード・差し替え・削除・共有失効・PC/スマホ最終テストは、認証済みPreview側で再開し、必要な修正だけ本候補へ移す。

本番反映順序:
1. 安全なバックアップ取得と独立復元成功。
2. 本番構造・4RPC・権限・migration履歴の直前監査。
3. SQL007と履歴登録の同一transaction適用、事後監査（個別承認）。
4. 本番設定の整備（個別承認）。
5. 本候補の完全ビルド・最終レビュー・固定。
6. mainへの反映・自動デプロイ（個別承認）。DB準備前にpushしない。

SQL007は承認済み原本のまま。候補コピーのSHA-256は
`a1650b5f4e0b72d94bf7114cc222c97a4a07f615a710be7e3a41fa29646ae127`。
元Gitのarchiveは作業ツリーの改行変換を適用するため、同内容であることをLF正規化して確認後、承認済み原本と同一バイトのコピーを保持した。
候補の`.gitattributes`はこのSQLだけを改行変換対象から外し、今後のcheckout時にも原本ハッシュを保持する。
SQL適用、既存001〜006の再適用、migration修復を自動化しない。
