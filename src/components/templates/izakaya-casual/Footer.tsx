import type { IzakayaCasualStore } from "@/types/izakaya-casual";

const navItems = [
  { label: "名物", href: "#specialty" },
  { label: "メニュー", href: "#menu" },
  { label: "宴会", href: "#banquet" },
  { label: "店内", href: "#space" },
  { label: "アクセス", href: "#access" },
];

type FooterProps = {
  store: IzakayaCasualStore;
};

export function Footer({ store }: FooterProps) {
  return (
    <footer className="izk-footer">
      <div className="izk-footer-inner">
        <div>
          <p className="izk-footer-tag">また来てね。</p>
          <p className="izk-footer-name">{store.name}</p>
          {store.nameEn ? (
            <p className="izk-footer-name-en">{store.nameEn}</p>
          ) : null}
        </div>

        <nav className="izk-footer-nav" aria-label="フッターナビゲーション">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <p className="izk-footer-copy">© 2026 {store.name}</p>
      </div>
    </footer>
  );
}
