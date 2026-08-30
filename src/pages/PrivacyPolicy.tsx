import React from "react";

/**
 * PrivacyPolicy.jsx
 *
 * Fill in the values below with your real details before publishing.
 * Where you see [BRACKETS], replace with your actual info.
 */
const COMPANY_NAME = "Eteral";
const WEBSITE_URL = "https://eteralwork.com";
const CONTACT_EMAIL = "[your-support-email@eteralwork.com]";
const GOVERNING_STATE = "[Your State, e.g. Delaware]"; // US state your business is registered/operating in
const EFFECTIVE_DATE = "[Month Day, Year]"; // e.g. "August 30, 2026"

export default function PrivacyPolicy() {
  return (
    <div className="legal-page" style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.meta}>Effective date: {EFFECTIVE_DATE}</p>

        <p>
          {COMPANY_NAME} ("{COMPANY_NAME}", "we", "us", or "our") operates{" "}
          {WEBSITE_URL} (the "Site") and sells digital products designed to
          help students and creators study smarter, stay organized, and earn
          more (the "Products"). This Privacy Policy explains how we collect,
          use, disclose, and protect your information when you visit the
          Site or purchase a Product.
        </p>
        <p>
          By using the Site, you agree to the collection and use of
          information in accordance with this policy. If you do not agree,
          please do not use the Site.
        </p>

        <h2 style={styles.h2}>1. Information We Collect</h2>

        <h3 style={styles.h3}>a. Information you provide directly</h3>
        <ul>
          <li>Name and email address (e.g. when you contact us, subscribe to our newsletter, or leave a review)</li>
          <li>Any information you include in messages sent to our support email</li>
        </ul>

        <h3 style={styles.h3}>b. Information collected automatically</h3>
        <ul>
          <li>Device and browser type, IP address, general location (city/country level)</li>
          <li>Pages visited, time spent on pages, referring URLs, and clicks (via analytics tools)</li>
          <li>Cookies and similar tracking technologies (see Section 3)</li>
        </ul>

        <h3 style={styles.h3}>c. Payment information</h3>
        <p>
          All purchases on the Site are processed by{" "}
          <strong>Payhip</strong>, our third-party payment and digital
          delivery provider. We do not collect or store your full payment
          card details on our own servers — Payhip handles checkout, payment
          processing, and delivery of digital files. Please review{" "}
          <a
            href="https://payhip.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Payhip's Privacy Policy
          </a>{" "}
          to understand how they handle your data.
        </p>

        <h2 style={styles.h2}>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Deliver the Products you purchase and provide customer support</li>
          <li>Send you order confirmations, updates, and (if you opt in) marketing emails and newsletters</li>
          <li>Understand how visitors use the Site so we can improve it</li>
          <li>Detect, prevent, and address fraud, abuse, or technical issues</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2 style={styles.h2}>3. Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar technologies to operate the Site and
          understand how it's used, including:
        </p>
        <ul>
          <li>
            <strong>Analytics cookies</strong> (e.g. Google Analytics) to
            measure traffic and usage patterns
          </li>
          <li>
            <strong>Marketing cookies</strong> to power our email marketing
            campaigns and measure their effectiveness
          </li>
          <li>
            <strong>Essential cookies</strong> required for basic Site
            functionality
          </li>
        </ul>
        <p>
          You can control or disable cookies through your browser settings.
          Disabling cookies may affect how the Site functions.
        </p>

        <h2 style={styles.h2}>4. Third-Party Services</h2>
        <p>We share limited data with trusted third parties who help us run the Site and our business:</p>
        <ul>
          <li><strong>Payhip</strong> — payment processing and digital product delivery</li>
          <li><strong>Google Analytics</strong> (or similar) — website usage analytics</li>
          <li><strong>Email marketing platform</strong> (e.g. Mailchimp, ConvertKit, etc.) — sending newsletters and promotional emails to subscribers</li>
        </ul>
        <p>
          These providers only receive the information necessary to perform
          their services and are not permitted to use your data for their
          own unrelated purposes.
        </p>
        <p>
          We do <strong>not</strong> sell your personal information to
          third parties.
        </p>

        <h2 style={styles.h2}>5. Data Retention</h2>
        <p>
          We retain personal information for as long as necessary to fulfill
          the purposes described in this policy, comply with legal
          obligations, resolve disputes, and enforce our agreements.
        </p>

        <h2 style={styles.h2}>6. Your Rights and Choices</h2>
        <ul>
          <li>You can unsubscribe from marketing emails at any time using the link in any email we send</li>
          <li>You can request access to, correction of, or deletion of your personal information by emailing us at {CONTACT_EMAIL}</li>
          <li>
            If you are a California resident, you may have additional
            rights under the California Consumer Privacy Act (CCPA),
            including the right to know what personal information we
            collect and to request its deletion
          </li>
          <li>
            If you are located in the European Economic Area (EEA) or UK,
            you may have rights under the GDPR, including access,
            correction, deletion, and data portability
          </li>
        </ul>

        <h2 style={styles.h2}>7. Children's Privacy</h2>
        <p>
          The Site is not directed at children under 13, and we do not
          knowingly collect personal information from children under 13. If
          you believe a child has provided us with personal information,
          please contact us and we will delete it.
        </p>

        <h2 style={styles.h2}>8. Data Security</h2>
        <p>
          We take reasonable technical and organizational measures to
          protect your information. However, no method of transmission or
          storage over the internet is 100% secure, and we cannot guarantee
          absolute security.
        </p>

        <h2 style={styles.h2}>9. International Users</h2>
        <p>
          The Site is operated in the United States. If you access the Site
          from outside the United States, your information may be
          transferred to, stored, and processed in the United States, where
          data protection laws may differ from those in your country.
        </p>

        <h2 style={styles.h2}>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will
          be posted on this page with an updated effective date. Continued
          use of the Site after changes are posted constitutes acceptance
          of the revised policy.
        </p>

        <h2 style={styles.h2}>11. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
        <p style={styles.meta}>
          Governing law: This policy is governed by the laws of{" "}
          {GOVERNING_STATE}, United States, without regard to conflict of
          law principles.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "48px 16px", maxWidth: "100%" },
  container: { maxWidth: 760, margin: "0 auto", lineHeight: 1.7 },
  h1: { fontSize: "2rem", marginBottom: 4 },
  h2: { fontSize: "1.35rem", marginTop: 32, marginBottom: 8 },
  h3: { fontSize: "1.05rem", marginTop: 20, marginBottom: 6 },
  meta: { color: "#666", fontSize: "0.9rem" },
};