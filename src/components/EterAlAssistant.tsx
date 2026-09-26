import { useState } from 'react';
import { MessageCircle, X, Sparkles, Clock } from 'lucide-react';

export default function EterAlAssistant() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[320px] max-w-[calc(100vw-3rem)] rounded-2xl border border-mist bg-white shadow-[0_20px_60px_-20px_rgba(42,42,46,0.25)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-mist px-4 py-3 bg-gradient-accent">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Ask Eteral</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mist/40">
              <Clock className="h-6 w-6 text-slatey" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-ink">Coming soon</h3>
            <p className="mt-2 text-sm text-slatey leading-relaxed">
              Your career-readiness assistant is on its way. Soon you'll be able to ask Eteral anything about your resume, interview prep, or career path.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-accent text-white shadow-lg transition-all hover:scale-105"
        aria-label="Ask Eteral"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}