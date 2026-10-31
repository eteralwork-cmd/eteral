import React, { useEffect, useState } from "react";

/**
 * Cancellation & Refund Policy page for Eteral (eteralwork.com)
 *
 * Self-contained: no required props, no external font imports.
 * Before publishing: set the dates and the response timeframe, and make sure
 * the URLs below match your real page paths.
 */

const EFFECTIVE_DATE = "[Insert date]";
const LAST_UPDATED = "[Insert date]";
const CONTACT_EMAIL = "eteralwork@gmail.com";
const RESPONSE_TIME = "5–7 business days";
const TERMS_URL = "/terms";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "no-refund", label: "No refunds on digital products" },
  { id: "exceptions", label: "When we will refund" },
  { id: "how-to", label: "How to request help" },
  { id: "cancellation", label: "Cancellations" },
  { id: "membership", label: "Membership (coming later)" },
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
            Effective date: {EFFECTIVE_DATE} · Last updated: {LAST_UPDATED}
          </p>
          <p style={styles.lede}>
            This policy explains how cancellations and refunds work for purchases on{" "}
            <a href="https://eteralwork.com" style={styles.inlineLink}>
              eteralwork.com
            </a>
            . It applies alongside our{" "}
            <a href={TERMS_URL} style={styles.inlineLink}>
              Terms & Conditions
            </a>
            .
          </p>

          <Section id="overview" number="01" title="Overview">
            <p style={styles.p}>
              Eteral sells digital notes and study resources. After a successful
              payment, you get access to the product right away through your account
              (or by email). Nothing is shipped, and a digital product cannot be
              returned once it has been delivered, so refunds work differently than
              they do for physical goods.
            </p>
          </Section>

          <Section id="no-refund" number="02" title="No refunds on digital products">
            <p style={styles.p}>
              Because our products are digital and are delivered instantly, all sales
              are final. We do not offer refunds or exchanges for change of mind, for
              example if you:
            </p>
            <ul style={styles.ul}>
              <li>No longer want the product or bought it by mistake</li>
              <li>Did not use it, or did not get around to reading it</li>
              <li>Expected something different from what the description says</li>
              <li>Found the same information elsewhere</li>
            </ul>
            <p style={styles.p}>
              Please read the product description carefully before you buy.
            </p>
          </Section>

          <Section id="exceptions" number="03" title="When we will refund">
            <p style={styles.p}>
              The no-refund rule above does not apply if something went wrong on our
              side or in the payment. We will refund you, or fix the problem, in these
              cases:
            </p>
            <ul style={styles.ul}>
              <li>
                <strong>Duplicate charge:</strong> you were charged more than once for
                the same product. We refund the extra charge in full once verified.
              </li>
              <li>
                <strong>Payment taken but no access:</strong> your payment went
                through but the product was not delivered or your account was not
                updated. We first try to fix it. If we cannot resolve it within a
                reasonable time, we refund you.
              </li>
              <li>
                <strong>Broken or unusable file:</strong> the product you paid for is
                corrupted or cannot be opened. We first try to replace it, and refund
                you if we cannot.
              </li>
            </ul>
            <p style={styles.p}>
              Approved refunds are sent to the original payment method through
              Razorpay. Depending on your bank or payment provider, the amount may
              take a few business days to show in your account after we process it.
            </p>
          </Section>

          <Section id="how-to" number="04" title="How to request help">
            <p style={styles.p}>
              If one of the cases above applies, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={styles.inlineLink}>
                {CONTACT_EMAIL}
              </a>{" "}
              with:
            </p>
            <ul style={styles.ul}>
              <li>The email address on your Eteral account</li>
              <li>The product name</li>
              <li>The date and amount of the payment</li>
              <li>Your Razorpay payment ID, if you have it</li>
              <li>A short description of the problem (a screenshot helps)</li>
            </ul>
            <p style={styles.p}>
              We will review your request and reply within {RESPONSE_TIME}.
            </p>
          </Section>

          <Section id="cancellation" number="05" title="Cancellations">
            <p style={styles.p}>
              Individual note purchases are one-time payments, with no subscription
              and no renewals, so there is nothing to cancel. Once payment is
              complete and the product has been delivered, the order cannot be
              cancelled, subject to the exceptions in section 03.
            </p>
          </Section>

          <Section id="membership" number="06" title="Membership (coming later)">
            <p style={styles.p}>
              We may launch a paid membership in the future. It is not available yet.
              If we do, its cancellation and refund rules will be shown before you
              subscribe and added to this page. You will be able to cancel to stop
              future renewals, and we will clearly state how that affects the current
              billing period.
            </p>
          </Section>

          <Section id="changes" number="07" title="Changes to this policy">
            <p style={styles.p}>
              We may update this policy from time to time. Changes will be posted on
              this page with a new "Last updated" date. The policy that applied when
              you made your purchase continues to apply to that purchase.
            </p>
          </Section>

          <Section id="contact" number="08" title="Contact us">
            <p style={styles.p}>Questions about cancellations or refunds? Reach us at:</p>
            <p style={styles.p}>
              Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={styles.inlineLink}>
                {CONTACT_EMAIL}
              </a>
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

