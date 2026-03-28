'use client'

import { useState, FormEvent } from 'react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = data.get('name') as string
    const email = data.get('email') as string
    const subject = data.get('subject') as string
    const message = data.get('message') as string

    if (!name || !email || !subject || !message) {
      toast.error('Please fill in all fields')
      return
    }

    setSending(true)
    // Simulate sending — in production this would hit a real endpoint
    await new Promise(r => setTimeout(r, 1200))
    setSending(false)
    setSent(true)
    toast.success('Message sent! We\'ll get back to you shortly.')
    form.reset()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
        <p className="text-muted-foreground">We&apos;re here to help. Reach out for support, partnerships, or feedback.</p>
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

      {sent ? (
        <div className="text-center border border-green-200 bg-green-50 rounded-2xl p-8">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-lg font-semibold text-green-800 mb-1">Message Sent!</h2>
          <p className="text-sm text-green-700 mb-4">We typically respond within 24 hours on business days.</p>
          <button
            onClick={() => setSent(false)}
            className="text-primary text-sm font-medium hover:underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Send a Message</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="Your name"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Subject</label>
            <select
              name="subject"
              required
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a topic</option>
              <option value="support">Support / Help</option>
              <option value="vendor">Vendor Inquiry</option>
              <option value="issue">Report an Issue</option>
              <option value="partnership">Partnership</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Message</label>
            <textarea
              name="message"
              rows={4}
              required
              minLength={10}
              placeholder="Describe your query..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 w-full disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
          <p className="text-xs text-muted-foreground text-center">We typically respond within 24 hours on business days.</p>
        </form>
      )}
    </div>
  )
}
