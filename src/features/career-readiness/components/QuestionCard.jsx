export default function QuestionCard({ question, selectedValue, onSelect }) {
  return (
    <fieldset className="crq-question">
      <legend className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug mb-5">
        {question.prompt}
      </legend>

      <div className="flex flex-col gap-2.5" role="radiogroup" aria-label={question.prompt}>
        {question.options.map((option, i) => {
          const inputId = `${question.id}-opt-${i}`;
          const isSelected = selectedValue === option.value;

          return (
            <label
              key={inputId}
              htmlFor={inputId}
              className={[
                "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                "focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2",
                isSelected
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              <input
                id={inputId}
                type="radio"
                name={question.id}
                value={option.value}
                checked={isSelected}
                onChange={() => onSelect(question.id, option.value)}
                className="h-4 w-4 shrink-0 accent-indigo-600"
              />
              <span className="text-slate-800 text-sm sm:text-base">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
