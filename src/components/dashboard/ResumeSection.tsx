import { FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResumeSection() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-mist bg-white p-6">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-coral" />
        <h3 className="text-base font-semibold text-ink">Boost Your Resume</h3>
      </div>
      <p className="mt-2 text-sm text-slatey leading-relaxed">
        Build an accurate, ATS-friendly resume from what's already in your dashboard.
      </p>
      <button
        onClick={() => navigate('/resume')}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02]"
      >
        Get started
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}