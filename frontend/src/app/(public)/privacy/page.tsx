import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — INNEED',
  description: 'Learn how INNEED collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
          <p>When you register on INNEED, we collect your name, email address, phone number, and location data to facilitate rental transactions. For vendors, we additionally collect KYC documents, business information, and bank account details for payouts.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
          <p>We use your personal data to provide and improve our rental marketplace services, process transactions, verify vendor identities, communicate important updates, and ensure platform security. We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Payment Security</h2>
          <p>All payment processing is handled through Razorpay, a PCI-DSS compliant payment gateway. INNEED does not store your credit card or bank account numbers on our servers. Security deposits are held securely and released according to our rental terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Sharing</h2>
          <p>We share limited information between renters and vendors to facilitate transactions (e.g., name and contact details for pickup coordination). We may share data with law enforcement when required by law.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Cookies &amp; Analytics</h2>
          <p>We use essential cookies to maintain your session and preferences. Analytics cookies help us understand how users interact with our platform so we can improve the experience.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Your Rights</h2>
          <p>You can request access to, correction of, or deletion of your personal data by contacting us at privacy@inneed.in. Vendors may request data export in a machine-readable format.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Contact Us</h2>
          <p>For privacy-related queries, email us at <a href="mailto:privacy@inneed.in" className="text-primary hover:underline">privacy@inneed.in</a> or write to INNEED Technologies Pvt. Ltd., Bengaluru, India.</p>
        </section>
      </div>
    </div>
  )
}
