import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ — INNEED',
  description: 'Frequently asked questions about renting and listing on INNEED.',
}

const faqs = [
  {
    category: 'For Renters',
    questions: [
      {
        q: 'How do I rent an item?',
        a: 'Browse listings, select rental dates, add to cart, and pay via Razorpay. You\'ll receive a pickup code to collect the item from the vendor.',
      },
      {
        q: 'Is my payment secure?',
        a: 'Yes. All payments are processed through Razorpay, a trusted payment gateway used by millions of businesses in India.',
      },
      {
        q: 'What happens to my security deposit?',
        a: 'Your security deposit is held in escrow. Upon a verified good return, it is automatically refunded to your original payment method within 5-7 business days.',
      },
      {
        q: 'What if the item is damaged or not as described?',
        a: 'You can file a dispute through the app. Our team will review the evidence from both parties and make a fair decision.',
      },
      {
        q: 'Can I extend my rental?',
        a: 'Yes! Request an extension through the app before your rental end date. The vendor will approve or decline based on availability.',
      },
    ],
  },
  {
    category: 'For Vendors',
    questions: [
      {
        q: 'How do I start listing my items?',
        a: 'Complete vendor onboarding (takes ~5 minutes), get approved by our team, then create your listings with photos and pricing.',
      },
      {
        q: 'When do I get paid?',
        a: 'Earnings are credited to your account after each successful rental is closed. You can request payouts from your earnings dashboard.',
      },
      {
        q: 'What is the platform commission?',
        a: 'INNEED charges a 10% commission on each completed rental. This covers payment processing, customer support, and platform maintenance.',
      },
      {
        q: 'Can I set my own prices?',
        a: 'Absolutely. You set your daily, weekly, and monthly rates, plus the security deposit amount.',
      },
      {
        q: 'What if a renter damages my item?',
        a: 'The security deposit covers minor damage. For major damage, file a dispute — our team will review and can award you additional compensation from the deposit.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Can't find your answer? <a href="/contact" className="text-primary hover:underline">Contact us</a></p>
      </div>

      {faqs.map(section => (
        <div key={section.category}>
          <h2 className="text-xl font-bold mb-4 text-primary">{section.category}</h2>
          <div className="space-y-4">
            {section.questions.map(faq => (
              <details key={faq.q} className="group border border-border rounded-xl">
                <summary className="px-4 py-4 font-medium cursor-pointer list-none flex items-center justify-between hover:bg-accent/50 rounded-xl">
                  {faq.q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
