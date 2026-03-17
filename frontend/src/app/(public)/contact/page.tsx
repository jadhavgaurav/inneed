import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us — INNEED',
  description: 'Get in touch with the INNEED team for support, vendor inquiries, or feedback.',
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
        <p className="text-muted-foreground">We're here to help. Reach out for support, partnerships, or feedback.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-center">
        {[
          { emoji: '📧', label: 'Email', value: 'support@inneed.in' },
          { emoji: '📞', label: 'Phone', value: '+91 98765 43210' },
          { emoji: '🕐', label: 'Hours', value: 'Mon–Sat, 10am–7pm IST' },
        ].map(c => (
          <div key={c.label} className="border border-border rounded-xl p-4">
            <div className="text-2xl mb-2">{c.emoji}</div>
            <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
            <p className="font-medium text-sm">{c.value}</p>
          </div>
        ))}
      </div>

      <form className="space-y-4 border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Send a Message</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Subject</label>
          <select className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Select a topic</option>
            <option>Support / Help</option>
            <option>Vendor Inquiry</option>
            <option>Report an Issue</option>
            <option>Partnership</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Message</label>
          <textarea
            rows={4}
            placeholder="Describe your query..."
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 w-full"
        >
          Send Message
        </button>
        <p className="text-xs text-muted-foreground text-center">We typically respond within 24 hours on business days.</p>
      </form>
    </div>
  )
}
