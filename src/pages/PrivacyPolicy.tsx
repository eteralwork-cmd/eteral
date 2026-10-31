import React, { useEffect, useState } from "react";

/**
 * Privacy Policy page for Eteral (eteralwork.com)
 *
 * Self-contained: no required props, no external font imports.
 * Before publishing: set the two dates below.
 * If you do NOT run Google AdSense ads, delete the "advertising" section
 * (and its entry in SECTIONS). If you do not use Supabase, remove its row
 * from the providers table.
 */

const EFFECTIVE_DATE = "[Insert date]";
const LAST_UPDATED = "[Insert date]";
const CONTACT_EMAIL = "eteralwork@gmail.com";

const SECTIONS = [
  { id: "collect", label: "Information we collect" },
  { id: "use", label: "How we use it" },
  { id: "share", label: "Who we share it with" },
  { id: "membership", label: "Membership" },
  { id: "cookies", label: "Cookies" },
  { id: "advertising", label: "Advertising" },
  { id: "retention", label: "Data retention" },
  { id: "rights", label: "Your rights" },
  { id: "security", label: "Security" },
  { id: "children", label: "Children's privacy" },
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
            Effective date: {EFFECTIVE_DATE} · Last updated: {LAST_UPDATED}
          </p>
          <p style={styles.lede}>
            Eteral ("Eteral," "we," "us," or "our") operates{" "}
            <a href="https://eteralwork.com" style={styles.inlineLink}>
              eteralwork.com
            </a>{" "}
            (the "Site"), where we sell small digital notes and study resources for
            tech students and new graduates. This policy explains what information we
            collect, how we use it, and the choices you have. We keep data collection
            to the minimum needed to run the Site.
          </p>

          <Section id="collect" number="01" title="Information we collect">
            <h3 style={styles.h3}>Account information</h3>
            <p style={styles.p}>You can create an account in one of two ways:</p>
            <ul style={styles.ul}>
              <li>
                <strong>Sign in with Google</strong> (Google OAuth) — we receive your
                name, email address, and profile picture as made available by Google.
              </li>
              <li>
                <strong>Email and password</strong> — we collect the email address and
                password you choose. Your password is stored in encrypted (hashed)
                form and is never visible to us in plain text.
              </li>
            </ul>

            <h3 style={styles.h3}>Purchase and payment information</h3>
            <p style={styles.p}>
              Payments for notes are processed by <strong>Razorpay</strong>. Your card,
              UPI, or bank details are entered on Razorpay's secure systems and are
              never seen or stored by us. See{" "}
              <a
                href="https://razorpay.com/privacy/"
                style={styles.inlineLink}
                target="_blank"
                rel="noreferrer"
              >
                Razorpay's Privacy Policy
              </a>
              . We keep a record of what you purchased, the amount, the date, and the
              payment status so you can access what you bought and so we can handle
              support or refund requests.
            </p>

            <h3 style={styles.h3}>Collected automatically</h3>
            <p style={styles.p}>
              Like most websites, our servers and hosting providers may log basic
              technical data such as your IP address, browser type, and the pages you
              visit. See <a href="#cookies" style={styles.inlineLink}>Cookies</a> below.
            </p>

            <p style={styles.p}>
              We do not collect anything else about you, and we do not ask for
              sensitive personal information.
            </p>
          </Section>

          <Section id="use" number="02" title="How we use your information">
            <ul style={styles.ul}>
              <li>Create and manage your account and keep you signed in</li>
              <li>Deliver the notes you purchase and let you access them again</li>
              <li>Process payments and handle refunds through Razorpay</li>
              <li>Respond to your emails and support requests</li>
              <li>Send important messages about your account or purchases</li>
              <li>Keep the Site secure and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p style={styles.p}>We do not sell your personal information to anyone.</p>
          </Section>

          <Section id="share" number="03" title="Who we share it with">
            <p style={styles.p}>
              We share information only with the service providers we rely on to run
              the Site:
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
                    <td style={styles.td}>Authentication and database hosting</td>
                    <td style={styles.td}>Account details, purchase records</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>Google</td>
                    <td style={styles.td}>Sign in with Google</td>
                    <td style={styles.td}>Sign-in tokens, basic profile info</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>Razorpay</td>
                    <td style={styles.td}>Payment processing</td>
                    <td style={styles.td}>Payment details, order amount, email</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={styles.p}>
              We may also disclose information if required by law or a valid legal
              request, to protect our rights or users' safety, or in connection with a
              merger, acquisition, or sale of assets, in which case we will notify
              you.
            </p>
          </Section>

          <Section id="membership" number="04" title="Membership">
            <p style={styles.p}>
              We are planning to offer a paid membership in the future. It has not
              launched yet, and we do not currently collect any membership data. If we
              launch it, payments will be handled by Razorpay, we will collect only
              what is needed to run it (such as your subscription status and billing
              history), and we will update this policy before it goes live.
            </p>
          </Section>

          <Section id="cookies" number="05" title="Cookies">
            <p style={styles.p}>
              We use cookies and similar technologies (such as local storage) to keep
              you signed in and remember your session. These are essential for the
              Site to work. You can block or delete cookies in your browser settings,
              but you may not be able to sign in or purchase if you do.
            </p>
          </Section>

          <Section id="advertising" number="06" title="Advertising">
            <p style={styles.p}>
              We may show ads on the Site served by Google AdSense. Google and its
              partners use cookies to serve ads based on your prior visits to this and
              other websites. Google's use of advertising cookies enables it and its
              partners to serve ads to you based on your visit to our Site and/or
              other sites on the internet.
            </p>
            <p style={styles.p}>
              You can opt out of personalised advertising by visiting{" "}
              <a
                href="https://adssettings.google.com"
                style={styles.inlineLink}
                target="_blank"
                rel="noreferrer"
              >
                Google Ads Settings
              </a>
              , or opt out of some third-party vendors' use of cookies at{" "}
              <a
                href="https://www.aboutads.info"
                style={styles.inlineLink}
                target="_blank"
                rel="noreferrer"
              >
                aboutads.info
              </a>
              . You can learn more about how Google uses data at{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                style={styles.inlineLink}
                target="_blank"
                rel="noreferrer"
              >
                policies.google.com/technologies/partner-sites
              </a>
              .
            </p>
          </Section>

          <Section id="retention" number="07" title="Data retention">
            <p style={styles.p}>
              We keep your account and purchase records for as long as your account is
              active or as needed to give you access to your purchases. If you ask us
              to delete your account, we delete or anonymise your personal data within
              a reasonable period, except for records we must keep by law (for
              example, payment and tax records).
            </p>
          </Section>

          <Section id="rights" number="08" title="Your rights">
            <p style={styles.p}>
              Depending on where you live, you may have the right to:
            </p>
            <ul style={styles.ul}>
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Withdraw consent or object to certain processing</li>
            </ul>
            <p style={styles.p}>
              To exercise any of these, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={styles.inlineLink}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section id="security" number="09" title="Security">
            <p style={styles.p}>
              Passwords are stored encrypted, payments are handled by Razorpay's
              secure systems, and we rely on the security of our hosting and
              authentication providers along with our own reasonable safeguards. No
              method of transmission or storage is 100% secure, so we cannot
              guarantee absolute security.
            </p>
          </Section>

          <Section id="children" number="10" title="Children's privacy">
            <p style={styles.p}>
              The Site is not directed at children under 13 (or the minimum age in
              your jurisdiction), and we do not knowingly collect personal information
              from children. If you believe a child has given us information, email
              us and we will delete it.
            </p>
          </Section>

          <Section id="changes" number="11" title="Changes to this policy">
            <p style={styles.p}>
              We may update this policy from time to time. Changes will be posted on
              this page with an updated "Last updated" date.
            </p>
          </Section>

          <Section id="contact" number="12" title="Contact us">
            <p style={styles.p}>Questions about this policy? Reach us at:</p>
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
    <section id={id} className="epp-section" style={styles.section}>
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
  h3: {
    fontFamily: SANS,
    fontSize: "0.95rem",
    fontWeight: 600,
    color: COLORS.inkSoft,
    margin: "1.4rem 0 0.5rem",
  },
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
  tableWrap: {
    overflowX: "auto",
    margin: "1rem 0 1.3rem",
    border: `1px solid ${COLORS.border}`,
  },
  table: { width: "100%", borderCollapse: "collapse", fontFamily: SANS, fontSize: "0.88rem" },
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
    fontFamily: SANS,
    fontSize: "0.8rem",
    color: COLORS.tocMuted,
    marginTop: "3rem",
    paddingTop: "1.5rem",
    borderTop: `1px solid ${COLORS.border}`,
  },
};