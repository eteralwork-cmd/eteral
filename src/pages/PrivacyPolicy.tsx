import React, { useEffect, useState } from "react";

/**
 * Privacy Policy page for Eteral (eteralwork.com)
 *
 * Self-contained: no required props, no external font imports.
 * Fill in the bracketed placeholders (contact email, dates) before publishing.
 */

const SECTIONS = [
  { id: "collect", label: "Information we collect" },
  { id: "use", label: "How we use it" },
  { id: "share", label: "How we share it" },
  { id: "retention", label: "Data retention" },
  { id: "cookies", label: "Cookies" },
  { id: "rights", label: "Your rights" },
  { id: "security", label: "Security" },
  { id: "children", label: "Children's privacy" },
  { id: "international", label: "International users" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact us" },
];

export default function PrivacyPolicy() {
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
          .epp-toc { display: none; }
          .epp-main { padding-left: 0 !important; max-width: 100% !important; }
        }
        .epp-toc-link { transition: color 0.15s ease, border-color 0.15s ease; }
        .epp-section:target { scroll-margin-top: 2rem; }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <a href="https://eteralwork.com" style={styles.wordmark}>
            eteral
          </a>
          <span style={styles.headerLabel}>Privacy Policy</span>
        </div>
      </header>

      <div style={styles.body}>
        <nav className="epp-toc" style={styles.toc} aria-label="Table of contents">
          <div style={styles.tocSticky}>
            <div style={styles.tocEyebrow}>On this page</div>
            <ol style={styles.tocList}>
              {SECTIONS.map((s, i) => (
                <li key={s.id} style={{ marginBottom: "0.6rem" }}>
                  <a
                    href={`#${s.id}`}
                    className="epp-toc-link"
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

        <main className="epp-main" style={styles.main}>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.meta}>
            Effective date: <Placeholder>Insert date</Placeholder> · Last updated:{" "}
            <Placeholder>Insert date</Placeholder>
          </p>
          <p style={styles.lede}>
            Eteral ("Eteral," "we," "us," or "our") operates{" "}
            <a href="https://eteralwork.com" style={styles.inlineLink}>
              eteralwork.com
            </a>{" "}
            and its membership services (together, the "Service"). This policy explains
            what information we collect, how we use it, and the choices you have.
          </p>

          <Section id="collect" number="01" title="Information we collect">
            <h3 style={styles.h3}>Information you provide directly</h3>
            <p style={styles.p}>You can create an account in one of two ways:</p>
            <ul style={styles.ul}>
              <li>
                <strong>With Google</strong> (via Google OAuth) — we receive your name,
                email address, and profile image as made available by Google.
              </li>
              <li>
                <strong>With email and password</strong> — we collect the email and
                password you provide. Your password is stored encrypted and is never
                visible to us in plain text.
              </li>
            </ul>

            <h3 style={styles.h3}>Payment information</h3>
            <p style={styles.p}>
              Membership payments are processed by <strong>Razorpay</strong>. We
              never see or store your full card number or CVV — those go directly to
              Razorpay's secure systems, governed by{" "}
              <a
                href="https://razorpay.com/privacy/"
                style={styles.inlineLink}
                target="_blank"
                rel="noreferrer"
              >
                Razorpay's Privacy Policy
              </a>
              . We receive limited information back, such as your subscription status
              and billing history, to manage your membership.
            </p>

            <h3 style={styles.h3}>Collected automatically</h3>
            <p style={styles.p}>
              Log data (IP address, browser type, device information, pages visited)
              and cookies — see <a href="#cookies" style={styles.inlineLink}>Cookies</a>{" "}
              below.
            </p>

            <h3 style={styles.h3}>Content you provide</h3>
            <p style={styles.p}>
              Anything you add to your profile or membership account — career goals,
              saved resources, progress within the program.
            </p>
          </Section>

          <Section id="use" number="02" title="How we use your information">
            <ul style={styles.ul}>
              <li>Create and manage your account</li>
              <li>Provide and operate the membership Service</li>
              <li>Process payments and manage subscriptions through Razorpay</li>
              <li>Communicate with you about your account or the Service</li>
              <li>Improve, personalize, and secure the Service</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p style={styles.p}>We do not sell your personal information to anyone.</p>
          </Section>

          <Section id="share" number="03" title="How we share your information">
            <p style={styles.p}>
              We share information only with the providers we rely on to run the
              Service:
            </p>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Provider</th>
                    <th style={styles.th}>Purpose</th>
                    <th style={styles.th}>What they receive</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={styles.td}>Supabase</td>
                    <td style={styles.td}>Authentication & database hosting</td>
                    <td style={styles.td}>Account credentials, profile data</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>Google</td>
                    <td style={styles.td}>Sign-in with Google</td>
                    <td style={styles.td}>Auth tokens, basic profile info</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>Razorpay</td>
                    <td style={styles.td}>Membership payment processing</td>
                    <td style={styles.td}>Billing details, payment method</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={styles.p}>
              We may also disclose information if required by law, to protect our
              rights, or in connection with a merger, acquisition, or sale of assets —
              in which case you'll be notified.
            </p>
          </Section>

          <Section id="retention" number="04" title="Data retention">
            <p style={styles.p}>
              We keep your information for as long as your account is active or as
              needed to provide the Service. If you delete your account, we delete or
              anonymize your personal data within a reasonable period, except where the
              law requires us to keep it longer.
            </p>
          </Section>

          <Section id="cookies" number="05" title="Cookies">
            <p style={styles.p}>
              We use cookies to keep you signed in, remember preferences, and
              understand how the Site is used. You can control cookies in your browser
              settings — disabling them may affect how the Service works.
            </p>
          </Section>

          <Section id="rights" number="06" title="Your rights">
            <p style={styles.p}>Depending on where you live, you may have the right to:</p>
            <ul style={styles.ul}>
              <li>Access the personal information we hold about you</li>
              <li>Request correction or deletion of your personal information</li>
              <li>Withdraw consent or object to certain processing</li>
              <li>Request a copy of your data in a portable format</li>
            </ul>
            <p style={styles.p}>
              To exercise any of these, contact us at{" "}
              <Placeholder>insert contact email</Placeholder>.
            </p>
          </Section>

          <Section id="security" number="07" title="Security">
            <p style={styles.p}>
              We rely on the security measures built into Supabase and Razorpay, plus our
              own reasonable safeguards, to protect your information. No method of
              transmission or storage is 100% secure, and we can't guarantee absolute
              security.
            </p>
          </Section>

          <Section id="children" number="08" title="Children's privacy">
            <p style={styles.p}>
              The Service isn't directed at children under 13 (or the minimum age in
              your jurisdiction), and we don't knowingly collect personal information
              from children.
            </p>
          </Section>

          <Section id="international" number="09" title="International users">
            <p style={styles.p}>
              Your information may be processed and stored in countries other than your
              own. By using the Service, you consent to this transfer.
            </p>
          </Section>

          <Section id="changes" number="10" title="Changes to this policy">
            <p style={styles.p}>
              We may update this policy from time to time. Changes will be posted on
              this page with an updated "Last updated" date above.
            </p>
          </Section>

          <Section id="contact" number="11" title="Contact us">
            <p style={styles.p}>Questions about this policy? Reach us at:</p>
            <p style={styles.p}>
              Email: <Placeholder>eteralwork@gmail.com</Placeholder>
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
    <section id={id} className="epp-section" style={styles.section}>
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
  tableWrap: {
    overflowX: "auto",
    margin: "1rem 0 1.3rem",
    border: `1px solid ${COLORS.border}`,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "0.88rem",
  },
  th: {
    textAlign: "left",
    padding: "0.6rem 0.9rem",
    background: COLORS.accentSoft,
    color: COLORS.ink,
    fontWeight: 600,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  td: {
    padding: "0.6rem 0.9rem",
    borderBottom: `1px solid ${COLORS.border}`,
    color: COLORS.inkSoft,
    verticalAlign: "top",
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