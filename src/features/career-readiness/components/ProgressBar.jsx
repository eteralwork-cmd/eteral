export default function ProgressBar({ current, total }) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="crq-progress" aria-hidden="false">
      <div className="flex items-center justify-between text-sm text-slate-500 mb-1.5">
        <span>
          Question {current} of {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Quiz progress: question ${current} of ${total}`}
        className="h-2 w-full rounded-full bg-slate-100 overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-indigo-600 transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
