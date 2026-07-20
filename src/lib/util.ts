// SPDX-License-Identifier: AGPL-3.0-only

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Today's local date as YYYY-MM-DD. */
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Add (or subtract) whole days to a YYYY-MM-DD date. */
export function addDaysISO(iso: string, days: number): string {
  const [y, m, dd] = iso.split('-').map(Number)
  const d = new Date(y, m - 1, dd)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** An ISO datetime `days` days in the past. */
export function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

/** Human-friendly date; the year is shown only when it isn't the current one. */
export function fmtDate(isoDate: string): string {
  const [y, m, dd] = isoDate.split('-').map(Number)
  const d = new Date(y, m - 1, dd)
  const opts: Intl.DateTimeFormatOptions =
    y === new Date().getFullYear()
      ? { month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' }
  return d.toLocaleDateString(undefined, opts)
}

/** Parse a human-typed number: strips commas, spaces, underscores. Null on failure. */
export function parseNum(s: string): number | null {
  const t = s.trim().replace(/[,\s_]/g, '')
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

/** Fisher–Yates, non-mutating. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

/** Trigger a client-side file download. */
export function download(name: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
