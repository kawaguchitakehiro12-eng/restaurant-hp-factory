import { store } from "@/data/luxury-izakaya";

export function Footer() {
  return (
    <footer className="border-t border-gold/8 bg-ink py-16 sm:py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6">
        <div className="flex flex-col items-center gap-3">
          <span className="font-mincho text-lg tracking-[0.4em] text-washi/70">{store.name}</span>
          <span className="font-en text-[10px] italic tracking-[0.5em] text-gold/35">
            {store.nameEn}
          </span>
        </div>
        <p className="font-mincho text-[10px] tracking-[0.35em] text-washi/20">
          © 2026 {store.name}
        </p>
      </div>
    </footer>
  );
}
