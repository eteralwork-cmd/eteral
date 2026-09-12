import { useState } from 'react';
import { FolderKanban, Plus, Trash2, Loader2, Lock, Sparkles, X, Rocket, FolderCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { TrackerEntry } from '@/lib/dashboard-data';
import { groupTrackerByMonth, formatMonth } from '@/lib/dashboard-data';

type Props = {
  entries: TrackerEntry[];
  isPaid: boolean;
  onRefresh: () => void;
};

type Intent = 'new' | 'existing';

export default function TrackerSection({ entries, isPaid, onRefresh }: Props) {
  const [intent, setIntent] = useState<Intent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = groupTrackerByMonth(entries);
  const hasEntries = entries.length > 0;

  const openForm = (chosenIntent: Intent) => {
    setIntent(chosenIntent);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setIntent(null);
    setTitle('');
    setDescription('');
    setSkillInput('');
    setSkills([]);
    setError(null);
  };

  const addSkill = () => {
    const val = skillInput.trim();
    if (!val) return;
    if (!skills.some((s) => s.toLowerCase() === val.toLowerCase())) {
      setSkills([...skills, val]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from('tracker_entries').insert({
      type: 'project',
      title,
      description: description || null,
      month: month + '-01',
      skills,
    });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    closeForm();
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
          <h3 className="text-base font-semibold text-ink">Project Tracker</h3>
        </div>
        {hasEntries && !showForm && (
          <button
            onClick={() => openForm('existing')}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-accent px-4 py-2 text-xs font-medium text-white transition-all hover:scale-[1.03]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Project
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

      {/* Empty state: choose a path */}
      {!hasEntries && !showForm && (
        <div className="mt-5 rounded-xl border border-mist bg-paper p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent text-white">
            <Rocket className="h-5 w-5" />
          </div>
          <h4 className="mt-3 text-sm font-semibold text-ink">Let's build your first project</h4>
          <p className="mt-1.5 text-xs text-slatey max-w-xs mx-auto leading-relaxed">
            Most first projects take about 1–3 weeks to build and document. Start small — a
            simple project you finish and explain well beats a big one you never finish.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openForm('new')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02]"
            >
              <Rocket className="h-4 w-4" />
              Start My First Project
            </button>
            <button
              onClick={() => openForm('existing')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-mist bg-white px-5 py-2.5 text-sm font-medium text-ink hover:border-ink/20 transition-all"
            >
              <FolderCheck className="h-4 w-4" />
              I've Already Done Projects
            </button>
          </div>
        </div>
      )}

      {/* Entry form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border border-mist bg-paper p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slatey uppercase tracking-wide">
              {intent === 'new' ? 'Your First Project' : 'New Project Entry'}
            </span>
            <button type="button" onClick={closeForm} className="text-slatey hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>

          {intent === 'new' && (
            <p className="text-xs text-slatey leading-relaxed">
              Give it a title and a rough timeframe below — even a small, in-progress project
              counts. You can always come back and update it.
            </p>
          )}

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
            placeholder="What problem does it solve, and what was your role? (optional)"
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

          {/* Skills used */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slatey uppercase tracking-wide">
              Skills used
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="e.g. React (press Enter to add)"
                className="flex-1 rounded-xl border border-mist bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
              />
              <button
                type="button"
                onClick={addSkill}
                className="rounded-xl border border-mist bg-white px-4 text-sm font-medium text-ink hover:border-ink/20 transition-colors"
              >
                Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-mist/60 px-3 py-1 text-xs text-ink"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-slatey hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !title}
            className="rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Project'}
          </button>
        </form>
      )}

      {/* Existing entries */}
      {hasEntries && (
        <div className="mt-4 space-y-5">
          {grouped.map(({ month, entries: items }) => (
            <div key={month}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slatey mb-2">{formatMonth(month)}</p>
              <div className="space-y-2">
                {items.map((e) => (
                  <div key={e.id} className="flex items-start gap-3 rounded-xl border border-mist bg-paper p-3">
                    <span className="text-lg leading-none mt-0.5">🛠</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{e.title}</p>
                      {e.description && <p className="mt-0.5 text-xs text-slatey">{e.description}</p>}
                      {Array.isArray(e.skills) && e.skills.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {e.skills.map((skill: string) => (
                            <span key={skill} className="rounded-full bg-mist/60 px-2.5 py-0.5 text-xs text-slatey">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
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
                ? "Once you log a project, I'll review your portfolio strength and suggest specific gap-filling projects to make you more competitive."
                : `You have ${entries.length} project${entries.length === 1 ? '' : 's'} logged. ${entries.length < 3 ? 'Aim for 2–3 well-documented projects that demonstrate different skills. Consider adding one that shows you can work with a team or production code.' : 'Good breadth! Focus on documenting each project with a clear README and live link so recruiters can quickly assess your work.'}`}
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