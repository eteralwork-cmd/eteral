import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Code, BarChart3, Brain, Cpu, ArrowRight, Loader2 } from 'lucide-react';
import { TRACKS, type TrackKey } from '@/lib/gamification';

const TRACK_ICONS: Record<string, typeof Code> = {
  code: Code,
  chart: BarChart3,
  brain: Brain,
  cpu: Cpu,
};

type Props = {
  onComplete: (track: TrackKey) => Promise<void>;
};

export function Onboarding({ onComplete }: Props) {
  const [selected, setSelected] = useState<TrackKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (!selected) return;
    setSubmitting(true);
    await onComplete(selected);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-mist bg-white/50 px-4 py-1.5 text-xs font-medium tracking-wide text-slatey">
            <Sparkles className="h-3.5 w-3.5 text-coral" />
            Welcome to Eteral
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Pick your career track
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slatey">
            This determines which skills, quiz questions, and interview prompts you see throughout the app.
            You can change this later.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TRACKS.map((track) => {
            const Icon = TRACK_ICONS[track.icon] ?? Code;
            const isActive = selected === track.key;
            return (
              <button
                key={track.key}
                onClick={() => setSelected(track.key)}
                className={`flex flex-col items-start gap-3 rounded-2xl border p-6 text-left transition-all duration-200 ${
                  isActive
                    ? 'border-coral bg-gradient-to-br from-coral/5 via-white to-sky/5 shadow-[0_12px_32px_-12px_rgba(245,163,160,0.3)]'
                    : 'border-mist bg-white hover:border-ink/20 hover:shadow-[0_8px_24px_-12px_rgba(42,42,46,0.12)]'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? 'bg-gradient-accent text-white' : 'bg-mist text-slatey'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink">{track.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slatey">{track.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleConfirm}
            disabled={!selected || submitting}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-7 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Start building
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
