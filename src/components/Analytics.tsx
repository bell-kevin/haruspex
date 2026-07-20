// SPDX-License-Identifier: AGPL-3.0-only
import { useMemo } from 'react'
import type { Prediction } from '../types'
import {
  accuracy,
  brier,
  byCategory,
  calibrationBins,
  meanConfidence,
  resolved,
  rollingBrier,
} from '../lib/scoring'
import { ConfHistogram, Templum, TrendLine } from './charts'

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="tile">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  )
}

export function Analytics({ predictions }: { predictions: Prediction[] }) {
  const stats = useMemo(() => {
    const r = resolved(predictions)
    const acc = accuracy(predictions)
    const conf = meanConfidence(predictions)
    const b = brier(predictions)
    const gapPts = acc !== null && conf !== null ? Math.round((conf - acc) * 100) : null
    return {
      r,
      acc,
      b,
      gapPts,
      bins: calibrationBins(predictions),
      roll: rollingBrier(predictions),
      cats: byCategory(predictions),
    }
  }, [predictions])

  const { r, acc, b, gapPts, bins, roll, cats } = stats

  if (r.length === 0) {
    return (
      <section>
        <div className="panel">
          <h2>Nothing to read yet</h2>
          <p className="empty">
            The entrails are still whole. Log predictions in the Ledger, judge them when their day
            comes, and this page will tell you whether your 80% really means 80%. If you want a
            preview, load the sample vault under Data.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="tiles">
        <Tile label="Judged" value={String(r.length)} sub={`of ${predictions.length} logged`} />
        <Tile
          label="Directionally right"
          value={acc !== null ? `${Math.round(acc * 100)}%` : '\u2014'}
          sub="calls on the correct side of 50"
        />
        <Tile
          label="Brier score"
          value={b !== null ? b.toFixed(3) : '\u2014'}
          sub={'0 prophet \u00b7 0.25 coin flip \u00b7 1 anti-prophet'}
        />
        <Tile
          label="Calibration gap"
          value={
            gapPts === null ? '\u2014' : gapPts === 0 ? 'even' : `${gapPts > 0 ? '+' : ''}${gapPts} pts`
          }
          sub={
            gapPts === null
              ? undefined
              : gapPts > 0
                ? 'confidence runs ahead of results'
                : gapPts < 0
                  ? 'results run ahead of confidence'
                  : 'confidence matches results'
          }
        />
      </div>

      {r.length < 3 ? (
        <p className="empty">
          Judge at least three predictions and the full reading appears — calibration curve,
          confidence histogram, and the trend of your Brier score.
        </p>
      ) : (
        <div className="chart-grid">
          <div className="panel span2">
            <h3>The reading</h3>
            <p className="hint">
              Each disc is a confidence band, sized by how many predictions live there. On the
              dashed diagonal, your stated confidence and reality agree.
            </p>
            <Templum bins={bins} />
          </div>
          <div className="panel">
            <h3>Confidence habits</h3>
            <ConfHistogram bins={bins} />
          </div>
          <div className="panel">
            <h3>Brier, rolling ten</h3>
            <TrendLine
              values={roll}
              yMax={0.5}
              refY={0.25}
              refLabel="coin flip"
              fmt={(n) => n.toFixed(2)}
              ariaLabel="Rolling Brier score across judged predictions"
            />
          </div>
          {cats.length > 1 && (
            <div className="panel span2">
              <h3>By category</h3>
              <table className="cats">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Judged</th>
                    <th>Right</th>
                    <th>Brier</th>
                  </tr>
                </thead>
                <tbody>
                  {cats.map((c) => (
                    <tr key={c.cat}>
                      <td>{c.cat}</td>
                      <td>{c.n}</td>
                      <td>{Math.round(c.acc * 100)}%</td>
                      <td>{c.brier.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
