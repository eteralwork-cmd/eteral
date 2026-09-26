import { useEffect, useState } from 'react';
import { Target, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

type WeeklyGoal = {
  id: string;
  goal_text: string;
  completed: boolean;
  week_start: string;
};

export default function WeeklyGoalCard() {
  const [goal, setGoal] = useState<WeeklyGoal | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const weekStart = getWeekStart();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('week_start', weekStart)
        .maybeSingle();
      if (!error) setGoal(data);
      setLoading(false);
    })();
  }, [weekStart]);

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('weekly_goals')
      .upsert(
        { user_id: user!.id, week_start: weekStart, goal_text: draft.trim(), completed: false },
        { onConflict: 'user_id,week_start' },
      )
      .select()
      .single();
    if (!error) setGoal(data);
    setSaving(false);
    setDraft('');
  };

  const toggleComplete = async () => {
    if (!goal) return;
    const { data, error } = await supabase
      .from('weekly_goals')
      .update({ completed: !goal.completed, updated_at: new Date().toISOString() })
      .eq('id', goal.id)
      .select()
      .single();
    if (!error) setGoal(data);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-mist bg-white p-6 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slatey" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-mist bg-white p-6">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-coral" />
        <h3 className="text-base font-semibold text-ink">This Week's Goal</h3>
      </div>

      {goal ? (
        <div className="mt-4 flex items-start gap-3">
          <button
            onClick={toggleComplete}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
              goal.completed ? 'bg-gradient-accent border-transparent' : 'border-mist'
            }`}
          >
            {goal.completed && <Check className="h-3 w-3 text-white" />}
          </button>
          <p className={`text-sm ${goal.completed ? 'text-slatey line-through' : 'text-ink'}`}>{goal.goal_text}</p>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Apply to 5 roles this week"
            className="flex-1 rounded-xl border border-mist bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:ring-2 focus:ring-coral/20"
          />
          <button
            onClick={handleSave}
            disabled={!draft.trim() || saving}
            className="rounded-full bg-gradient-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set goal'}
          </button>
        </div>
      )}
    </div>
  );
}