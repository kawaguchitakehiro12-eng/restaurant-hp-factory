import type { BarStore } from "@/types/bar";

const footerLinks = [
  { label: "Night", href: "#concept" },
  { label: "Drinks", href: "#drinks" },
  { label: "Food", href: "#food" },
  { label: "Space", href: "#space" },
  { label: "Notes", href: "#news" },
  { label: "Visit", href: "#access" },
];

type FooterProps = {
  store: BarStore;
};

export function Footer({ store }: FooterProps) {
  return (
    <footer className="bar-footer">
      <div className="bar-footer-inner">
        <p className="bar-footer-kicker">See you after dark</p>
        <p className="bar-footer-name">{store.name}</p>
        <p className="bar-footer-name-en">{store.nameEn}</p>

        <nav className="bar-footer-nav" aria-label="フッターナビゲーション">
          {footerLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <p className="bar-footer-copy">
          © {new Date().getFullYear()} {store.name}
        </p>
      </div>
    </footer>
  );
}
