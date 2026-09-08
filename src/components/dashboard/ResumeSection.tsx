import { FileText, Download, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = {
  isPaid: boolean;
};

const RESOURCES = [
  { title: 'ATS Resume Checklist', fileUrl: '/freebies/Eteral-ATS-Resume-Checklist.pdf' },
  { title: 'ATS-Friendly Resume Template', fileUrl: '/freebies/ATS-Friendly-Resume-Eteral-Template.pdf' },
];

function triggerDownload(url: string, filename?: string) {
  const link = document.createElement('a');
  link.href = url;
  if (filename) link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ResumeSection({ isPaid }: Props) {
  return (
    <div className="rounded-2xl border border-mist bg-white p-6">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-coral" />
        <h3 className="text-base font-semibold text-ink">Resume Resources</h3>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {RESOURCES.map((r) => (
          <button
            key={r.title}
            onClick={() => triggerDownload(r.fileUrl, `${r.title}.pdf`)}
            className="flex items-center gap-2 rounded-xl border border-mist bg-paper p-4 text-left transition-all hover:border-ink/20"
          >
            <Download className="h-4 w-4 text-coral shrink-0" />
            <span className="text-sm font-medium text-ink">{r.title}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 border-t border-mist pt-4">
        {isPaid ? (
          <div className="rounded-xl border border-mist bg-paper p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-4 w-4 text-coral" />
              <span className="text-xs font-semibold uppercase tracking-wide text-coral">AI Resume Review</span>
            </div>
            <p className="text-sm text-slatey leading-relaxed mb-3">
              Upload your resume for an ATS compatibility score and tailored feedback on structure, keywords, and impact statements.
            </p>
            <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02]">
              <FileText className="h-4 w-4" />
              Upload Resume for Review
            </button>
            <p className="mt-2 text-xs text-slatey">Coming soon — AI resume scoring will be available shortly.</p>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-mist bg-paper p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slatey" />
              <span className="text-sm text-slatey">AI resume review & ATS scoring</span>
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
