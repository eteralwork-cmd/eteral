import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';

export default function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slatey hover:text-ink transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Eteral
        </Link>

        <div className="rounded-3xl border border-mist bg-white p-10 shadow-[0_20px_60px_-20px_rgba(42,42,46,0.15)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mist/40">
            <X className="h-8 w-8 text-slatey" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-ink">Checkout cancelled</h1>
          <p className="mt-3 text-sm leading-relaxed text-slatey">
            Your payment was cancelled and you haven't been charged. You can try again
            whenever you're ready.
          </p>
          <button
            onClick={() => navigate('/membership')}
            className="mt-6 rounded-full bg-gradient-accent px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02]"
          >
            Back to Membership
          </button>
        </div>
      </div>
    </div>
  );
}
