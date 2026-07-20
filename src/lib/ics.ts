// SPDX-License-Identifier: AGPL-3.0-only
import type { Prediction } from '../types'

function esc(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Build an RFC 5545 calendar with an all-day event on each open prediction's
 * resolve-by date, plus a morning-of reminder, so judgment day finds you.
 */
export function buildICS(open: Prediction[]): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//haruspex//calibration ledger//EN',
    'CALSCALE:GREGORIAN',
  ]
  for (const p of open) {
    const day = p.resolveBy.replace(/-/g, '')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${p.id}@haruspex`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`,
      `SUMMARY:${esc(`Judge: ${p.statement}`)}`,
      `DESCRIPTION:${esc(
        `You gave this ${p.p}%. Time to find out. Open haruspex and record what happened.`,
      )}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${esc('A prediction awaits judgment')}`,
      'TRIGGER:-PT9H',
      'END:VALARM',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
