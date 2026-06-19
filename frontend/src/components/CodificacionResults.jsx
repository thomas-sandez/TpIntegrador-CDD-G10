import { useState } from 'react'
import './CodificacionResults.css'

function MetricBadge({ label, value, color }) {
  return (
    <div className="metric-badge">
      <span className={`metric-badge__value metric-badge__value--${color}`}>{value}</span>
      <span className="metric-badge__label">{label}</span>
    </div>
  )
}

function AlgorithmCard({ name, color, icon, resultado, onCopy, copied }) {
  if (!resultado) return null

  const { codigo, tasa, longitud_promedio, eficiencia } = resultado

  return (
    <div className={`algo-card algo-card--${color}`}>
      <div className="algo-card__header">
        <div className="algo-card__title">
          {icon}
          <span>{name}</span>
        </div>
        <button
          className="algo-card__copy-btn"
          onClick={() => onCopy(codigo)}
          title="Copiar código"
          id={`btn-copy-${name.toLowerCase().replace(/\s/g, '-')}`}
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>

      <div className="algo-card__code-block">
        <div className="algo-card__code-header">
          <span className="algo-card__code-label">Código binario</span>
          {codigo && (
            <span className="algo-card__code-bits">{codigo.length} bits</span>
          )}
        </div>
        <div className="algo-card__code-viewer">
          <code className="algo-card__code-text">
            {codigo
              ? codigo.match(/.{1,8}/g)?.map((chunk, i) => (
                  <span key={i} className="algo-card__code-chunk">{chunk}</span>
                ))
              : '—'
            }
          </code>
        </div>
      </div>

      <div className="algo-card__metrics">
        <MetricBadge label="Tasa" value={`${(tasa * 100).toFixed(0)}%`} color={color} />
        <MetricBadge label="Long." value={longitud_promedio?.toFixed(2)} color="neutral" />
        <MetricBadge label="Efic." value={`${(eficiencia * 100).toFixed(1)}%`} color="green" />
      </div>
    </div>
  )
}

function WinnerBanner({ ganador }) {
  if (!ganador) return null

  const messages = {
    huffman: { text: 'Huffman es más eficiente', color: 'accent' },
    shannon_fano: { text: 'Shannon-Fano es más eficiente', color: 'teal' },
    empate: { text: 'Ambos algoritmos son equivalentes', color: 'neutral' },
  }

  const msg = messages[ganador] || messages.empate

  return (
    <div className={`winner-banner winner-banner--${msg.color}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {msg.text}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="cod-results__empty">
      <div className="cod-results__empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>
      <p className="cod-results__empty-text">Ingresá un texto y presioná <strong>Codificar</strong> para ver los resultados.</p>
    </div>
  )
}

export default function CodificacionResults({ resultado, error }) {
  const [copiedKey, setCopiedKey] = useState(null)

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1800)
  }

  return (
    <section className="cod-results">
      <div className="cod-results__header">
        <h2 className="cod-results__title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Huffman vs Shannon-Fano
        </h2>
      </div>

      <div className="cod-results__body">
        {error && (
          <div className="cod-results__error">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {!resultado && !error && <EmptyState />}

        {resultado && (
          <>
            <div className="cod-results__grid">
              <AlgorithmCard
                name="Huffman"
                color="accent"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
                  </svg>
                }
                resultado={resultado.huffman}
                onCopy={(c) => handleCopy('huffman', c)}
                copied={copiedKey === 'huffman'}
              />
              <AlgorithmCard
                name="Shannon-Fano"
                color="teal"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                }
                resultado={resultado.shannon_fano}
                onCopy={(c) => handleCopy('shannon', c)}
                copied={copiedKey === 'shannon'}
              />
            </div>

            <WinnerBanner ganador={resultado.ganador} />
          </>
        )}
      </div>
    </section>
  )
}
