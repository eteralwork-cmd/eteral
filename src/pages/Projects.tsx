import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Loader2, ArrowLeft, ExternalLink, FolderKanban } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  link: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
];

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-mist text-slatey',
  in_progress: 'bg-sky/20 text-sky',
  completed: 'bg-green-100 text-green-700',
  paused: 'bg-orange-100 text-orange-700',
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState('planning');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from('projects').insert({
      title,
      description: description || null,
      link: link || null,
      status,
    });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    setTitle('');
    setDescription('');
    setLink('');
    setStatus('planning');
    setShowForm(false);
    setSubmitting(false);
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    fetchProjects();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('projects').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    fetchProjects();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-slatey" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slatey hover:text-ink transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-coral" />
              <h1 className="text-2xl font-semibold tracking-tight text-ink">Project Tracker</h1>
            </div>
            <p className="mt-2 text-sm text-slatey">Track projects that build your portfolio and strengthen your resume.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-mist bg-white p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slatey uppercase tracking-wide">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My portfolio website"
                className="mt-1.5 w-full rounded-xl border border-mist bg-paper px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slatey uppercase tracking-wide">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-mist bg-paper px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slatey uppercase tracking-wide">Link (optional)</label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="mt-1.5 w-full rounded-xl border border-mist bg-paper px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slatey uppercase tracking-wide">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mist bg-paper px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink/30"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-gradient-accent px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Project'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full border border-mist bg-white px-6 py-3 text-sm font-medium text-slatey transition-all hover:border-ink/20"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {projects.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-mist bg-white/40 p-12 text-center">
            <FolderKanban className="h-8 w-8 text-slatey mx-auto" />
            <p className="mt-4 text-sm text-slatey">No projects yet. Add your first project to start tracking.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="rounded-2xl border border-mist bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-ink">{p.title}</h3>
                    {p.description && <p className="mt-1.5 text-sm text-slatey">{p.description}</p>}
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-sky hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View project
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-slatey hover:text-red-500 transition-colors"
                    aria-label="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <select
                    value={p.status}
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[p.status] || 'bg-mist text-slatey'}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
