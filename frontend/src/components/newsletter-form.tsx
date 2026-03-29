'use client'

export function NewsletterForm() {
  return (
    <form
      className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Enter your email"
        className="flex-1 px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
      />
      <button
        type="submit"
        className="bg-primary text-white px-5 py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex-shrink-0"
      >
        Notify Me
      </button>
    </form>
  )
}
