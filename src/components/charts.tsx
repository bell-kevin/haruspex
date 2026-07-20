// SPDX-License-Identifier: AGPL-3.0-only
import type { Bin } from '../lib/scoring'

const GILT = '#e0b264'
const BRONZE = '#c08b3f'
const IVORY = '#ece5d2'
const MUTED = '#98917e'
const FAINT = '#5d5749'
const LINE = '#2c3646'
const MADDER = '#c9705e'
const VERDIGRIS = '#79a98f'

/**
 * The Templum: stated confidence against observed accuracy, framed like the
 * quartered sky an augur marked out before reading. Perfect calibration lies
 * on the diagonal; below it you were too bold, above it too humble.
 */
export function Templum({ bins }: { bins: Bin[] }) {
  const W = 460
  const H = 322
  const x0 = 56
  const x1 = 440
  const y0 = 18
  const y1 = 270
  const cx = (conf: number) => x0 + ((conf - 50) / 50) * (x1 - x0)
  const cy = (acc: number) => y1 - (acc / 100) * (y1 - y0)
  const filled = bins.filter((b) => b.n > 0).sort((a, b) => a.conf - b.conf)
  const corner = 11

  return (
    <svg
      className="chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Calibration chart: stated confidence versus observed accuracy"
    >
      {/* templum corner marks */}
      {(
        [
          [x0, y0, 1, 1],
          [x1, y0, -1, 1],
          [x0, y1, 1, -1],
          [x1, y1, -1, -1],
        ] as const
      ).map(([px, py, sx, sy], i) => (
        <path
          key={i}
          d={`M ${px + sx * corner} ${py} H ${px} V ${py + sy * corner}`}
          stroke={BRONZE}
          strokeWidth={1.6}
          fill="none"
        />
      ))}

      {/* quartering hairlines */}
      <line x1={cx(75)} y1={y0} x2={cx(75)} y2={y1} stroke={LINE} strokeWidth={1} opacity={0.6} />
      <line x1={x0} y1={cy(50)} x2={x1} y2={cy(50)} stroke={LINE} strokeWidth={1} opacity={0.6} />

      {/* axis ticks */}
      {[50, 60, 70, 80, 90, 100].map((t) => (
        <g key={t}>
          <line x1={cx(t)} y1={y1} x2={cx(t)} y2={y1 + 5} stroke={FAINT} strokeWidth={1} />
          <text x={cx(t)} y={y1 + 19} fill={MUTED} fontSize={11} textAnchor="middle">
            {t}%
          </text>
        </g>
      ))}
      {[0, 25, 50, 75, 100].map((t) => (
        <g key={t}>
          <line x1={x0 - 5} y1={cy(t)} x2={x0} y2={cy(t)} stroke={FAINT} strokeWidth={1} />
          <text x={x0 - 9} y={cy(t) + 4} fill={MUTED} fontSize={11} textAnchor="end">
            {t}%
          </text>
        </g>
      ))}

      {/* perfect-calibration diagonal */}
      <line
        x1={cx(50)}
        y1={cy(50)}
        x2={cx(100)}
        y2={cy(100)}
        stroke={IVORY}
        strokeWidth={1}
        strokeDasharray="5 5"
        opacity={0.5}
      />

      {/* region labels */}
      <text x={cx(58)} y={cy(90)} fill={FAINT} fontSize={10.5} fontStyle="italic">
        too humble
      </text>
      <text x={cx(84)} y={cy(14)} fill={FAINT} fontSize={10.5} fontStyle="italic">
        too bold
      </text>

      {/* connecting line and points */}
      {filled.length > 1 && (
        <polyline
          points={filled.map((b) => `${cx(b.conf)},${cy(b.acc)}`).join(' ')}
          fill="none"
          stroke={BRONZE}
          strokeWidth={1.4}
          opacity={0.75}
        />
      )}
      {filled.map((b) => (
        <circle
          key={b.lo}
          cx={cx(b.conf)}
          cy={cy(b.acc)}
          r={5 + Math.min(9, Math.sqrt(b.n) * 2.2)}
          fill={GILT}
          fillOpacity={0.88}
          stroke="#141922"
          strokeWidth={1.5}
        >
          <title>
            {`${b.lo}–${b.hi - 1}% confidence: right ${Math.round(b.acc)}% of the time (n=${b.n})`}
          </title>
        </circle>
      ))}

      {/* axis titles */}
      <text
        x={(x0 + x1) / 2}
        y={H - 6}
        fill={MUTED}
        fontSize={10.5}
        textAnchor="middle"
        letterSpacing={2}
      >
        STATED CONFIDENCE
      </text>
      <text
        x={14}
        y={(y0 + y1) / 2}
        fill={MUTED}
        fontSize={10.5}
        textAnchor="middle"
        letterSpacing={2}
        transform={`rotate(-90 14 ${(y0 + y1) / 2})`}
      >
        HOW OFTEN RIGHT
      </text>
    </svg>
  )
}

