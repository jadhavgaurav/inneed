import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — INNEED',
  description: 'Terms and conditions for using the INNEED P2P rental marketplace.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using INNEED, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. User Accounts</h2>
          <p>You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. Provide accurate information and keep it updated.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Rental Transactions</h2>
          <p>INNEED is a peer-to-peer marketplace that connects item owners (vendors) with renters. We facilitate the transaction but are not a party to the rental agreement between vendor and renter. Both parties must honor the agreed rental period, pricing, and item condition.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Security Deposits</h2>
          <p>Vendors may require a refundable security deposit. Deposits are held by INNEED and released after the item is returned in satisfactory condition. Deductions may apply for damage or late returns, subject to dispute resolution.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Vendor Responsibilities</h2>
          <p>Vendors must accurately describe items, maintain them in the listed condition, honor confirmed bookings, and comply with all applicable laws. Vendors are responsible for setting fair pricing and maintaining availability calendars.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Renter Responsibilities</h2>
          <p>Renters must return items on time and in the same condition as received (normal wear and tear excepted). Late returns may incur additional charges. Renters are liable for damage or loss during the rental period.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Dispute Resolution</h2>
          <p>If a dispute arises between vendor and renter, either party may file a dispute through the platform. INNEED&apos;s support team will review evidence from both parties and issue a resolution within 7 business days.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">8. Prohibited Activities</h2>
          <p>Users must not list illegal items, use the platform for fraud, create multiple accounts, manipulate reviews, or interfere with the platform&apos;s operation. Violations may result in account suspension or termination.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">9. Limitation of Liability</h2>
          <p>INNEED is not responsible for the quality, safety, or legality of items listed. We do not guarantee that transactions will be completed. Our liability is limited to the platform fees collected for the specific transaction in question.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">10. Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:legal@inneed.in" className="text-primary hover:underline">legal@inneed.in</a>.</p>
        </section>
      </div>
    </div>
  )
}
