type BalSectionHeadProps = {
  en: string;
  ja: string;
  lead?: string;
  tone?: "terracotta" | "cream" | "olive";
  className?: string;
};

export function BalSectionHead({
  en,
  ja,
  lead,
  tone = "terracotta",
  className = "",
}: BalSectionHeadProps) {
  return (
    <div className={`bal-head bal-head--${tone} ${className}`}>
      <h2 className="bal-head-en">{en}</h2>
      <div className="bal-head-side">
        <p className="bal-head-ja">{ja}</p>
        {lead ? <p className="bal-head-lead">{lead}</p> : null}
      </div>
    </div>
  );
}
