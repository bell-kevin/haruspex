// SPDX-License-Identifier: AGPL-3.0-only

export type Outcome = 'yes' | 'no' | 'void'

export interface Prediction {
  id: string
  /** The thing you believe will (or won't) happen, stated so it can be judged true/false. */
  statement: string
  /** Your credence the statement turns out TRUE, as an integer percent, 1–99. */
  p: number
  category: string
  /** ISO datetime the prediction was logged. */
  createdAt: string
  /** ISO date (YYYY-MM-DD) by which the prediction should be judged. */
  resolveBy: string
  /** ISO datetime the prediction was judged, if it has been. */
  resolvedAt?: string
  outcome?: Outcome
  notes?: string
}

export interface WorkoutItem {
  q: string
  answer: number
  unit: string
  low: number
  high: number
  hit: boolean
}

export interface WorkoutRound {
  id: string
  /** ISO datetime the round was completed. */
  at: string
  items: WorkoutItem[]
  hits: number
}

export interface Vault {
  v: 1
  predictions: Prediction[]
  workouts: WorkoutRound[]
}
