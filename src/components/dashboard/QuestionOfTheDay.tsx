import { useState } from 'react';
import { Sun, ChevronDown, ChevronUp, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DailyQuestion } from '@/lib/dashboard-data';
import { getCategoryMeta } from '@/lib/dashboard-data';

type Props = {
  question: DailyQuestion | null;
  isPaid: boolean;
};

export default function QuestionOfTheDay({ question, isPaid }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!question) {
    return (
      <div className="rounded-2xl border border-mist bg-white p-6">
        <p className="text-sm text-slatey">Question of the day is loading…</p>
      </div>
    );
  }

  const meta = getCategoryMeta(question.category);

  return (
    <div className="rounded-2xl border border-mist bg-white p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent text-white">
          <Sun className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-coral">
          Question of the Day
        </span>
        {meta && (
          <span className="ml-auto rounded-full bg-mist/60 px-3 py-1 text-xs font-medium text-slatey">
            {meta.shortLabel}
          </span>
        )}
      </div>

      <p className="mt-4 text-base font-medium leading-relaxed text-ink">
        {question.question_text}
      </p>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slatey hover:text-ink transition-colors"
      >
        {isPaid ? (
          <>
            {expanded ? 'Hide reflection' : 'Guided reflection'}
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5" />
            Unlock guided reflection
          </>
        )}
      </button>

      {expanded && isPaid && (
        <div className="mt-4 rounded-xl border border-mist bg-paper p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="h-4 w-4 text-coral" />
            <span className="text-xs font-semibold uppercase tracking-wide text-coral">AI Guidance</span>
          </div>
          <p className="text-sm leading-relaxed text-slatey">
            Take 2 minutes to write your answer. Don't overthink it — the goal is to surface
            what's on your mind and identify one concrete next step. Consider: What is the real
            obstacle? What would it look like if this were easy? What is the smallest action you
            could take today?
          </p>
        </div>
      )}

      {!isPaid && (
        <Link
          to="/membership"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slatey hover:text-ink transition-colors"
        >
          <Sparkles className="h-3 w-3" />
          Upgrade for AI-guided self-reflection
        </Link>
      )}
    </div>
  );
}
