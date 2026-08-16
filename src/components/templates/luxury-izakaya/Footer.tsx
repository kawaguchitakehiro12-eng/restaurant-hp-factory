import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import type { StoreInfo } from "@/types/luxury-izakaya";

const footerNav = [
  { label: "おもてなし", href: "#about" },
  { label: "技", href: "#commitment" },
  { label: "一皿", href: "#recommendations" },
  { label: "空間", href: "#gallery" },
  { label: "案内", href: "#info" },
  { label: "道筋", href: "#map" },
];

type FooterProps = {
  store: StoreInfo;
};

export function Footer({ store }: FooterProps) {
  const phoneHref = `tel:${store.phone.replace(/[^\d+-]/g, "")}`;

  return (
    <footer className="luxury-footer">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <FadeIn className="luxury-footer-closing">
          <p className="luxury-footer-closing-kicker">Closing</p>
          <p className="luxury-footer-closing-message">
            季節のご来店を、心よりお待ちしております。
          </p>
          <p className="luxury-footer-closing-sub">
            またのお越しを、静かな灯りとともに。
          </p>
          <Link href={store.reservationUrl} className="luxury-footer-closing-cta">
            御予約のご案内
          </Link>
        </FadeIn>

        <div className="luxury-footer-grid">
          <div>
            <p className="luxury-footer-brand">{store.name}</p>
            <p className="luxury-footer-brand-en">{store.nameEn}</p>
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
                <a href={phoneHref} className="luxury-footer-link">
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

        <div className="luxury-footer-bottom">
          <p className="luxury-footer-copy">© {new Date().getFullYear()} {store.name}</p>
        </div>
      </div>
    </footer>
  );
}
