// SPDX-License-Identifier: AGPL-3.0-only
import { useRef, useState } from 'react'
import type { Vault } from '../types'
import { buildICS } from '../lib/ics'
import { download, todayISO } from '../lib/util'

function looksLikeVault(x: unknown): x is Vault {
  if (typeof x !== 'object' || x === null) return false
  const v = x as Partial<Vault>
  return (
    v.v === 1 &&
    Array.isArray(v.predictions) &&
    Array.isArray(v.workouts) &&
    v.predictions.every(
      (p) =>
        typeof p === 'object' &&
        p !== null &&
        typeof (p as { id?: unknown }).id === 'string' &&
        typeof (p as { statement?: unknown }).statement === 'string' &&
        typeof (p as { p?: unknown }).p === 'number',
    )
  )
}

export function DataPanel({
  vault,
  onImport,
  onSeed,
  onWipe,
}: {
  vault: Vault
  onImport: (incoming: Vault) => void
  onSeed: () => void
  onWipe: () => void
}) {
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const open = vault.predictions.filter((p) => !p.outcome)
  const judged = vault.predictions.length - open.length

  function exportJSON() {
    download(
      `haruspex-${todayISO()}.json`,
      'application/json',
      JSON.stringify(vault, null, 2),
    )
    setMsg('Vault exported. Keep it somewhere safe.')
  }

  function exportICS() {
    if (open.length === 0) {
      setMsg('No open predictions to put on a calendar.')
      return
    }
    download('haruspex-judgment-days.ics', 'text/calendar', buildICS(open))
    setMsg(`Calendar exported: ${open.length} judgment day${open.length === 1 ? '' : 's'}.`)
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result))
        if (looksLikeVault(parsed)) {
          onImport(parsed)
          setMsg(
            `Imported ${parsed.predictions.length} prediction${
              parsed.predictions.length === 1 ? '' : 's'
            } and ${parsed.workouts.length} workout round${
              parsed.workouts.length === 1 ? '' : 's'
            }. Entries with matching ids were updated.`,
          )
        } else {
          setMsg('That file does not look like a haruspex export.')
        }
      } catch {
        setMsg('Could not read that file as JSON.')
      }
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.readAsText(file)
  }

  function seed() {
    if (
      window.confirm(
        'Load the sample vault? It adds 18 example predictions alongside anything you already have.',
      )
    ) {
      onSeed()
      setMsg('Sample vault loaded. The Calibration tab has a reading for you.')
    }
  }

  function wipe() {
    if (
      window.confirm('Erase every prediction and workout stored in this browser?') &&
      window.confirm('Last chance. This cannot be undone. Erase everything?')
    ) {
      onWipe()
      setMsg('Vault erased.')
    }
  }

  return (
    <section>
      <div className="panel">
        <h2>Your vault</h2>
        <p>
          {open.length} open, {judged} judged, {vault.workouts.length} workout round
          {vault.workouts.length === 1 ? '' : 's'} — all of it stored in this browser&rsquo;s
          localStorage and nowhere else. There is no account, no server, and no telemetry; the
          export button below is the only way data leaves this page, and you press it.
        </p>
        <div className="stack">
          <button className="btn" type="button" onClick={exportJSON}>
            Export vault (JSON)
          </button>
          <label className="btn">
            Import vault&hellip;
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={onFile}
              hidden
            />
          </label>
          <button className="btn" type="button" onClick={exportICS} disabled={open.length === 0}>
            Judgment days to calendar (.ics)
          </button>
        </div>
        <p role="status">{msg}</p>
      </div>

      <div className="panel">
        <h3>Sample vault</h3>
        <p className="hint">
          Eighteen plausible predictions, fourteen already judged — enough for the Calibration tab
          to produce a full reading. Good for kicking the tires or taking screenshots.
        </p>
        <div className="stack">
          <button className="btn" type="button" onClick={seed}>
            Load sample vault
          </button>
        </div>
      </div>

      <div className="panel danger-zone">
        <h3>The pit</h3>
        <p className="hint">Where offerings go to be forgotten. Export first if you care.</p>
        <div className="stack">
          <button className="btn btn-danger" type="button" onClick={wipe}>
            Erase everything
          </button>
        </div>
      </div>
    </section>
  )
}
