export function SampleLabel({ className }: { className?: string }) {
  return (
    <span className={`demo-sample-label${className ? ` ${className}` : ""}`}>
      サンプル
    </span>
  );
}
