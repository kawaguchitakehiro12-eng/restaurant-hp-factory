import type { CafeStore } from "@/types/cafe";

const footerLinks = [
  { label: "Concept", href: "#concept" },
  { label: "Menu", href: "#menu" },
  { label: "Gallery", href: "#gallery" },
  { label: "News", href: "#news" },
  { label: "Info", href: "#info" },
];

type FooterProps = {
  store: CafeStore;
};

export function Footer({ store }: FooterProps) {
  return (
    <footer className="cafe-footer">
      <div className="cafe-footer-inner">
        <div>
          <p className="cafe-footer-name">{store.name}</p>
          <p className="cafe-footer-name-en">{store.nameEn}</p>
        </div>

        <nav className="cafe-footer-nav" aria-label="フッターナビゲーション">
          {footerLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <p className="cafe-footer-copy">© 2026 {store.name}</p>
      </div>
    </footer>
  );
}
