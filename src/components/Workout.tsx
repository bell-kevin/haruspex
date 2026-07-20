// SPDX-License-Identifier: AGPL-3.0-only
import { useState } from 'react'
import type { WorkoutItem, WorkoutRound } from '../types'
import { QUESTIONS, type Question } from '../lib/questions'
import { uid } from '../lib/store'
import { parseNum, shuffle } from '../lib/util'
import { TrendLine } from './charts'

const ROUND_SIZE = 10

type Phase = 'idle' | 'ask' | 'reveal' | 'done'

function verdict(hits: number, total: number): string {
  const rate = hits / total
  if (rate >= 1)
    return 'A clean sweep. Either your knowledge is sharp or your intervals are generous \u2014 at 90%, missing about one in ten is the expected shape.'
  if (rate >= 0.9) return 'Right on target. Your 90% actually behaves like 90%.'
  if (rate >= 0.8) return 'Close. A touch overconfident \u2014 nudge those intervals wider.'
  if (rate >= 0.6)
    return 'Your intervals are too narrow: classic overconfidence. Widen them until it feels uncomfortable \u2014 that discomfort is the point.'
  return 'The entrails are unambiguous: heavy overconfidence. A 90% interval should be embarrassingly wide on things you barely know.'
}

export function Workout({
  rounds,
  onSave,
}: {
  rounds: WorkoutRound[]
  onSave: (round: WorkoutRound) => void
}) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [queue, setQueue] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [items, setItems] = useState<WorkoutItem[]>([])
  const [low, setLow] = useState('')
  const [high, setHigh] = useState('')
  const [err, setErr] = useState('')

  function start() {
    setQueue(shuffle(QUESTIONS).slice(0, ROUND_SIZE))
    setIdx(0)
    setItems([])
    setLow('')
    setHigh('')
    setErr('')
    setPhase('ask')
  }

  function lock(e: React.FormEvent) {
    e.preventDefault()
    const lo = parseNum(low)
    const hi = parseNum(high)
    if (lo === null || hi === null) {
      setErr('Both bounds need to be numbers.')
      return
    }
    if (lo >= hi) {
      setErr('The low bound has to sit below the high bound.')
      return
    }
    const q = queue[idx]
    setItems((prev) => [
      ...prev,
      { q: q.q, answer: q.a, unit: q.unit, low: lo, high: hi, hit: q.a >= lo && q.a <= hi },
    ])
    setErr('')
    setPhase('reveal')
  }

  function next() {
    if (idx + 1 < queue.length) {
      setIdx(idx + 1)
      setLow('')
      setHigh('')
      setPhase('ask')
    } else {
      const hits = items.filter((i) => i.hit).length
      onSave({ id: uid(), at: new Date().toISOString(), items, hits })
      setPhase('done')
    }
  }

  if (phase === 'ask' || phase === 'reveal') {
    const q = queue[idx]
    const last = items[items.length - 1]
    return (
      <section>
        <div className="panel">
          <p className="progress">
            Question {idx + 1} of {queue.length} &middot; {q.cat}
          </p>
          <p className="question">{q.q}</p>
          {phase === 'ask' ? (
            <form onSubmit={lock}>
              <p className="hint">
                Give a range you&rsquo;re <strong>90% sure</strong> contains the answer
                {q.unit ? ` (${q.unit})` : ''}. Wide is honest; narrow is bravado.
              </p>
              <div className="range-inputs">
                <div>
                  <label className="field" htmlFor="lo">
                    At least
                  </label>
                  <input
                    id="lo"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={low}
                    onChange={(e) => setLow(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="field" htmlFor="hi">
                    At most
                  </label>
                  <input
                    id="hi"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={high}
                    onChange={(e) => setHigh(e.target.value)}
                  />
                </div>
              </div>
              {err && <p className="err">{err}</p>}
              <div className="form-actions">
                <button className="btn btn-primary" type="submit">
                  Lock it in
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p className={`reveal ${last.hit ? 'hit' : 'miss'}`}>
                {last.hit ? '\u2713 Captured.' : '\u2717 Missed.'} The answer is{' '}
                <strong>
                  {last.answer.toLocaleString()}
                  {last.unit ? ` ${last.unit}` : ''}
                </strong>
                ; you said {last.low.toLocaleString()} to {last.high.toLocaleString()}.
              </p>
              <div className="form-actions">
                <button className="btn btn-primary" type="button" onClick={next} autoFocus>
                  {idx + 1 < queue.length ? 'Next question' : 'See the reading'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  if (phase === 'done') {
    const hits = items.filter((i) => i.hit).length
    return (
      <section>
        <div className="panel">
          <h2>Round complete</h2>
          <p className="bigscore">
            {hits}/{items.length}
          </p>
          <p className="verdict">{verdict(hits, items.length)}</p>
          <ul className="qa-list">
            {items.map((i, k) => (
              <li key={k}>
                <span className={i.hit ? 'hit' : 'miss'}>{i.hit ? '\u2713' : '\u2717'}</span>
                <span className="qa-q">{i.q}</span>
                <span className="qa-a">
                  {i.answer.toLocaleString()}
                  {i.unit ? ` ${i.unit}` : ''}
                </span>
              </li>
            ))}
          </ul>
          <div className="form-actions">
            <button className="btn btn-primary" type="button" onClick={start}>
              Go again
            </button>
            <button className="btn" type="button" onClick={() => setPhase('idle')}>
              Done for now
            </button>
          </div>
        </div>
      </section>
    )
  }

  // idle
  const allItems = rounds.flatMap((r) => r.items)
  const overall = allItems.length
    ? Math.round((100 * allItems.filter((i) => i.hit).length) / allItems.length)
    : null
  const recent = [...rounds].slice(-6).reverse()

  return (
    <section>
      <div className="panel">
        <h2>Interval training</h2>
        <p>
          Ten questions with numeric answers. For each, give a range you&rsquo;re 90% sure contains
          the truth. If you&rsquo;re well calibrated you&rsquo;ll capture about nine of ten — most
          people capture far fewer, because most people&rsquo;s &ldquo;90% sure&rdquo; is closer to
          a wish. This drill trains the same muscle the Ledger measures.
        </p>
        <div className="form-actions">
          <button className="btn btn-primary" type="button" onClick={start}>
            Deal ten questions
          </button>
        </div>
      </div>

      {rounds.length > 0 && (
        <div className="chart-grid">
          <div className="panel">
            <h3>Capture rate by round</h3>
            <TrendLine
              values={rounds.map((r) => (100 * r.hits) / r.items.length)}
              yMax={100}
              refY={90}
              refLabel="target 90%"
              refColor="#79a98f"
              fmt={(n) => `${Math.round(n)}%`}
              ariaLabel="Capture rate across workout rounds"
            />
          </div>
          <div className="panel">
            <h3>Standing</h3>
            <p>
              <strong>{rounds.length}</strong> round{rounds.length === 1 ? '' : 's'} &middot;{' '}
              <strong>{allItems.length}</strong> intervals &middot; overall capture{' '}
              <strong>{overall}%</strong>
            </p>
            {overall !== null && <p className="hint">{verdict(overall, 100)}</p>}
            <ul className="qa-list">
              {recent.map((r) => (
                <li key={r.id}>
                  <span className="qa-q">{new Date(r.at).toLocaleDateString()}</span>
                  <span className="qa-a">
                    {r.hits}/{r.items.length}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
