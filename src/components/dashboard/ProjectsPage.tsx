import { useState } from 'react';
import { FolderKanban, Plus, X, Loader2, ExternalLink, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useDashboard } from '@/lib/useDashboard';
import { XP_REWARDS } from '@/lib/gamification';
import type { Project } from '@/lib/useDashboard';

export function ProjectsPage({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  const { user } = useAuth();
  const { projects, userSkills, skills, profile, awardXp, completeDailyTask, refresh } = dashboard;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [link, setLink] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const trackSkills = profile ? skills.filter((s) => s.track === profile.target_track) : [];
  const verifiedSkills = userSkills.filter((us) => us.status !== 'unverified');
  const verifiedSkillLabels = new Map(verifiedSkills.map((us) => {
    const s = skills.find((sk) => sk.id === us.skill_id);
    return [us.skill_id, s?.label ?? ''];
  }));

  const openNewForm = () => {
    setEditing(null);
    setTitle(''); setDescription(''); setProblemSolved(''); setRoleDesc('');
    setLink(''); setLessonsLearned(''); setSelectedSkills([]);
    setShowForm(true);
  };

  const openEditForm = (p: Project) => {
    setEditing(p);
    setTitle(p.title); setDescription(p.description ?? ''); setProblemSolved(p.problem_solved ?? '');
    setRoleDesc(p.role_description ?? ''); setLink(p.link ?? ''); setLessonsLearned(p.lessons_learned ?? '');
    setSelectedSkills(p.skills_used ?? []);
    setShowForm(true);
  };

  const computeDepthScore = (data: Partial<Project>): number => {
    let score = 0;
    if (data.title) score += 10;
    if (data.description && data.description.length > 30) score += 20;
    if (data.problem_solved && data.problem_solved.length > 20) score += 20;
    if (data.role_description && data.role_description.length > 20) score += 20;
    if (data.link) score += 15;
    if ((data.skills_used ?? []).length > 0) score += 15;
    return Math.min(100, score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      user_id: user.id,
      title,
      description: description || null,
      problem_solved: problemSolved || null,
      role_description: roleDesc || null,
      skills_used: selectedSkills,
      link: link || null,
      lessons_learned: lessonsLearned || null,
      depth_score: computeDepthScore({ title, description, problem_solved, role_description, skills_used: selectedSkills, link }),
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error: err } = await supabase.from('projects').update(payload).eq('id', editing.id);
      if (err) { setError(err.message); setSubmitting(false); return; }
      await awardXp('update_project', `Updated project: ${title}`, XP_REWARDS.update_project, { project_id: editing.id });
    } else {
      const { error: err } = await supabase.from('projects').insert(payload);
      if (err) { setError(err.message); setSubmitting(false); return; }
      await awardXp('log_project', `Logged project: ${title}`, XP_REWARDS.log_project);
      await completeDailyTask('log_project');
    }

    await refresh();
    setSubmitting(false);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('projects').delete().eq('id', id);
    if (err) { setError(err.message); return; }
    await refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Project Tracker</h1>
          <p className="mt-1 text-sm text-slatey">Turn skills into tangible proof. Build real projects, not padding.</p>
        </div>
        <button
          onClick={openNewForm}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Log Project
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Projects timeline */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-mist bg-white/40 p-12 text-center">
          <FolderKanban className="h-8 w-8 text-slatey mx-auto" />
          <p className="mt-4 text-sm text-slatey">No projects yet. Log your first project to start building your portfolio.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="rounded-2xl border border-mist bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-ink">{p.title}</h3>
                  {p.description && <p className="mt-1.5 text-sm text-slatey leading-relaxed">{p.description}</p>}
                  {p.problem_solved && (
                    <p className="mt-2 text-xs text-slatey"><span className="font-medium text-ink">Problem:</span> {p.problem_solved}</p>
                  )}
                  {p.role_description && (
                    <p className="mt-1 text-xs text-slatey"><span className="font-medium text-ink">Role:</span> {p.role_description}</p>
                  )}
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-sky hover:underline">
                      <ExternalLink className="h-3 w-3" />
                      View project
                    </a>
                  )}
                  {p.skills_used && p.skills_used.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.skills_used.map((sid) => (
                        <span key={sid} className="rounded-full bg-mist/60 px-2.5 py-1 text-xs font-medium text-slatey">
                          {verifiedSkillLabels.get(sid) ?? 'Skill'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    p.depth_score >= 80 ? 'bg-green-100 text-green-700'
                    : p.depth_score >= 50 ? 'bg-amber-100 text-amber-700'
                    : 'bg-mist text-slatey'
                  }`}>
                    Depth: {p.depth_score}/100
                  </span>
                  <button onClick={() => openEditForm(p)} className="text-xs font-medium text-slatey hover:text-ink transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-slatey hover:text-red-500 transition-colors" aria-label="Delete project">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-slatey">
                {new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-mist bg-paper p-6 shadow-[0_30px_80px_-20px_rgba(42,42,46,0.35)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink">{editing ? 'Edit Project' : 'Log a Project'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slatey hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Project Name">
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="My portfolio website"
                  className="w-full rounded-xl border border-mist bg-white px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30" />
              </FormField>
              <FormField label="Description">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project about?" rows={3}
                  className="w-full rounded-xl border border-mist bg-white px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30" />
              </FormField>
              <FormField label="What problem does it solve?">
                <textarea value={problemSolved} onChange={(e) => setProblemSolved(e.target.value)}
                  placeholder="What gap or need does this address?" rows={2}
                  className="w-full rounded-xl border border-mist bg-white px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30" />
              </FormField>
              <FormField label="Your specific role">
                <textarea value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="What did you specifically do on this project?" rows={2}
                  className="w-full rounded-xl border border-mist bg-white px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30" />
              </FormField>
              <FormField label="Link (live project or repo)">
                <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-mist bg-white px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30" />
              </FormField>
              <FormField label="What did you learn?">
                <textarea value={lessonsLearned} onChange={(e) => setLessonsLearned(e.target.value)}
                  placeholder="Key takeaways from building this" rows={2}
                  className="w-full rounded-xl border border-mist bg-white px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30" />
              </FormField>
              <div>
                <label className="text-xs font-medium text-slatey uppercase tracking-wide">Link skills from your track</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {trackSkills.map((s) => {
                    const active = selectedSkills.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSkills((prev) => active ? prev.filter((id) => id !== s.id) : [...prev, s.id])}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                          active ? 'bg-gradient-accent text-white' : 'bg-mist/60 text-slatey hover:bg-mist'
                        }`}
                      >
                        {active && <CheckCircle2 className="h-3 w-3" />}
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="rounded-full bg-gradient-accent px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-60">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Update Project' : 'Save Project'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="rounded-full border border-mist bg-white px-6 py-3 text-sm font-medium text-slatey hover:text-ink transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slatey uppercase tracking-wide">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
