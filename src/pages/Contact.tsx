import React from "react";

/**
 * Contact page for Eteral (eteralwork.com)
 *
 * Self-contained: no required props, no external font imports.
 * Styled to match PrivacyPolicy.tsx / TermsAndConditions.tsx / CancellationRefundPolicy.tsx.
 */

const CONTACT_EMAIL = "eteralwork@gmail.com";

export default function Contact() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <a href="https://eteralwork.com" style={styles.wordmark}>
            eteral
          </a>
          <span style={styles.headerLabel}>Contact</span>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.sectionNumWrap}>
          <span style={styles.sectionNum}>Get in touch</span>
        </div>
        <h1 style={styles.title}>Contact us</h1>
        <p style={styles.lede}>
          Questions about membership, billing, or anything else about Eteral —
          we'd love to hear from you. Reach out any time and we'll get back to
          you as soon as we can.
        </p>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Email us at</div>
          <a href={`mailto:${CONTACT_EMAIL}`} style={styles.emailLink}>
            {CONTACT_EMAIL}
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} style={styles.button}>
            Send us an email →
          </a>
        </div>

        <div style={styles.grid}>
          <div style={styles.gridItem}>
            <h3 style={styles.h3}>Membership & billing</h3>
            <p style={styles.p}>
              Questions about your subscription, renewals, or a charge — see
              our{" "}
              <a href="/refund-and-cancellation" style={styles.inlineLink}>
                Cancellation & Refund Policy
              </a>{" "}
              or email us directly.
            </p>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.h3}>Account help</h3>
            <p style={styles.p}>
              Trouble signing in with Google or email, or need to update your
              account details — just send us a note.
            </p>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.h3}>Everything else</h3>
            <p style={styles.p}>
              Feedback, partnership ideas, or anything you're not sure where to
              put — email is the best way to reach us.
            </p>
          </div>
        </div>

        <p style={styles.responseNote}>
          We typically reply within 1–2 business days
        </p>

        <footer style={styles.footer}>Eteral · eteralwork.com</footer>
      </main>
    </div>
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
  main: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "3.5rem 1.5rem 5rem",
  },
  sectionNumWrap: {
    marginBottom: "0.6rem",
  },
  sectionNum: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.85rem",
    color: COLORS.accent,
    letterSpacing: "0.02em",
  },
  title: {
    fontSize: "2.4rem",
    fontWeight: 600,
    margin: "0 0 0.9rem",
    letterSpacing: "-0.01em",
  },
  lede: {
    fontSize: "1.08rem",
    lineHeight: 1.7,
    color: COLORS.inkSoft,
    margin: "0 0 2.5rem",
  },
  card: {
    border: `1px solid ${COLORS.border}`,
    background: COLORS.accentSoft,
    borderRadius: 8,
    padding: "2rem",
    marginBottom: "2.75rem",
    textAlign: "center",
  },
  cardLabel: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.85rem",
    color: COLORS.inkSoft,
    marginBottom: "0.5rem",
  },
  emailLink: {
    display: "block",
    fontSize: "1.5rem",
    fontWeight: 600,
    color: COLORS.ink,
    textDecoration: "none",
    marginBottom: "1.4rem",
    wordBreak: "break-word",
  },
  button: {
    display: "inline-block",
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.92rem",
    fontWeight: 600,
    color: "#FAF9F6",
    background: COLORS.accent,
    padding: "0.65rem 1.4rem",
    borderRadius: 6,
    textDecoration: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1.75rem",
    marginBottom: "2rem",
    paddingTop: "2rem",
    borderTop: `1px solid ${COLORS.border}`,
  },
  gridItem: {},
  h3: {
    fontSize: "1.02rem",
    fontWeight: 600,
    margin: "0 0 0.5rem",
  },
  p: {
    fontSize: "0.95rem",
    lineHeight: 1.65,
    color: COLORS.inkSoft,
    margin: 0,
  },
  inlineLink: {
    color: COLORS.accent,
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  responseNote: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.85rem",
    color: COLORS.tocMuted,
    margin: "0 0 2rem",
  },
  placeholder: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    background: "#EFEAE0",
    color: COLORS.accent,
    padding: "0.05rem 0.4rem",
    borderRadius: 3,
    fontSize: "0.92em",
  },
  footer: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.8rem",
    color: COLORS.tocMuted,
    marginTop: "1rem",
    paddingTop: "1.5rem",
    borderTop: `1px solid ${COLORS.border}`,
  },
};