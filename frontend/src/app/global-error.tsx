'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ef4444' }}>500</h1>
          <h2 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Something went wrong</h2>
          <p style={{ marginTop: '0.5rem', color: '#6b7280', textAlign: 'center', maxWidth: '28rem' }}>
            A critical error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={reset}
            style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
