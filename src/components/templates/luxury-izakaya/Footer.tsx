import Link from "next/link";
import type { StoreInfo } from "@/types/luxury-izakaya";

const footerNav = [
  { label: "店舗紹介", href: "#about" },
  { label: "こだわり", href: "#commitment" },
  { label: "おすすめ料理", href: "#recommendations" },
  { label: "店内・空間", href: "#gallery" },
  { label: "店舗情報", href: "#info" },
  { label: "アクセス", href: "#map" },
];

type FooterProps = {
  store: StoreInfo;
};

export function Footer({ store }: FooterProps) {
  const phoneHref = `tel:${store.phone.replace(/[^\d+-]/g, "")}`;

  return (
    <footer className="luxury-footer">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <div className="luxury-footer-grid">
          <div>
            <p className="luxury-footer-brand">{store.name}</p>
            <p className="luxury-footer-brand-en">{store.nameEn}</p>
            <Link href={store.reservationUrl} className="luxury-footer-reserve">
              御予約
            </Link>
          </div>

          <div>
            <p className="luxury-footer-heading">Information</p>
            <div className="luxury-footer-text space-y-2">
              <p>{store.address}</p>
              <p>
                営業 {store.hours.dinner}
                <br />
                定休 {store.hours.closed}
              </p>
              <p>
                <a href={phoneHref} className="luxury-footer-link hover:text-gold/60">
                  {store.phone}
                </a>
              </p>
            </div>
          </div>

          <div>
            <p className="luxury-footer-heading">Access & Links</p>
            <div className="luxury-footer-text space-y-2">
              <p>{store.access}</p>
              {store.instagramUrl ? (
                <p>
                  <a
                    href={store.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="luxury-footer-link"
                  >
                    Instagram
                  </a>
                </p>
              ) : null}
            </div>
            <nav className="luxury-footer-nav" aria-label="フッターナビゲーション">
              {footerNav.map((item) => (
                <a key={item.href} href={item.href} className="luxury-footer-link">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-16 border-t border-gold/8 pt-8 text-center">
          <p className="font-mincho text-[10px] tracking-[0.3em] text-washi/20">
            © 2026 {store.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
