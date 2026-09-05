import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, Clock } from 'lucide-react';
import { useMembership } from '@/lib/membership';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { isStandard, loading, refresh } = useMembership();
  const [attempts, setAttempts] = useState(0);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    refresh();

    refreshTimer.current = setInterval(() => {
      setAttempts((a) => a + 1);
      refresh();
    }, 3000);

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [refresh]);

  useEffect(() => {
    if (isStandard && refreshTimer.current) {
      clearInterval(refreshTimer.current);
      setTimeout(() => navigate('/dashboard'), 1500);
    }

    if (attempts >= 20 && refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }
  }, [isStandard, attempts, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slatey hover:text-ink transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Eteral
        </Link>

        <div className="rounded-3xl border border-mist bg-white p-10 shadow-[0_20px_60px_-20px_rgba(42,42,46,0.15)]">
          {isStandard ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-accent">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-ink">Payment confirmed</h1>
              <p className="mt-3 text-sm text-slatey">
                You're now a Standard Member. Taking you to your dashboard...
              </p>
              <Loader2 className="h-5 w-5 animate-spin text-slatey mx-auto mt-6" />
            </>
          ) : loading || attempts < 20 ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mist/40">
                <Clock className="h-8 w-8 text-slatey" />
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-ink">Confirming your payment...</h1>
              <p className="mt-3 text-sm leading-relaxed text-slatey">
                We're verifying your payment with Razorpay. This usually takes a few seconds.
                You'll get access automatically once it's confirmed.
              </p>
              <Loader2 className="h-5 w-5 animate-spin text-slatey mx-auto mt-6" />
              <p className="mt-4 text-xs text-slatey/70">
                If this takes longer than a minute, check back in your dashboard shortly.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mist/40">
                <Clock className="h-8 w-8 text-slatey" />
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-ink">Still processing</h1>
              <p className="mt-3 text-sm leading-relaxed text-slatey">
                Your payment is being processed. Once confirmed, you'll have Standard access.
                Try refreshing in a minute, or contact support if it takes too long.
              </p>
              <button
                onClick={() => navigate('/membership')}
                className="mt-6 rounded-full bg-gradient-accent px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02]"
              >
                Back to Membership
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}