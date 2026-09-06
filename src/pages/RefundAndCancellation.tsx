import React, { useEffect, useState } from "react";

/**
 * Cancellation & Refund Policy page for Eteral (eteralwork.com)
 *
 * Self-contained: no required props, no external font imports.
 * Fill in the bracketed placeholders (contact email, dates) before publishing.
 * Styled to match PrivacyPolicy.tsx / TermsAndConditions.tsx.
 */

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "no-refund", label: "Digital product & no change-of-mind refunds" },
  { id: "duplicate", label: "Duplicate charges" },
  { id: "technical", label: "Technical errors" },
  { id: "cancellation", label: "Cancelling your membership" },
  { id: "how-to", label: "How to request a refund" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact us" },
];

export default function CancellationRefundPolicy() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 860px) {
          .ecr-toc { display: none; }
          .ecr-main { padding-left: 0 !important; max-width: 100% !important; }
        }
        .ecr-toc-link { transition: color 0.15s ease, border-color 0.15s ease; }
        .ecr-section:target { scroll-margin-top: 2rem; }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <a href="https://eteralwork.com" style={styles.wordmark}>
            eteral
          </a>
          <span style={styles.headerLabel}>Cancellation & Refund Policy</span>
        </div>
      </header>

      <div style={styles.body}>
        <nav className="ecr-toc" style={styles.toc} aria-label="Table of contents">
          <div style={styles.tocSticky}>
            <div style={styles.tocEyebrow}>On this page</div>
            <ol style={styles.tocList}>
              {SECTIONS.map((s, i) => (
                <li key={s.id} style={{ marginBottom: "0.6rem" }}>
                  <a
                    href={`#${s.id}`}
                    className="ecr-toc-link"
                    style={{
                      ...styles.tocLink,
                      color: activeId === s.id ? COLORS.ink : COLORS.tocMuted,
                      borderLeftColor: activeId === s.id ? COLORS.accent : "transparent",
                    }}
                  >
                    <span style={styles.tocNum}>{String(i + 1).padStart(2, "0")}</span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <main className="ecr-main" style={styles.main}>
          <h1 style={styles.title}>Cancellation & Refund Policy</h1>
          <p style={styles.meta}>
            Effective date: <Placeholder>Insert date</Placeholder> · Last updated:{" "}
            <Placeholder>Insert date</Placeholder>
          </p>
          <p style={styles.lede}>
            This policy explains how cancellations and refunds work for Eteral
            membership, and applies alongside our{" "}
            <a href="/terms" style={styles.inlineLink}>
              Terms & Conditions
            </a>
            .
          </p>

          <Section id="overview" number="01" title="Overview">
            <p style={styles.p}>
              Eteral membership is a digital product delivered instantly on
              subscription — there's no physical good, download, or one-time deliverable
              to "return." Because of this, refunds are handled differently than they
              would be for a physical product, as set out below.
            </p>
          </Section>

          <Section
            id="no-refund"
            number="02"
            title="Digital product & no change-of-mind refunds"
          >
            <p style={styles.p}>
              Because membership gives you immediate access to digital content and
              tools, we don't offer refunds for change of mind — for example, if you
              decide you no longer want the membership, didn't get around to using it,
              or expected something different from what's described on the site. We
              encourage you to review what's included before subscribing.
            </p>
          </Section>

          <Section id="duplicate" number="03" title="Duplicate charges">
            <p style={styles.p}>
              If you're charged more than once for the same billing period due to a
              payment error (for example, a duplicate transaction from Razorpay or a
              retried payment), we'll refund the duplicate charge in full once
              verified.
            </p>
          </Section>

          <Section id="technical" number="04" title="Technical errors">
            <p style={styles.p}>
              If a technical error on our end prevents you from accessing the
              membership you paid for (e.g., your account isn't activated, or a
              feature you paid for is broken), we'll first try to fix the issue. If we
              can't resolve it within a reasonable time, we'll refund the affected
              charge.
            </p>
          </Section>

          <Section id="cancellation" number="05" title="Cancelling your membership">
            <p style={styles.p}>
              You can cancel your subscription at any time from your account
              settings. Cancelling stops the next renewal — it doesn't refund the
              current billing period. You'll keep full access to your membership
              until the end of the period you've already paid for, and you won't be
              charged again after that.
            </p>
            <p style={styles.p}>
              Subscription payments are processed through Razorpay. Once a renewal
              payment has gone through, that period is not refundable — cancelling
              only affects future renewals.
            </p>
          </Section>

          <Section id="how-to" number="06" title="How to request a refund">
            <p style={styles.p}>
              For a duplicate charge or a technical error covered above, email us at{" "}
              <Placeholder>insert contact email</Placeholder> with your account email
              and the transaction details (date, amount, and Razorpay payment ID if
              you have it). We'll review and respond within{" "}
              <Placeholder>insert timeframe, e.g. 5–7 business days</Placeholder>.
            </p>
          </Section>

          <Section id="changes" number="07" title="Changes to this policy">
            <p style={styles.p}>
              We may update this policy from time to time. Changes will be posted on
              this page with a new "Last updated" date above.
            </p>
          </Section>

          <Section id="contact" number="08" title="Contact us">
            <p style={styles.p}>Questions about cancellations or refunds? Reach us at:</p>
            <p style={styles.p}>
              Email: <Placeholder>insert contact email</Placeholder>
              <br />
              Website:{" "}
              <a href="https://eteralwork.com" style={styles.inlineLink}>
                eteralwork.com
              </a>
            </p>
          </Section>

          <footer style={styles.footer}>Eteral · eteralwork.com</footer>
        </main>
      </div>
    </div>
  );
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="ecr-section" style={styles.section}>
      <div style={styles.sectionHeading}>
        <span style={styles.sectionNum}>{number}</span>
        <h2 style={styles.h2}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span style={styles.placeholder}>[{children}]</span>;
}

const COLORS = {
  paper: "#FAF9F6",
  ink: "#1B2027",
  inkSoft: "#3F4750",
  accent: "#0F5257",
  accentSoft: "#E4EEEC",
  border: "#DEDAD1",
  tocMuted: "#8B8779",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: COLORS.paper,
    color: COLORS.ink,
    minHeight: "100vh",
    fontFamily:
      '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
  },
  header: {
    borderBottom: `1px solid ${COLORS.border}`,
    position: "sticky",
    top: 0,
    background: "rgba(250, 249, 246, 0.92)",
    backdropFilter: "blur(6px)",
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 1040,
    margin: "0 auto",
    padding: "1.1rem 1.5rem",
    display: "flex",
    alignItems: "baseline",
    gap: "1rem",
  },
  wordmark: {
    fontSize: "1.15rem",
    fontWeight: 600,
    color: COLORS.ink,
    textDecoration: "none",
    letterSpacing: "0.01em",
  },
  headerLabel: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.85rem",
    color: COLORS.inkSoft,
  },
  body: {
    maxWidth: 1040,
    margin: "0 auto",
    display: "flex",
    alignItems: "flex-start",
    gap: "3rem",
    padding: "0 1.5rem",
  },
  toc: {
    width: 220,
    flexShrink: 0,
    paddingTop: "3rem",
  },
  tocSticky: {
    position: "sticky",
    top: "5.5rem",
  },
  tocEyebrow: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.75rem",
    color: COLORS.tocMuted,
    marginBottom: "0.9rem",
  },
  tocList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  tocLink: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.85rem",
    textDecoration: "none",
    display: "flex",
    gap: "0.55rem",
    borderLeft: "2px solid transparent",
    paddingLeft: "0.75rem",
    lineHeight: 1.4,
  },
  tocNum: {
    color: COLORS.tocMuted,
    fontVariantNumeric: "tabular-nums",
  },
  main: {
    flex: 1,
    maxWidth: 680,
    padding: "3rem 0 5rem",
  },
  title: {
    fontSize: "2.4rem",
    fontWeight: 600,
    margin: "0 0 0.6rem",
    letterSpacing: "-0.01em",
  },
  meta: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.85rem",
    color: COLORS.tocMuted,
    margin: "0 0 1.8rem",
  },
  lede: {
    fontSize: "1.08rem",
    lineHeight: 1.7,
    color: COLORS.inkSoft,
    margin: "0 0 3rem",
    paddingBottom: "2.5rem",
    borderBottom: `1px solid ${COLORS.border}`,
  },
  section: {
    marginBottom: "2.75rem",
  },
  sectionHeading: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.85rem",
    marginBottom: "0.9rem",
  },
  sectionNum: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.85rem",
    color: COLORS.accent,
    fontVariantNumeric: "tabular-nums",
  },
  h2: {
    fontSize: "1.4rem",
    fontWeight: 600,
    margin: 0,
    letterSpacing: "-0.005em",
  },
  h3: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.95rem",
    fontWeight: 600,
    color: COLORS.inkSoft,
    margin: "1.4rem 0 0.5rem",
  },
  p: {
    fontSize: "1.02rem",
    lineHeight: 1.75,
    color: COLORS.inkSoft,
    margin: "0 0 0.9rem",
  },
  ul: {
    margin: "0 0 0.9rem",
    paddingLeft: "1.3rem",
    fontSize: "1.02rem",
    lineHeight: 1.75,
    color: COLORS.inkSoft,
  },
  inlineLink: {
    color: COLORS.accent,
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  placeholder: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    background: COLORS.accentSoft,
    color: COLORS.accent,
    padding: "0.05rem 0.4rem",
    borderRadius: 3,
    fontSize: "0.92em",
  },
  footer: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.8rem",
    color: COLORS.tocMuted,
    marginTop: "3rem",
    paddingTop: "1.5rem",
    borderTop: `1px solid ${COLORS.border}`,
  },
};