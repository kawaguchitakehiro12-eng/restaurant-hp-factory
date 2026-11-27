import type { BalHappyHour } from "@/types/bal";

type HappyHourProps = {
  happyHour: BalHappyHour;
};

export function HappyHour({ happyHour }: HappyHourProps) {
  if (!happyHour.time && !happyHour.offer) return null;

  const run = (
    <>
      <span className="bal-hh-key">HAPPY HOUR</span>
      {happyHour.time ? <span className="bal-hh-time">{happyHour.time}</span> : null}
      {happyHour.offer ? <span className="bal-hh-offer">{happyHour.offer}</span> : null}
      {happyHour.note ? <span className="bal-hh-note">{happyHour.note}</span> : null}
      <span className="bal-hh-dot" aria-hidden>
        ●
      </span>
    </>
  );

  return (
    <section className="bal-hh" aria-label="ハッピーアワー">
      <div className="bal-hh-track">
        <p className="bal-hh-run">{run}</p>
        <p className="bal-hh-run" aria-hidden>
          {run}
        </p>
        <p className="bal-hh-run" aria-hidden>
          {run}
        </p>
      </div>
    </section>
  );
}
