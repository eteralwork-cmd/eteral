import { BookOpen, Sparkles } from 'lucide-react';

type Props = {
  purchased: boolean;
};

export default function CareerClarityWorkbook({ purchased }: Props) {
  return (
    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/5 via-white to-sky/5 p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent text-white">
          <BookOpen className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-coral">
          Career Clarity Workbook
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-ink">Find your direction</h3>
      <p className="mt-2 text-sm leading-relaxed text-slatey">
        A guided workbook to help you define your target roles, identify what's holding you back,
        and create a clear action plan. One-time purchase — available to all members.
      </p>

      {purchased ? (
        <button className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02]">
          <BookOpen className="h-4 w-4" />
          Open Workbook
        </button>
      ) : (
        <button className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02]">
          <Sparkles className="h-4 w-4" />
          Get the Workbook — $12
        </button>
      )}
      <p className="mt-2 text-xs text-slatey">Separate one-time purchase. No subscription required.</p>
    </div>
  );
}
