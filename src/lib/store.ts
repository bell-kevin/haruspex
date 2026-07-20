// SPDX-License-Identifier: AGPL-3.0-only
import type { Outcome, Prediction, Vault } from '../types'
import { addDaysISO, isoDaysAgo, todayISO } from './util'

const KEY = 'haruspex.v1'

export function uid(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
}

export function loadVault(): Vault {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const v = JSON.parse(raw) as Partial<Vault>
      if (v && v.v === 1 && Array.isArray(v.predictions)) {
        return {
          v: 1,
          predictions: v.predictions,
          workouts: Array.isArray(v.workouts) ? v.workouts : [],
        }
      }
    }
  } catch {
    // fall through to a fresh vault
  }
  return { v: 1, predictions: [], workouts: [] }
}

export function saveVault(vault: Vault): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(vault))
  } catch {
    // storage full or unavailable; the app keeps working in memory
  }
}

/**
 * A believable starter vault: fourteen judged predictions with a realistic
 * spread of confidence and hit-rate, plus four still open. Handy for seeing
 * the Calibration tab do its thing before you have history of your own.
 */
export function sampleVault(): Vault {
  const judged = (
    statement: string,
    category: string,
    p: number,
    outcome: Outcome,
    createdDaysAgo: number,
    resolvedDaysAgo: number,
  ): Prediction => ({
    id: uid(),
    statement,
    p,
    category,
    createdAt: isoDaysAgo(createdDaysAgo),
    resolveBy: addDaysISO(todayISO(), -resolvedDaysAgo),
    resolvedAt: isoDaysAgo(resolvedDaysAgo),
    outcome,
  })

  const open = (
    statement: string,
    category: string,
    p: number,
    dueInDays: number,
  ): Prediction => ({
    id: uid(),
    statement,
    p,
    category,
    createdAt: isoDaysAgo(2),
    resolveBy: addDaysISO(todayISO(), dueInDays),
  })

  return {
    v: 1,
    predictions: [
      open('It snows in the valley before Thanksgiving', 'world', 78, 130),
      open('I ship the next side project this quarter', 'projects', 70, 70),
      open('Inbox zero by Friday', 'work', 45, 5),
      open('The squash bed outproduces last year', 'personal', 60, 80),
      judged('It rains at least once this week', 'world', 72, 'yes', 66, 60),
      judged('I file the quarterly report before the deadline', 'work', 85, 'yes', 64, 55),
      judged('The home team takes the season opener', 'sports', 60, 'no', 62, 52),
      judged('The replacement part arrives within three days', 'personal', 80, 'yes', 58, 54),
      judged('I make it to the gym three times this week', 'health', 65, 'no', 56, 49),
      judged('The pull request lands without major review comments', 'projects', 55, 'yes', 52, 47),
      judged('Gas prices fall before the end of the month', 'money', 40, 'no', 51, 38),
      judged('My flight pushes back from the gate on time', 'personal', 70, 'no', 44, 40),
      judged('The library 3-D printer queue is under an hour', 'personal', 75, 'yes', 42, 41),
      judged('The demo goes off without a hitch', 'work', 62, 'yes', 36, 30),
      judged('I finish a hundred pages over the weekend', 'personal', 58, 'no', 33, 28),
      judged('The farmers market has heirloom tomatoes', 'personal', 88, 'yes', 26, 24),
      judged('The server migration completes without a rollback', 'projects', 90, 'yes', 20, 14),
      judged('I am out of bed before six every day this week', 'health', 35, 'no', 18, 11),
    ],
    workouts: [],
  }
}
