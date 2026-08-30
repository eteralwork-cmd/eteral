import React from "react";

/**
 * TermsAndConditions.jsx
 *
 * Fill in the values below with your real details before publishing.
 * Where you see [BRACKETS], replace with your actual info.
 */
const COMPANY_NAME = "Eteral";
const WEBSITE_URL = "https://eteralwork.com";
const CONTACT_EMAIL = "[your-support-email@eteralwork.com]";
const GOVERNING_STATE = "[Your State, e.g. Delaware]";
const EFFECTIVE_DATE = "[Month Day, Year]";

export default function TermsAndConditions() {
  return (
    <div className="legal-page" style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Terms & Conditions</h1>
        <p style={styles.meta}>Effective date: {EFFECTIVE_DATE}</p>

        <p>
          These Terms and Conditions ("Terms") govern your access to and use
          of {WEBSITE_URL} (the "Site") and any digital products, templates,
          or tools sold by {COMPANY_NAME} ("{COMPANY_NAME}", "we", "us", or
          "our") (the "Products"). By accessing the Site or purchasing a
          Product, you agree to these Terms. If you do not agree, do not use
          the Site or purchase our Products.
        </p>

        <h2 style={styles.h2}>1. Who We Are</h2>
        <p>
          {COMPANY_NAME} creates digital products designed to help students
          and creators study smarter, stay organized, and earn more.
        </p>

        <h2 style={styles.h2}>2. Purchases and Payment</h2>
        <ul>
          <li>All purchases are processed through <strong>Payhip</strong>, our third-party checkout and payment provider.</li>
          <li>Prices are listed in the currency shown at checkout and are subject to change without notice.</li>
          <li>By providing payment information, you confirm you are authorized to use the payment method used.</li>
          <li>Upon successful payment, Payhip will provide you with access to download the Product(s) purchased.</li>
        </ul>

        <h2 style={styles.h2}>3. License to Use Digital Products</h2>
        <p>
          When you purchase a Product, we grant you a limited,
          non-exclusive, non-transferable license to use the Product for
          your personal or, where explicitly stated, your business use.
          Unless otherwise stated on the specific product page, you may
          NOT:
        </p>
        <ul>
          <li>Resell, redistribute, share, or sublicense the Product or any part of it</li>
          <li>Upload the Product (or derivatives of it) to any other marketplace, free resource site, or file-sharing platform</li>
          <li>Claim the Product as your own original work</li>
          <li>Use the Product in any way that infringes on {COMPANY_NAME}'s intellectual property rights</li>
        </ul>
        <p>
          All Products remain the intellectual property of {COMPANY_NAME}{" "}
          unless explicitly stated otherwise.
        </p>

        <h2 style={styles.h2}>4. Digital Product / No Refund Policy</h2>
        <p>
          Because our Products are digital and delivered instantly upon
          purchase, <strong>all sales are final and non-refundable</strong>,
          except where required by law or at our sole discretion (e.g. a
          technical issue prevents you from accessing your purchase). If you
          experience a problem with a Product, contact us at{" "}
          {CONTACT_EMAIL} within 7 days of purchase and we'll do our best to
          resolve it.
        </p>

        <h2 style={styles.h2}>5. User Conduct</h2>
        <p>When using the Site, you agree not to:</p>
        <ul>
          <li>Violate any applicable law or regulation</li>
          <li>Attempt to gain unauthorized access to the Site, our systems, or Payhip's systems</li>
          <li>Use the Site to distribute malware, spam, or harmful content</li>
          <li>Infringe on our intellectual property or that of any third party</li>
        </ul>

        <h2 style={styles.h2}>6. Intellectual Property</h2>
        <p>
          All content on the Site, including text, graphics, logos, and the
          Products themselves, is owned by {COMPANY_NAME} or its licensors
          and is protected by copyright and other intellectual property
          laws. Nothing in these Terms grants you any right to use our
          trademarks, logos, or branding without our prior written consent.
        </p>

        <h2 style={styles.h2}>7. Third-Party Services</h2>
        <p>
          The Site relies on third-party services, including Payhip for
          payment processing and delivery, and analytics/email marketing
          providers for site performance and communications. We are not
          responsible for the practices or availability of these
          third-party services, which are governed by their own terms and
          privacy policies.
        </p>

        <h2 style={styles.h2}>8. Disclaimer of Warranties</h2>
        <p>
          The Site and Products are provided "as is" and "as available"
          without warranties of any kind, whether express or implied,
          including but not limited to implied warranties of
          merchantability, fitness for a particular purpose, and
          non-infringement. We do not guarantee that the Products will meet
          your specific needs or expectations, or that the Site will be
          uninterrupted, timely, secure, or error-free.
        </p>

        <h2 style={styles.h2}>9. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, {COMPANY_NAME} shall not
          be liable for any indirect, incidental, special, consequential, or
          punitive damages, or any loss of profits or revenues, arising out
          of or related to your use of the Site or Products. Our total
          liability for any claim arising from these Terms or your use of
          the Site shall not exceed the amount you paid us in the 12 months
          preceding the claim.
        </p>

        <h2 style={styles.h2}>10. Indemnification</h2>
        <p>
          You agree to indemnify and hold {COMPANY_NAME} harmless from any
          claims, damages, liabilities, and expenses (including reasonable
          legal fees) arising out of your use of the Site, your violation of
          these Terms, or your violation of any rights of a third party.
        </p>

        <h2 style={styles.h2}>11. Governing Law</h2>
        <p>
          These Terms are governed by the laws of {GOVERNING_STATE}, United
          States, without regard to its conflict of law principles. Any
          disputes arising from these Terms or your use of the Site will be
          resolved in the courts located in {GOVERNING_STATE}.
        </p>

        <h2 style={styles.h2}>12. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Changes will be
          posted on this page with an updated effective date. Your
          continued use of the Site after changes are posted constitutes
          acceptance of the revised Terms.
        </p>

        <h2 style={styles.h2}>13. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to the
          Site at our discretion, without notice, for conduct that we
          believe violates these Terms or is harmful to other users, us, or
          third parties.
        </p>

        <h2 style={styles.h2}>14. Contact Us</h2>
        <p>
          If you have questions about these Terms, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
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
  meta: { color: "#666", fontSize: "0.9rem" },
};