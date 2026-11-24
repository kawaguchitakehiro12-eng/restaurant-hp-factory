import type { CafeStore } from "@/types/cafe";

const footerLinks = [
  { label: "Story", href: "#concept" },
  { label: "Menu", href: "#menu" },
  { label: "Gallery", href: "#gallery" },
  { label: "Journal", href: "#news" },
  { label: "Visit", href: "#info" },
];

type FooterProps = {
  store: CafeStore;
};

export function Footer({ store }: FooterProps) {
  return (
    <footer className="cafe-footer">
      <div className="cafe-footer-inner">
        <p className="cafe-footer-kicker">See you soon</p>
        <p className="cafe-footer-message">
          またの午後を、ここで。
        </p>
        <div className="cafe-footer-brand">
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

        <p className="cafe-footer-copy">© {new Date().getFullYear()} {store.name}</p>
      </div>
    </footer>
  );
}
