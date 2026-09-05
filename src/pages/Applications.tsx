import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Loader2, ArrowLeft, ExternalLink, Briefcase, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  applied_date: string | null;
  notes: string | null;
  link: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offered', label: 'Offered' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-mist text-slatey',
  applied: 'bg-sky/20 text-sky',
  interviewing: 'bg-purple-100 text-purple-700',
  offered: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('saved');
  const [appliedDate, setAppliedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = useCallback(async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from('applications').insert({
      company,
      role,
      status,
      applied_date: appliedDate || null,
      notes: notes || null,
      link: link || null,
    });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    setCompany('');
    setRole('');
    setStatus('saved');
    setAppliedDate('');
    setNotes('');
    setLink('');
    setShowForm(false);
    setSubmitting(false);
    fetchApplications();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    fetchApplications();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('applications').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    fetchApplications();
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
              <Briefcase className="h-5 w-5 text-coral" />
              <h1 className="text-2xl font-semibold tracking-tight text-ink">Application Tracker</h1>
            </div>
            <p className="mt-2 text-sm text-slatey">Track every job application — from saved to offered.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-mist bg-white p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slatey uppercase tracking-wide">Company</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Google"
                  className="mt-1.5 w-full rounded-xl border border-mist bg-paper px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slatey uppercase tracking-wide">Role</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Junior Frontend Developer"
                  className="mt-1.5 w-full rounded-xl border border-mist bg-paper px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div>
                <label className="text-xs font-medium text-slatey uppercase tracking-wide">Applied Date</label>
                <input
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mist bg-paper px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink/30"
                />
              </div>
            </div>
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
              <label className="text-xs font-medium text-slatey uppercase tracking-wide">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Recruiter name, interview details, etc."
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-mist bg-paper px-4 py-3 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-gradient-accent px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Application'}
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

        {applications.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-mist bg-white/40 p-12 text-center">
            <Briefcase className="h-8 w-8 text-slatey mx-auto" />
            <p className="mt-4 text-sm text-slatey">No applications yet. Add your first job application to start tracking.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {applications.map((a) => (
              <div key={a.id} className="rounded-2xl border border-mist bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-ink">{a.role}</h3>
                    <p className="text-sm text-slatey">{a.company}</p>
                    {a.applied_date && (
                      <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-slatey">
                        <Calendar className="h-3 w-3" />
                        Applied {new Date(a.applied_date).toLocaleDateString()}
                      </p>
                    )}
                    {a.notes && <p className="mt-2 text-sm text-slatey">{a.notes}</p>}
                    {a.link && (
                      <a
                        href={a.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-sky hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View posting
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-slatey hover:text-red-500 transition-colors"
                    aria-label="Delete application"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4">
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[a.status] || 'bg-mist text-slatey'}`}
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