const COLORS = {
  paper: "#FAF9F6",
  ink: "#1B2027",
  inkSoft: "#3F4750",
  accent: "#0F5257",
  accentSoft: "#E4EEEC",
  border: "#DEDAD1",
  tocMuted: "#8B8779",
};

const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif';

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: COLORS.paper,
    color: COLORS.ink,
    minHeight: "100vh",
    fontFamily: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
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
  headerLabel: { fontFamily: SANS, fontSize: "0.85rem", color: COLORS.inkSoft },
  body: {
    maxWidth: 1040,
    margin: "0 auto",
    display: "flex",
    alignItems: "flex-start",
    gap: "3rem",
    padding: "0 1.5rem",
  },
  toc: { width: 220, flexShrink: 0, paddingTop: "3rem" },
  tocSticky: { position: "sticky", top: "5.5rem" },
  tocEyebrow: {
    fontFamily: SANS,
    fontSize: "0.75rem",
    color: COLORS.tocMuted,
    marginBottom: "0.9rem",
  },
  tocList: { listStyle: "none", margin: 0, padding: 0 },
  tocLink: {
    fontFamily: SANS,
    fontSize: "0.85rem",
    textDecoration: "none",
    display: "flex",
    gap: "0.55rem",
    borderLeft: "2px solid transparent",
    paddingLeft: "0.75rem",
    lineHeight: 1.4,
  },
  tocNum: { color: COLORS.tocMuted, fontVariantNumeric: "tabular-nums" },
  main: { flex: 1, maxWidth: 680, padding: "3rem 0 5rem" },
  title: {
    fontSize: "2.4rem",
    fontWeight: 600,
    margin: "0 0 0.6rem",
    letterSpacing: "-0.01em",
  },
  meta: {
    fontFamily: SANS,
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
  section: { marginBottom: "2.75rem" },
  sectionHeading: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.85rem",
    marginBottom: "0.9rem",
  },
  sectionNum: {
    fontFamily: SANS,
    fontSize: "0.85rem",
    color: COLORS.accent,
    fontVariantNumeric: "tabular-nums",
  },
  h2: { fontSize: "1.4rem", fontWeight: 600, margin: 0, letterSpacing: "-0.005em" },
  p: { fontSize: "1.02rem", lineHeight: 1.75, color: COLORS.inkSoft, margin: "0 0 0.9rem" },
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
  footer: {
    fontFamily: SANS,
    fontSize: "0.8rem",
    color: COLORS.tocMuted,
    marginTop: "3rem",
    paddingTop: "1.5rem",
    borderTop: `1px solid ${COLORS.border}`,
  },
};