import { useState } from 'react';
import { FolderKanban, Plus, Trash2, Loader2, Lock, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { TrackerEntry } from '@/lib/dashboard-data';
import { groupTrackerByMonth, formatMonth } from '@/lib/dashboard-data';

type Props = {
  entries: TrackerEntry[];
  isPaid: boolean;
  onRefresh: () => void;
};

const TYPE_LABELS: Record<string, string> = {
  project: 'Project',
  skill: 'Skill',
  experience: 'Experience',
};

const TYPE_ICONS: Record<string, string> = {
  project: '🛠',
  skill: '📚',
  experience: '💼',
};

export default function TrackerSection({ entries, isPaid, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'project' | 'skill' | 'experience'>('project');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = groupTrackerByMonth(entries);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from('tracker_entries').insert({
      type,
      title,
      description: description || null,
      month: month + '-01',
    });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    setTitle('');
    setDescription('');
    setShowForm(false);
    setSubmitting(false);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tracker_entries').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    onRefresh();
  };

  return (
    <div className="rounded-2xl border border-mist bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-coral" />
          <h3 className="text-base font-semibold text-ink">Project / Skill / Experience Tracker</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-accent px-4 py-2 text-xs font-medium text-white transition-all hover:scale-[1.03]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Entry
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border border-mist bg-paper p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slatey uppercase tracking-wide">New Entry</span>
            <button type="button" onClick={() => setShowForm(false)} className="text-slatey hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            {(['project', 'skill', 'experience'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  type === t ? 'bg-gradient-accent text-white' : 'bg-white border border-mist text-slatey hover:border-ink/20'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. 'Built a React weather app')"
            className="w-full rounded-xl border border-mist bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description (optional)"
            rows={2}
            className="w-full rounded-xl border border-mist bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
          />
          <input
            type="month"
            required
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-xl border border-mist bg-white px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-ink/30"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Entry'}
          </button>
        </form>
      )}

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-slatey">No entries yet. Log a project, skill, or experience to start building your timeline.</p>
      ) : (
        <div className="mt-4 space-y-5">
          {grouped.map(({ month, entries: items }) => (
            <div key={month}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slatey mb-2">{formatMonth(month)}</p>
              <div className="space-y-2">
                {items.map((e) => (
                  <div key={e.id} className="flex items-start gap-3 rounded-xl border border-mist bg-paper p-3">
                    <span className="text-lg leading-none mt-0.5">{TYPE_ICONS[e.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{e.title}</p>
                      {e.description && <p className="mt-0.5 text-xs text-slatey">{e.description}</p>}
                      <span className="mt-1 inline-block rounded-full bg-mist/60 px-2.5 py-0.5 text-xs text-slatey">{TYPE_LABELS[e.type]}</span>
                    </div>
                    <button onClick={() => handleDelete(e.id)} className="text-slatey hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paid AI review */}
      <div className="mt-5 border-t border-mist pt-4">
        {isPaid ? (
          <div className="rounded-xl border border-mist bg-paper p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-4 w-4 text-coral" />
              <span className="text-xs font-semibold uppercase tracking-wide text-coral">AI Portfolio Review</span>
            </div>
            <p className="text-sm text-slatey leading-relaxed">
              {entries.length === 0
                ? "Once you log a few projects, I'll review your portfolio strength and suggest specific gap-filling projects to make you more competitive."
                : `You have ${entries.filter((e) => e.type === 'project').length} project${entries.filter((e) => e.type === 'project').length === 1 ? '' : 's'} logged. ${entries.filter((e) => e.type === 'project').length < 3 ? 'Aim for 2–3 well-documented projects that demonstrate different skills. Your strongest area looks good — consider adding a project that shows you can work with a team or production code.' : 'Good breadth! Focus on documenting each project with a clear README and live link so recruiters can quickly assess your work.'}`}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-mist bg-paper p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slatey" />
              <span className="text-sm text-slatey">AI portfolio strength review</span>
            </div>
            <Link to="/membership" className="text-xs font-medium text-coral hover:text-ink transition-colors">
              Unlock
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
