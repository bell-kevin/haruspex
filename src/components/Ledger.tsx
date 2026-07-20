// SPDX-License-Identifier: AGPL-3.0-only
import { useMemo, useState } from 'react'
import type { Outcome, Prediction } from '../types'
import { itemBrier } from '../lib/scoring'
import { addDaysISO, fmtDate, todayISO } from '../lib/util'

export interface NewPrediction {
  statement: string
  p: number
  category: string
  resolveBy: string
  notes?: string
}

const PRESET_CATS = ['personal', 'projects', 'work', 'health', 'money', 'sports', 'world']

type Filter = 'all' | 'open' | 'due' | 'resolved'

export function Ledger({
  predictions,
  onAdd,
  onResolve,
  onReopen,
  onDelete,
}: {
  predictions: Prediction[]
  onAdd: (p: NewPrediction) => void
  onResolve: (id: string, outcome: Outcome) => void
  onReopen: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [statement, setStatement] = useState('')
  const [p, setP] = useState(70)
  const [category, setCategory] = useState('')
  const [resolveBy, setResolveBy] = useState(() => addDaysISO(todayISO(), 30))
  const [notes, setNotes] = useState('')
  const [err, setErr] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const today = todayISO()

  const cats = useMemo(() => {
    const seen = new Set(PRESET_CATS)
    for (const pr of predictions) if (pr.category) seen.add(pr.category)
    return [...seen]
  }, [predictions])

  const { open, due, settled } = useMemo(() => {
    const openList = predictions
      .filter((pr) => !pr.outcome)
      .sort((a, b) => a.resolveBy.localeCompare(b.resolveBy))
    const dueList = openList.filter((pr) => pr.resolveBy <= today)
    const settledList = predictions
      .filter((pr) => !!pr.outcome)
      .sort((a, b) => (b.resolvedAt ?? '').localeCompare(a.resolvedAt ?? ''))
    return { open: openList, due: dueList, settled: settledList }
  }, [predictions, today])

  const visible: Prediction[] =
    filter === 'open' ? open : filter === 'due' ? due : filter === 'resolved' ? settled : [...open, ...settled]

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const s = statement.trim()
    if (s.length < 3) {
      setErr('Give the statement a few more words — it has to be judgeable later.')
      return
    }
    if (!resolveBy) {
      setErr('Pick a date to judge it by.')
      return
    }
    onAdd({
      statement: s,
      p,
      category: category.trim().toLowerCase() || 'personal',
      resolveBy,
      notes: notes.trim() || undefined,
    })
    setStatement('')
    setNotes('')
    setErr('')
  }

  return (
    <section>
      <form className="panel" onSubmit={submit}>
        <h2>Log a prediction</h2>
        <p className="hint">
          State something the future can prove right or wrong, put a number on your belief, and set
          the day of judgment.
        </p>

        <label className="field" htmlFor="statement">
          Statement
        </label>
        <input
          id="statement"
          type="text"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="e.g. The go/no-go review passes on the first try"
          maxLength={200}
        />

        <label className="field" htmlFor="prob">
          Chance it comes true
        </label>
        <div className="prob-row">
          <input
            id="prob"
            type="range"
            min={1}
            max={99}
            step={1}
            value={p}
            onChange={(e) => setP(Number(e.target.value))}
          />
          <output className="prob-read" htmlFor="prob">
            {p}%
          </output>
        </div>
        <p className="hint">
          {p === 50
            ? '50% means you genuinely can\u2019t call it.'
            : p < 50
              ? `You\u2019re saying it probably won\u2019t happen \u2014 ${100 - p}% that it doesn\u2019t.`
              : 'Your honest credence, not your hope.'}
        </p>

        <div className="form-grid">
          <div>
            <label className="field" htmlFor="cat">
              Category
            </label>
            <input
              id="cat"
              type="text"
              list="cat-options"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="personal"
              maxLength={24}
            />
            <datalist id="cat-options">
              {cats.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="field" htmlFor="due">
              Judge by
            </label>
            <input
              id="due"
              type="date"
              value={resolveBy}
              onChange={(e) => setResolveBy(e.target.value)}
            />
          </div>
        </div>

        <label className="field" htmlFor="notes">
          Notes <span className="optional">(optional — what would change your mind?)</span>
        </label>
        <textarea
          id="notes"
          rows={1}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={400}
        />

        {err && <p className="err">{err}</p>}
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">
            Log it
          </button>
        </div>
      </form>

      <div className="filters" role="group" aria-label="Filter predictions">
        {(
          [
            ['all', `All \u00b7 ${predictions.length}`],
            ['open', `Open \u00b7 ${open.length}`],
            ['due', `Awaiting judgment \u00b7 ${due.length}`],
            ['resolved', `Judged \u00b7 ${settled.length}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`filter${filter === id ? ' active' : ''}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="empty">
          {predictions.length === 0
            ? 'Your ledger is empty. Every haruspex needs an offering: write down something you believe will happen, attach a probability, and set a date to judge it. (Or load the sample vault under Data to see the omens straight away.)'
            : 'Nothing here under this filter.'}
        </p>
      ) : (
        visible.map((pr) => (
          <Card
            key={pr.id}
            pr={pr}
            today={today}
            onResolve={onResolve}
            onReopen={onReopen}
            onDelete={onDelete}
          />
        ))
      )}
    </section>
  )
}

function Card({
  pr,
  today,
  onResolve,
  onReopen,
  onDelete,
}: {
  pr: Prediction
  today: string
  onResolve: (id: string, outcome: Outcome) => void
  onReopen: (id: string) => void
  onDelete: (id: string) => void
}) {
  const isOpen = !pr.outcome
  const isDue = isOpen && pr.resolveBy <= today
  const overdue = isOpen && pr.resolveBy < today
  const b = itemBrier(pr)

  return (
    <article className={`card${isDue ? ' due' : ''}${!isOpen ? ' settled' : ''}`}>
      <div className="card-main">
        <p className="statement">{pr.statement}</p>
        <p className="meta">
          <span className="pill pill-p">{pr.p}%</span>
          <span className="chip">{pr.category}</span>
          <span>logged {fmtDate(pr.createdAt.slice(0, 10))}</span>
          {isOpen ? (
            <span className={isDue ? 'due-text' : undefined}>
              {overdue
                ? `judgment overdue \u2014 was due ${fmtDate(pr.resolveBy)}`
                : isDue
                  ? 'judgment due today'
                  : `judge by ${fmtDate(pr.resolveBy)}`}
            </span>
          ) : (
            <>
              <span className={`pill pill-${pr.outcome}`}>
                {pr.outcome === 'yes' ? 'came true' : pr.outcome === 'no' ? 'didn\u2019t' : 'void'}
              </span>
              {b !== null && <span className="brier-note">Brier {b.toFixed(3)}</span>}
            </>
          )}
        </p>
        {pr.notes && <p className="notes">{pr.notes}</p>}
      </div>
      <div className="card-actions">
        {isOpen ? (
          <>
            <button
              type="button"
              className="btn btn-sm btn-yes"
              onClick={() => onResolve(pr.id, 'yes')}
              title="It happened"
            >
              Came true
            </button>
            <button
              type="button"
              className="btn btn-sm btn-no"
              onClick={() => onResolve(pr.id, 'no')}
              title="It didn't happen"
            >
              Didn&rsquo;t
            </button>
            <button
              type="button"
              className="btn btn-sm btn-void"
              onClick={() => onResolve(pr.id, 'void')}
              title="Can't be judged fairly — excluded from scoring"
            >
              Void
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => onReopen(pr.id)}>
            Reopen
          </button>
        )}
        <button
          type="button"
          className="btn btn-sm btn-ghost btn-danger"
          aria-label="Delete prediction"
          onClick={() => {
            if (window.confirm('Delete this prediction for good?')) onDelete(pr.id)
          }}
        >
          &times;
        </button>
      </div>
    </article>
  )
}
