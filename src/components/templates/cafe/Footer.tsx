import type { CafeStore } from "@/types/cafe";

type FooterProps = {
  store: CafeStore;
};

export function Footer({ store }: FooterProps) {
  return (
    <footer className="border-t border-[var(--cafe-cream)] py-12 sm:py-14">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-5">
        <span className="font-cafe-display text-lg tracking-[0.08em] text-[var(--cafe-ink)]/70">
          {store.name}
        </span>
        <span
          className="text-[10px] tracking-[0.3em] text-[var(--cafe-muted)]"
          style={{ fontFamily: "var(--font-cafe-en)" }}
        >
          {store.nameEn}
        </span>
        <p className="text-[10px] tracking-[0.15em] text-[var(--cafe-muted)]/60">
          © 2026 {store.name}
        </p>
      </div>
    </footer>
  );
}
