'use client'

import { cn } from '@/lib/utils'

const checks = [
  (p: string) => p.length >= 8,
  (p: string) => /[A-Z]/.test(p),
  (p: string) => /[0-9]/.test(p),
  (p: string) => /[^A-Za-z0-9]/.test(p),
]

const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const
const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
const textColors = ['', 'text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600']

export function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null

  const score = checks.reduce((s, check) => s + (check(password) ? 1 : 0), 0)

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              i < score ? colors[score] : 'bg-muted'
            )}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={cn('text-xs font-medium', textColors[score])}>
          {labels[score]}
        </p>
      )}
    </div>
  )
}
