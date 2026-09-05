import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Check, BookOpen, Target } from 'lucide-react';

const RESOURCES = [
  {
    title: 'ATS Resume Checklist',
    desc: 'A clean one-page checklist to see if your resume reaches the human.',
    type: 'download',
    fileUrl: '/freebies/eteral-ats-resume-checklist.pdf',
    icon: Check,
  },
  {
    title: 'ATS-Friendly Resume Template',
    desc: 'An editable, ATS-friendly resume template you can customize.',
    type: 'download',
    fileUrl: '/freebies/ats-friendly-tech-resume-template.pdf',
    icon: FileText,
  },
];

const GUIDES = [
  {
    title: 'How to structure your resume',
    desc: 'The ideal resume structure for students and freshers — what goes where, and why.',
    icon: BookOpen,
  },
  {
    title: 'How to actually improve your resume',
    desc: 'Concrete steps to take your resume from okay to getting interviews.',
    icon: Target,
  },
  {
    title: 'Tailoring your resume for each job',
    desc: 'How to quickly adapt your resume for different roles without rewriting everything.',
    icon: FileText,
  },
];

function triggerDownload(url: string, filename?: string) {
  const link = document.createElement('a');
  link.href = url;
  if (filename) link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ResumeResources() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slatey hover:text-ink transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-coral" />
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Resume Resources</h1>
          </div>
          <p className="mt-2 text-sm text-slatey">Templates, checklists, and guidance to build a resume that gets past ATS and impresses humans.</p>
        </div>

        {/* Downloads */}
        <h2 className="mt-12 text-lg font-semibold text-ink">Templates & Downloads</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RESOURCES.map((r) => (
            <div key={r.title} className="rounded-2xl border border-mist bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-accent text-white">
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slatey">{r.desc}</p>
              <button
                onClick={() => triggerDownload(r.fileUrl, `${r.title}.pdf`)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-coral"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          ))}
        </div>

        {/* Guidance */}
        <h2 className="mt-12 text-lg font-semibold text-ink">Resume Guidance</h2>
        <div className="mt-4 space-y-4">
          {GUIDES.map((g) => (
            <div key={g.title} className="rounded-2xl border border-mist bg-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mist/40 text-slatey">
                  <g.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink">{g.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slatey">{g.desc}</p>
                  <p className="mt-3 text-xs text-slatey/70">Detailed guide coming soon — Standard members will be notified.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
