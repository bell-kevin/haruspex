// SPDX-License-Identifier: AGPL-3.0-only
import type { Prediction } from '../types'

export interface Bin {
  lo: number
  hi: number
  n: number
  /** Mean stated confidence of the bin's members (folded, 50–100). */
  conf: number
  /** Percent of the bin's members that were directionally correct, 0–100. */
  acc: number
}

/** Predictions that have been judged true or false (voids excluded). */
export function resolved(ps: Prediction[]): Prediction[] {
  return ps.filter((p) => p.outcome === 'yes' || p.outcome === 'no')
}

/**
 * Mean Brier score across judged predictions.
 * 0 is a prophet, 0.25 is a coin flip, 1 is a perfect anti-prophet.
 */
export function brier(ps: Prediction[]): number | null {
  const r = resolved(ps)
  if (r.length === 0) return null
  const sum = r.reduce((acc, p) => {
    const o = p.outcome === 'yes' ? 1 : 0
    const f = p.p / 100
    return acc + (f - o) ** 2
  }, 0)
  return sum / r.length
}

/** Brier contribution of a single judged prediction. */
export function itemBrier(p: Prediction): number | null {
  if (p.outcome !== 'yes' && p.outcome !== 'no') return null
  const o = p.outcome === 'yes' ? 1 : 0
  return (p.p / 100 - o) ** 2
}

/**
 * Fold a prediction so confidence always reads 50–100: a 30% "yes" is a
 * 70% "no". Returns the folded confidence and whether the call was right.
 */
export function fold(p: Prediction): { conf: number; correct: boolean } {
  const conf = p.p >= 50 ? p.p : 100 - p.p
  const correct = (p.p >= 50) === (p.outcome === 'yes')
  return { conf, correct }
}

/** Fraction of judged predictions that were directionally correct, 0–1. */
export function accuracy(ps: Prediction[]): number | null {
  const r = resolved(ps)
  if (r.length === 0) return null
  return r.filter((p) => fold(p).correct).length / r.length
}

/** Mean folded confidence across judged predictions, 0–1. */
export function meanConfidence(ps: Prediction[]): number | null {
  const r = resolved(ps)
  if (r.length === 0) return null
  return r.reduce((acc, p) => acc + fold(p).conf, 0) / r.length / 100
}

/** Bucket judged predictions into 50s/60s/70s/80s/90s confidence bins. */
export function calibrationBins(ps: Prediction[]): Bin[] {
  const r = resolved(ps)
  const edges = [50, 60, 70, 80, 90, 100]
  return edges.slice(0, -1).map((lo, i) => {
    const hi = edges[i + 1]
    const members = r.filter((p) => {
      const c = fold(p).conf
      return c >= lo && c < hi
    })
    const n = members.length
    return {
      lo,
      hi,
      n,
      conf: n ? members.reduce((a, p) => a + fold(p).conf, 0) / n : (lo + hi) / 2,
      acc: n ? (100 * members.filter((p) => fold(p).correct).length) / n : 0,
    }
  })
}

/** Rolling-window Brier over judged predictions, in resolution order. */
export function rollingBrier(ps: Prediction[], window = 10): number[] {
  const r = [...resolved(ps)].sort((a, b) =>
    (a.resolvedAt ?? '').localeCompare(b.resolvedAt ?? ''),
  )
  const out: number[] = []
  for (let i = 0; i < r.length; i++) {
    const slice = r.slice(Math.max(0, i - window + 1), i + 1)
    const b = brier(slice)
    if (b !== null) out.push(b)
  }
  return out
}

export interface CategoryRow {
  cat: string
  n: number
  acc: number
  brier: number
}

/** Per-category counts, accuracy, and Brier, most-populated first. */
export function byCategory(ps: Prediction[]): CategoryRow[] {
  const r = resolved(ps)
  const m = new Map<string, Prediction[]>()
  for (const p of r) {
    const k = p.category || 'uncategorized'
    m.set(k, [...(m.get(k) ?? []), p])
  }
  return [...m.entries()]
    .map(([cat, list]) => ({
      cat,
      n: list.length,
      acc: accuracy(list) ?? 0,
      brier: brier(list) ?? 0,
    }))
    .sort((a, b) => b.n - a.n)
}
