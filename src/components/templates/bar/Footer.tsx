import type { BarStore } from "@/types/bar";

const footerLinks = [
  { label: "Concept", href: "#concept" },
  { label: "Drinks", href: "#drinks" },
  { label: "Food", href: "#food" },
  { label: "Space", href: "#space" },
  { label: "Gallery", href: "#gallery" },
  { label: "News", href: "#news" },
  { label: "Access", href: "#access" },
];

type FooterProps = {
  store: BarStore;
};

export function Footer({ store }: FooterProps) {
  return (
    <footer className="bar-footer">
      <div className="bar-footer-inner">
        <div>
          <p className="bar-footer-name">{store.name}</p>
          <p className="bar-footer-name-en">{store.nameEn}</p>
        </div>

        <nav className="bar-footer-nav" aria-label="フッターナビゲーション">
          {footerLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <p className="bar-footer-copy">© 2026 {store.name}</p>
      </div>
    </footer>
  );
}
