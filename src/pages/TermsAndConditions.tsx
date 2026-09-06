import React, { useEffect, useState } from "react";

/**
 * Terms & Conditions page for Eteral (eteralwork.com)
 *
 * Self-contained: no required props, no external font imports.
 * Fill in the bracketed placeholders (contact email, dates, jurisdiction)
 * before publishing. Styled to match PrivacyPolicy.tsx.
 */

const SECTIONS = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "service", label: "The service" },
  { id: "accounts", label: "Accounts" },
  { id: "membership", label: "Membership & billing" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "ip", label: "Intellectual property" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of liability" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing law" },
  { id: "changes", label: "Changes to these terms" },
  { id: "contact", label: "Contact us" },
];

export default function TermsAndConditions() {
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
          .etc-toc { display: none; }
          .etc-main { padding-left: 0 !important; max-width: 100% !important; }
        }
        .etc-toc-link { transition: color 0.15s ease, border-color 0.15s ease; }
        .etc-section:target { scroll-margin-top: 2rem; }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <a href="https://eteralwork.com" style={styles.wordmark}>
            eteral
          </a>
          <span style={styles.headerLabel}>Terms & Conditions</span>
        </div>
      </header>

      <div style={styles.body}>
        <nav className="etc-toc" style={styles.toc} aria-label="Table of contents">
          <div style={styles.tocSticky}>
            <div style={styles.tocEyebrow}>On this page</div>
            <ol style={styles.tocList}>
              {SECTIONS.map((s, i) => (
                <li key={s.id} style={{ marginBottom: "0.6rem" }}>
                  <a
                    href={`#${s.id}`}
                    className="etc-toc-link"
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

        <main className="etc-main" style={styles.main}>
          <h1 style={styles.title}>Terms & Conditions</h1>
          <p style={styles.meta}>
            Effective date: <Placeholder>Insert date</Placeholder> · Last updated:{" "}
            <Placeholder>Insert date</Placeholder>
          </p>
          <p style={styles.lede}>
            These Terms & Conditions ("Terms") govern your access to and use of{" "}
            <a href="https://eteralwork.com" style={styles.inlineLink}>
              eteralwork.com
            </a>{" "}
            and its membership services (together, the "Service"), operated by Eteral
            ("Eteral," "we," "us," or "our"). By creating an account or using the
            Service, you agree to these Terms.
          </p>

          <Section id="acceptance" number="01" title="Acceptance of terms">
            <p style={styles.p}>
              By accessing or using the Service, you confirm that you can form a
              binding contract with Eteral, that you accept these Terms, and that you
              agree to comply with them. If you don't agree, please don't use the
              Service.
            </p>
          </Section>

          <Section id="service" number="02" title="The service">
            <p style={styles.p}>
              Eteral provides a career-readiness membership: resources, tools, and
              guidance to help you become career-ready. We may add, change, or remove
              features from the Service at any time, and we don't guarantee that any
              specific feature will remain available.
            </p>
          </Section>

          <Section id="accounts" number="03" title="Accounts">
            <p style={styles.p}>
              You can create an account with Google sign-in or with an email address
              and password. You're responsible for:
            </p>
            <ul style={styles.ul}>
              <li>Keeping your login credentials confidential</li>
              <li>All activity that happens under your account</li>
              <li>Providing accurate, current information when you register</li>
            </ul>
            <p style={styles.p}>
              Let us know right away if you believe your account has been accessed
              without your permission.
            </p>
          </Section>

          <Section id="membership" number="04" title="Membership & billing">
            <h3 style={styles.h3}>Subscriptions</h3>
            <p style={styles.p}>
              Membership is offered on a subscription basis. By subscribing, you
              authorize us to charge your chosen payment method on a recurring basis
              (e.g., monthly or annually) until you cancel.
            </p>

            <h3 style={styles.h3}>Payment processing</h3>
            <p style={styles.p}>
              All payments are handled by <strong>Razorpay</strong>. We don't
              collect or store your full card details — Razorpay processes these
              directly under its own terms and privacy policy.
            </p>

            <h3 style={styles.h3}>Cancellation</h3>
            <p style={styles.p}>
              You can cancel your membership at any time from your account settings.
              Cancellation takes effect at the end of your current billing period, and
              you'll keep access until then.
            </p>

            <h3 style={styles.h3}>Refunds</h3>
            <p style={styles.p}>
              <Placeholder>
                Insert your refund policy — e.g., "Payments are non-refundable except
                where required by law" or a specific refund window
              </Placeholder>
              .
            </p>

            <h3 style={styles.h3}>Price changes</h3>
            <p style={styles.p}>
              We may change membership pricing from time to time. We'll notify active
              members in advance of any change that affects them.
            </p>
          </Section>

          <Section id="acceptable-use" number="05" title="Acceptable use">
            <p style={styles.p}>When using the Service, you agree not to:</p>
            <ul style={styles.ul}>
              <li>Use the Service for any unlawful purpose</li>
              <li>Share your account or membership access with others</li>
              <li>Copy, resell, or redistribute Eteral's content without permission</li>
              <li>Attempt to disrupt, reverse-engineer, or gain unauthorized access to the Service</li>
              <li>Upload harmful code or interfere with other users' use of the Service</li>
            </ul>
          </Section>

          <Section id="ip" number="06" title="Intellectual property">
            <p style={styles.p}>
              The Service, including its content, design, and branding, is owned by
              Eteral and protected by intellectual property laws. Your membership
              gives you a limited, personal, non-transferable license to use the
              Service — it doesn't transfer any ownership rights to you.
            </p>
          </Section>

          <Section id="disclaimers" number="07" title="Disclaimers">
            <p style={styles.p}>
              The Service is provided "as is" and "as available," without warranties
              of any kind. We don't guarantee that the Service will be uninterrupted,
              error-free, or that it will lead to any particular career outcome — the
              tools and guidance we provide support your job search, but the results
              depend on many factors outside our control.
            </p>
          </Section>

          <Section id="liability" number="08" title="Limitation of liability">
            <p style={styles.p}>
              To the fullest extent permitted by law, Eteral won't be liable for any
              indirect, incidental, or consequential damages arising from your use of
              the Service. Our total liability for any claim relating to the Service
              is limited to the amount you paid us in the 12 months before the claim
              arose.
            </p>
          </Section>

          <Section id="termination" number="09" title="Termination">
            <p style={styles.p}>
              We may suspend or terminate your account if you violate these Terms. You
              can stop using the Service and cancel your membership at any time. Terms
              that by their nature should survive termination (like intellectual
              property and limitation of liability) will continue to apply.
            </p>
          </Section>

          <Section id="governing-law" number="10" title="Governing law">
            <p style={styles.p}>
              These Terms are governed by the laws of{" "}
              <Placeholder>insert jurisdiction</Placeholder>, without regard to
              conflict-of-law principles.
            </p>
          </Section>

          <Section id="changes" number="11" title="Changes to these terms">
            <p style={styles.p}>
              We may update these Terms from time to time. We'll post the updated
              version here with a new "Last updated" date. Continuing to use the
              Service after changes take effect means you accept the updated Terms.
            </p>
          </Section>

          <Section id="contact" number="12" title="Contact us">
            <p style={styles.p}>Questions about these Terms? Reach us at:</p>
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
    <section id={id} className="etc-section" style={styles.section}>
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