import React, { useEffect, useState } from "react";

/**
 * Terms & Conditions page for Eteral (eteralwork.com)
 *
 * Self-contained: no required props, no external font imports.
 * Before publishing: set the dates, the courts location, and check the
 * REFUND_POLICY_URL matches your actual Cancellation & Refund Policy page.
 * If you do NOT run ads, delete the "third-party" mention of ads in section 09.
 */

const EFFECTIVE_DATE = "[Insert date]";
const LAST_UPDATED = "[Insert date]";
const CONTACT_EMAIL = "eteralwork@gmail.com";
const COURTS_LOCATION = "[Insert city, state]";
const REFUND_POLICY_URL = "/cancellation-refund-policy";
const PRIVACY_POLICY_URL = "/privacy-policy";

const SECTIONS = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "service", label: "What we offer" },
  { id: "accounts", label: "Accounts" },
  { id: "purchases", label: "Purchases & payments" },
  { id: "refunds", label: "Delivery & refunds" },
  { id: "membership", label: "Membership" },
  { id: "license", label: "License & acceptable use" },
  { id: "ip", label: "Intellectual property" },
  { id: "third-party", label: "Third-party services" },
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
            Effective date: {EFFECTIVE_DATE} · Last updated: {LAST_UPDATED}
          </p>
          <p style={styles.lede}>
            These Terms & Conditions ("Terms") govern your access to and use of{" "}
            <a href="https://eteralwork.com" style={styles.inlineLink}>
              eteralwork.com
            </a>{" "}
            (the "Site"), operated by Eteral ("Eteral," "we," "us," or "our"). By
            creating an account, buying from us, or otherwise using the Site, you
            agree to these Terms and our{" "}
            <a href={PRIVACY_POLICY_URL} style={styles.inlineLink}>
              Privacy Policy
            </a>
            .
          </p>

          <Section id="acceptance" number="01" title="Acceptance of terms">
            <p style={styles.p}>
              By using the Site you confirm that you are legally able to enter into a
              binding contract and that you accept these Terms. If you are under 18,
              you may use the Site only with the involvement of a parent or guardian.
              If you do not agree, please do not use the Site.
            </p>
          </Section>

          <Section id="service" number="02" title="What we offer">
            <p style={styles.p}>
              Eteral sells small digital notes and study resources aimed at tech
              students and new graduates, and may offer a paid membership in the
              future (see <a href="#membership" style={styles.inlineLink}>Membership</a>
              ). We may add, change, or remove products and features at any time.
              Product descriptions are provided in good faith, but we do not guarantee
              they are free of errors.
            </p>
          </Section>

          <Section id="accounts" number="03" title="Accounts">
            <p style={styles.p}>
              You can create an account with Google sign-in or with an email address
              and password. You are responsible for:
            </p>
            <ul style={styles.ul}>
              <li>Keeping your login details confidential</li>
              <li>All activity that happens under your account</li>
              <li>Giving accurate, current information when you register</li>
            </ul>
            <p style={styles.p}>
              Tell us right away if you think your account has been accessed without
              your permission.
            </p>
          </Section>

          <Section id="purchases" number="04" title="Purchases & payments">
            <p style={styles.p}>
              Prices are shown on the Site in the currency stated at checkout and may
              change at any time, but a change will not affect an order you have
              already completed. Payments are processed by <strong>Razorpay</strong>.
              We never see or store your full card details; Razorpay handles them
              under its own terms and privacy policy. An order is complete once your
              payment succeeds. If a payment fails or is reversed, we may withdraw
              access to the product.
            </p>
          </Section>

          <Section id="refunds" number="05" title="Delivery & refunds">
            <p style={styles.p}>
              Our products are digital. After a successful payment, you get access
              through your account (or by email) right away or within a short time. No
              physical goods are shipped.
            </p>
            <p style={styles.p}>
              Because digital content cannot be returned once accessed, refunds are
              handled under our{" "}
              <a href={REFUND_POLICY_URL} style={styles.inlineLink}>
                Cancellation & Refund Policy
              </a>
              , which forms part of these Terms. If you were charged but did not get
              access, or were charged twice, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={styles.inlineLink}>
                {CONTACT_EMAIL}
              </a>{" "}
              and we will fix it or refund you.
            </p>
          </Section>

          <Section id="membership" number="06" title="Membership">
            <p style={styles.p}>
              We plan to offer a paid membership but have not launched it yet. If we
              do, the price, billing cycle, benefits, and cancellation terms will be
              shown clearly before you subscribe, and we will update these Terms
              before it goes live. Recurring charges will only start with your clear
              consent at checkout, and you will be able to cancel before the next
              billing date.
            </p>
          </Section>

          <Section id="license" number="07" title="License & acceptable use">
            <p style={styles.p}>
              When you buy a note, you receive a limited, personal, non-exclusive,
              non-transferable license to view and use it for your own learning. You
              agree not to:
            </p>
            <ul style={styles.ul}>
              <li>Copy, resell, share, publish, or redistribute our notes or content</li>
              <li>Share your account or purchased access with others</li>
              <li>Use the Site for any unlawful purpose</li>
              <li>Attempt to disrupt, reverse-engineer, scrape, or gain unauthorized access to the Site</li>
              <li>Upload harmful code or interfere with other users</li>
            </ul>
          </Section>

          <Section id="ip" number="08" title="Intellectual property">
            <p style={styles.p}>
              The Site, its notes, text, design, and branding are owned by Eteral or
              its licensors and protected by intellectual property laws. Buying a
              product does not transfer any ownership rights to you.
            </p>
          </Section>

          <Section id="third-party" number="09" title="Third-party services">
            <p style={styles.p}>
              The Site relies on third-party services such as Google (sign-in and
              advertising), Razorpay (payments), and our hosting and database
              providers. These providers have their own terms and policies, and we are
              not responsible for their services. The Site may display ads served by
              Google; we do not control the content of those ads or the websites they
              link to.
            </p>
          </Section>

          <Section id="disclaimers" number="10" title="Disclaimers">
            <p style={styles.p}>
              The Site and our products are provided "as is" and "as available,"
              without warranties of any kind. Our notes are for educational purposes
              only. We do not guarantee that they are complete or error-free, that the
              Site will always be available, or that using them will lead to any
              particular exam, job, or career outcome. Results depend on many factors
              outside our control.
            </p>
          </Section>

          <Section id="liability" number="11" title="Limitation of liability">
            <p style={styles.p}>
              To the fullest extent permitted by law, Eteral is not liable for any
              indirect, incidental, or consequential damages arising from your use of
              the Site or our products. Our total liability for any claim is limited
              to the amount you paid us for the product in question. Nothing in these
              Terms limits any right you have under applicable consumer protection
              law that cannot be excluded.
            </p>
          </Section>

          <Section id="termination" number="12" title="Termination">
            <p style={styles.p}>
              We may suspend or close your account if you break these Terms (for
              example, by sharing or reselling our content). You can stop using the
              Site and ask us to delete your account at any time. Sections that by
              their nature should continue after termination, such as intellectual
              property and limitation of liability, will continue to apply.
            </p>
          </Section>

          <Section id="governing-law" number="13" title="Governing law">
            <p style={styles.p}>
              These Terms are governed by the laws of India. Any dispute will be
              subject to the exclusive jurisdiction of the courts at{" "}
              <Placeholder>{COURTS_LOCATION}</Placeholder>, India. Before starting any
              formal action, we encourage you to contact us so we can try to resolve
              the issue directly.
            </p>
          </Section>

          <Section id="changes" number="14" title="Changes to these terms">
            <p style={styles.p}>
              We may update these Terms from time to time. We will post the new
              version here with an updated "Last updated" date. If you keep using the
              Site after changes take effect, you accept the updated Terms.
            </p>
          </Section>

          <Section id="contact" number="15" title="Contact us">
            <p style={styles.p}>Questions about these Terms? Reach us at:</p>
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
  return <span style={styles.placeholder}>{children}</span>;
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
  placeholder: {
    fontFamily: SANS,
    background: COLORS.accentSoft,
    color: COLORS.accent,
    padding: "0.05rem 0.4rem",
    borderRadius: 3,
    fontSize: "0.92em",
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