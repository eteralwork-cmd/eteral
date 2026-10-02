export default function CategoryBar({ label, score }) {
  return (
    <div className="crq-category-bar">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500 tabular-nums">{score}/100</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${score} out of 100`}
        className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-indigo-600"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
