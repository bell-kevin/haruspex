// SPDX-License-Identifier: AGPL-3.0-only
import { useEffect, useMemo, useState } from 'react'
import type { Outcome, Vault, WorkoutRound } from './types'
import { loadVault, sampleVault, saveVault, uid } from './lib/store'
import { todayISO } from './lib/util'
import { Analytics } from './components/Analytics'
import { DataPanel } from './components/DataPanel'
import { Ledger, type NewPrediction } from './components/Ledger'
import { Workout } from './components/Workout'

type Tab = 'ledger' | 'calibration' | 'workout' | 'data'

function Sigil() {
  return (
    <svg className="glyph" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="12.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 3.5v25M3.5 16h25" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="21" cy="11" r="2.4" fill="currentColor" />
    </svg>
  )
}

export function App() {
  const [vault, setVault] = useState<Vault>(() => loadVault())
  const [tab, setTab] = useState<Tab>('ledger')

  useEffect(() => {
    saveVault(vault)
  }, [vault])

  const dueCount = useMemo(() => {
    const today = todayISO()
    return vault.predictions.filter((p) => !p.outcome && p.resolveBy <= today).length
  }, [vault.predictions])

  function addPrediction(input: NewPrediction) {
    setVault((v) => ({
      ...v,
      predictions: [
        { id: uid(), createdAt: new Date().toISOString(), ...input },
        ...v.predictions,
      ],
    }))
  }

  function resolvePrediction(id: string, outcome: Outcome) {
    setVault((v) => ({
      ...v,
      predictions: v.predictions.map((p) =>
        p.id === id ? { ...p, outcome, resolvedAt: new Date().toISOString() } : p,
      ),
    }))
  }

  function reopenPrediction(id: string) {
    setVault((v) => ({
      ...v,
      predictions: v.predictions.map((p) => {
        if (p.id !== id) return p
        const { outcome, resolvedAt, ...rest } = p
        return rest
      }),
    }))
  }

  function deletePrediction(id: string) {
    setVault((v) => ({ ...v, predictions: v.predictions.filter((p) => p.id !== id) }))
  }

  function saveRound(round: WorkoutRound) {
    setVault((v) => ({ ...v, workouts: [...v.workouts, round] }))
  }

  function importVault(incoming: Vault) {
    setVault((v) => {
      const preds = new Map(v.predictions.map((p) => [p.id, p]))
      for (const p of incoming.predictions) preds.set(p.id, p)
      const rounds = new Map(v.workouts.map((w) => [w.id, w]))
      for (const w of incoming.workouts) rounds.set(w.id, w)
      return { v: 1, predictions: [...preds.values()], workouts: [...rounds.values()] }
    })
  }

  function wipe() {
    setVault({ v: 1, predictions: [], workouts: [] })
  }

  const tabs: Array<[Tab, string]> = [
    ['ledger', 'Ledger'],
    ['calibration', 'Calibration'],
    ['workout', 'Workout'],
    ['data', 'Data'],
  ]

  return (
    <>
      <header className="masthead">
        <div className="brand">
          <Sigil />
          <div>
            <h1>haruspex</h1>
            <p className="tagline">a calibration ledger</p>
          </div>
        </div>
        <nav className="tabs" aria-label="Sections">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`tab${tab === id ? ' active' : ''}`}
              aria-current={tab === id ? 'page' : undefined}
              onClick={() => setTab(id)}
            >
              {label}
              {id === 'ledger' && dueCount > 0 && (
                <span className="due-dot" title={`${dueCount} awaiting judgment`}>
                  {dueCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>
      <hr className="rule" />

      <main>
        {tab === 'ledger' && (
          <Ledger
            predictions={vault.predictions}
            onAdd={addPrediction}
            onResolve={resolvePrediction}
            onReopen={reopenPrediction}
            onDelete={deletePrediction}
          />
        )}
        {tab === 'calibration' && <Analytics predictions={vault.predictions} />}
        {tab === 'workout' && <Workout rounds={vault.workouts} onSave={saveRound} />}
        {tab === 'data' && (
          <DataPanel
            vault={vault}
            onImport={importVault}
            onSeed={() => importVault(sampleVault())}
            onWipe={wipe}
          />
        )}
      </main>

      <footer>
        Everything stays in this browser — no accounts, no servers, no telemetry.
        {' \u00b7 '}
        <a href="https://github.com/bell-kevin/haruspex">source</a>
        {' \u00b7 '}
        AGPL-3.0
      </footer>
    </>
  )
}
