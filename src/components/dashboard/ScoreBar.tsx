import { getCategoryMeta } from '@/lib/dashboard-data';

type Props = {
  category: string;
  score: number;
  size?: 'sm' | 'md';
};

const CATEGORY_COLORS: Record<string, string> = {
  careerClarity: '#F5A3A0',
  skillReadiness: '#9CC4F0',
  portfolioReadiness: '#7DD3A0',
  resumeReadiness: '#F0C76B',
  professionalPresence: '#B89DE0',
  interviewReadiness: '#F5A3A0',
  jobSearchReadiness: '#9CC4F0',
  organization: '#7DD3A0',
  professionalGrowth: '#F0C76B',
};

export default function ScoreBar({ category, score, size = 'md' }: Props) {
  const meta = getCategoryMeta(category);
  const color = CATEGORY_COLORS[category] || '#9CC4F0';
  const h = size === 'sm' ? 'h-2' : 'h-3';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-slatey w-28 shrink-0 truncate">
        {meta?.shortLabel ?? category}
      </span>
      <div className={`flex-1 ${h} rounded-full bg-mist/60 overflow-hidden`}>
        <div
          className={`${h} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-ink tabular-nums w-8 text-right">{score}</span>
    </div>
  );
}
