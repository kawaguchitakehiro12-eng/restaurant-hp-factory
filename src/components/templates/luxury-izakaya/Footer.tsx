import type { StoreInfo } from "@/types/luxury-izakaya";

type FooterProps = {
  store: StoreInfo;
};

export function Footer({ store }: FooterProps) {
  return (
    <footer className="border-t border-gold/8 bg-ink py-12 sm:py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-5">
        <span className="font-mincho text-base tracking-[0.35em] text-washi/65 sm:text-lg">
          {store.name}
        </span>
        <span className="font-en text-[10px] italic tracking-[0.45em] text-gold/30">
          {store.nameEn}
        </span>
        <p className="font-mincho text-[10px] tracking-[0.3em] text-washi/20">
          © 2026 {store.name}
        </p>
      </div>
    </footer>
  );
}