/** How your stated confidence distributes across the five folded bins. */
export function ConfHistogram({ bins }: { bins: Bin[] }) {
  const W = 460
  const H = 196
  const x0 = 56
  const x1 = 440
  const base = 152
  const top = 26
  const max = Math.max(1, ...bins.map((b) => b.n))
  const slot = (x1 - x0) / bins.length
  const barW = slot - 16

  return (
    <svg
      className="chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Histogram of stated confidence"
    >
      <line x1={x0} y1={base} x2={x1} y2={base} stroke={LINE} strokeWidth={1} />
      {bins.map((b, i) => {
        const h = (b.n / max) * (base - top)
        const bx = x0 + i * slot + (slot - barW) / 2
        const label = b.hi === 100 ? `${b.lo}–99%` : `${b.lo}–${b.hi - 1}%`
        return (
          <g key={b.lo}>
            {b.n > 0 && (
              <rect
                x={bx}
                y={base - h}
                width={barW}
                height={h}
                rx={3}
                fill={BRONZE}
                fillOpacity={0.85}
              >
                <title>{`${label}: ${b.n} prediction${b.n === 1 ? '' : 's'}`}</title>
              </rect>
            )}
            {b.n > 0 && (
              <text
                x={bx + barW / 2}
                y={base - h - 6}
                fill={IVORY}
                fontSize={11.5}
                textAnchor="middle"
              >
                {b.n}
              </text>
            )}
            <text x={bx + barW / 2} y={base + 17} fill={MUTED} fontSize={10.5} textAnchor="middle">
              {label}
            </text>
          </g>
        )
      })}
      <text
        x={(x0 + x1) / 2}
        y={H - 6}
        fill={MUTED}
        fontSize={10.5}
        textAnchor="middle"
        letterSpacing={2}
      >
        WHERE YOUR CONFIDENCE LIVES
      </text>
    </svg>
  )
}

/** A small line chart with an optional dashed reference line. */
export function TrendLine({
  values,
  yMax,
  refY,
  refLabel,
  refColor = MADDER,
  fmt = (n) => String(Math.round(n * 100) / 100),
  ariaLabel,
}: {
  values: number[]
  yMax: number
  refY?: number
  refLabel?: string
  refColor?: string
  fmt?: (n: number) => string
  ariaLabel: string
}) {
  const W = 460
  const H = 174
  const x0 = 56
  const x1 = 440
  const y0 = 16
  const y1 = 140
  const n = values.length
  const px = (i: number) => (n === 1 ? (x0 + x1) / 2 : x0 + (i / (n - 1)) * (x1 - x0))
  const py = (v: number) => y1 - (Math.min(v, yMax) / yMax) * (y1 - y0)

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
      <line x1={x0} y1={y1} x2={x1} y2={y1} stroke={LINE} strokeWidth={1} />
      <text x={x0 - 9} y={y1 + 4} fill={MUTED} fontSize={11} textAnchor="end">
        0
      </text>
      <text x={x0 - 9} y={y0 + 4} fill={MUTED} fontSize={11} textAnchor="end">
        {fmt(yMax)}
      </text>
      {refY !== undefined && (
        <g>
          <line
            x1={x0}
            y1={py(refY)}
            x2={x1}
            y2={py(refY)}
            stroke={refColor}
            strokeWidth={1}
            strokeDasharray="4 5"
            opacity={0.8}
          />
          {refLabel && (
            <text x={x1} y={py(refY) - 5} fill={refColor} fontSize={10.5} textAnchor="end">
              {refLabel}
            </text>
          )}
        </g>
      )}
      {n > 1 && (
        <polyline
          points={values.map((v, i) => `${px(i)},${py(v)}`).join(' ')}
          fill="none"
          stroke={GILT}
          strokeWidth={1.8}
        />
      )}
      {values.map((v, i) => (
        <circle
          key={i}
          cx={px(i)}
          cy={py(v)}
          r={i === n - 1 ? 4 : 2.4}
          fill={i === n - 1 ? GILT : BRONZE}
        >
          <title>{fmt(v)}</title>
        </circle>
      ))}
    </svg>
  )
}

export const chartColors = { GILT, BRONZE, MADDER, VERDIGRIS }
