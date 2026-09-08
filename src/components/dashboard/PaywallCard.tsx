import { Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = {
  teaser: string;
  children: React.ReactNode;
  upsellText?: string;
};

export default function PaywallCard({ teaser, children, upsellText }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-mist bg-white">
      <div className="pointer-events-none select-none blur-sm opacity-50 max-h-64 overflow-hidden">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-accent text-white">
          <Lock className="h-5 w-5" />
        </div>
        <p className="mt-3 max-w-xs text-center text-sm text-ink px-6">
          {teaser}
        </p>
        {upsellText && (
          <p className="mt-1 max-w-xs text-center text-xs text-slatey px-6">
            {upsellText}
          </p>
        )}
        <Link
          to="/membership"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-accent px-5 py-2.5 text-xs font-semibold text-white transition-all hover:scale-[1.03]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Upgrade to unlock
        </Link>
      </div>
    </div>
  );
}
