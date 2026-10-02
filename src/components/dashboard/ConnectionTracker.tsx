import { useState } from 'react';
import { Users, Plus, Trash2, Loader2, Lock, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Connection } from '@/lib/dashboard-data';

type Props = {
  connections: Connection[];
  isPaid: boolean;
  onRefresh: () => void;
};

export default function ConnectionTracker({ connections, isPaid, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from('connections').insert({
      company_name: company,
      contact_name: contact || null,
    });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    setCompany('');
    setContact('');
    setShowForm(false);
    setSubmitting(false);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('connections').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    onRefresh();
  };

  return (
    <div className="rounded-2xl border border-mist bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-coral" />
          <h3 className="text-base font-semibold text-ink">Connection Tracker</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-accent px-4 py-2 text-xs font-medium text-white transition-all hover:scale-[1.03]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border border-mist bg-paper p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slatey uppercase tracking-wide">New Connection</span>
            <button type="button" onClick={() => setShowForm(false)} className="text-slatey hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            type="text"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
            className="w-full rounded-xl border border-mist bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
          />
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contact name (optional)"
            className="w-full rounded-xl border border-mist bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Connection'}
          </button>
        </form>
      )}

      <div className="mt-4 flex items-center gap-3">
        <div className="rounded-xl bg-mist/40 px-4 py-2 text-center">
          <span className="text-2xl font-semibold text-ink tabular-nums">{connections.length}</span>
          <span className="block text-xs text-slatey">connections</span>
        </div>
        {connections.length > 0 && (
          <div className="flex-1 space-y-2">
            {connections.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-ink font-medium truncate">{c.company_name}</span>
                <span className="text-slatey text-xs truncate">{c.contact_name || '—'}</span>
                <button onClick={() => handleDelete(c.id)} className="text-slatey hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {connections.length > 3 && (
              <p className="text-xs text-slatey">+ {connections.length - 3} more</p>
            )}
          </div>
        )}
      </div>

      {connections.length === 0 && !showForm && (
        <p className="mt-3 text-sm text-slatey">No connections logged yet. Add your first one to start tracking your network.</p>
      )}

      {/* Paid AI insight */}
      <div className="mt-5 border-t border-mist pt-4">
        {isPaid ? (
          <div className="rounded-xl border border-mist bg-paper p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-4 w-4 text-coral" />
              <span className="text-xs font-semibold uppercase tracking-wide text-coral">AI Network Insight</span>
            </div>
            <p className="text-sm text-slatey leading-relaxed">
              {connections.length === 0
                ? "You haven't logged any connections yet. Start by adding 3–5 companies you're interested in, even if you don't have a contact there. This will help identify networking gaps."
                : `You have ${connections.length} connection${connections.length === 1 ? '' : 's'} logged. Consider reaching out to 2 more contacts at target companies this week to strengthen your referral pipeline.`}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-mist bg-paper p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slatey" />
              <span className="text-sm text-slatey">AI insight on network gaps</span>
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
