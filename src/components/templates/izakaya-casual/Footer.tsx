import type { IzakayaCasualStore } from "@/types/izakaya-casual";

const footerLinks = [
  { label: "名物", href: "#specialty" },
  { label: "おすすめ", href: "#specials" },
  { label: "メニュー", href: "#menu" },
  { label: "宴会", href: "#banquet" },
  { label: "店内", href: "#space" },
  { label: "ギャラリー", href: "#gallery" },
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
          <p className="izk-footer-name">{store.name}</p>
          {store.nameEn ? (
            <p className="izk-footer-name-en">{store.nameEn}</p>
          ) : null}
        </div>

        <nav className="izk-footer-nav" aria-label="フッターナビゲーション">
          {footerLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <p className="izk-footer-copy">© 2026 {store.name}</p>
      </div>
    </footer>
  );
}
