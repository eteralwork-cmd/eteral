import { BarChart3, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScoreBar from './ScoreBar';
import { DASHBOARD_CATEGORIES, getCategoryMeta } from '@/lib/dashboard-data';

type Props = {
  scores: Record<string, number>;
  isPaid: boolean;
};

export default function ScoreBreakdown({ scores, isPaid }: Props) {
  const hasScores = DASHBOARD_CATEGORIES.some((c) => typeof scores[c.id] === 'number');

  return (
    <div className="rounded-2xl border border-mist bg-white p-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-coral" />
        <h3 className="text-base font-semibold text-ink">Readiness Score Breakdown</h3>
      </div>

      {!hasScores ? (
        <p className="mt-4 text-sm text-slatey">Take the readiness quiz to see your scores across all categories.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {DASHBOARD_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <ScoreBar category={cat.id} score={scores[cat.id] ?? 0} />
              {isPaid && (
                <p className="mt-1 ml-[7.75rem] text-xs text-slatey leading-relaxed">
                  {getPaidExplanation(cat.id, scores[cat.id] ?? 0)}
                </p>
              )}
              {!isPaid && cat.id === 'careerClarity' && (
                <Link to="/membership" className="mt-1 ml-[7.75rem] inline-flex items-center gap-1 text-xs text-coral hover:text-ink transition-colors">
                  <BookOpen className="h-3 w-3" />
                  Get AI explanation
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getPaidExplanation(categoryId: string, score: number): string {
  const meta = getCategoryMeta(categoryId);
  const label = meta?.label ?? categoryId;
  if (score >= 75) return `${label} is a strong area. Keep maintaining and refining — don't let it slip.`;
  if (score >= 50) return `${label} is developing. Focus on consistent practice and real-world application to push past the midpoint.`;
  if (score >= 25) return `${label} needs attention. Start with one small, concrete action this week — momentum matters more than perfection.`;
  return `${label} is a significant gap. This is likely limiting your results — prioritize it and take the first step today, even if small.`;
}
