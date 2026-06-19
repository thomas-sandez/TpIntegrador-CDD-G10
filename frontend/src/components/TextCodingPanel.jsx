import { useState, useRef } from 'react'
import './TextCodingPanel.css'
import { encodeHuffman, encodeShannonFano, encodeHamming } from '../services/apiText'

function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`
}

function formatNumber(value) {
  return Number(value).toLocaleString('es-AR')
}

function getHammingParityValues(bits = []) {
  const parities = {}
  const parityIndexes = [0, 1, 3]
  for (const idx of parityIndexes) {
    parities[`P${idx + 1}`] = bits[idx] ?? 0
  }
  return parities
}

function computeAverages(resultados) {
  const valores = []
  if (resultados?.huffman?.tasa_compresion != null) valores.push(resultados.huffman)
  if (resultados?.shannon?.tasa_compresion != null) valores.push(resultados.shannon)

  if (!valores.length) return null

  const tasaPromedio = valores.reduce((sum, item) => sum + item.tasa_compresion, 0) / valores.length
  const eficienciaPromedio = valores.reduce((sum, item) => sum + item.eficiencia, 0) / valores.length
  const longitudPromedio = valores.reduce((sum, item) => sum + item.longitud_promedio_codigo, 0) / valores.length

  return {
    tasa_promedio: tasaPromedio,
    eficiencia_promedio: eficienciaPromedio,
    longitud_promedio_codigo: longitudPromedio,
  }
}

export default function TextCodingPanel() {
  const [texto, setTexto] = useState('')
  const [resultados, setResultados] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resetKey, setResetKey] = useState(0)
  const [activeTab, setActiveTab] = useState('hamming')
  const [mode, setMode] = useState('codificar')
  const fileInputRef = useRef(null)

  const handleTextoChange = (e) => setTexto(e.target.value)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'text/plain') {
      setError('Solo se permiten archivos .txt')
      return
    }
    const lector = new FileReader()
    lector.onload = () => {
      setTexto(String(lector.result || ''))
      setError(null)
    }
    lector.onerror = () => {
      setError('No se pudo leer el archivo')
    }
    lector.readAsText(file, 'UTF-8')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const event = { target: { files: [file] } }
      handleFileChange(event)
    }
  }

  const handleDragOver = (e) => e.preventDefault()

  const handleRun = async () => {
    if (!texto.trim()) {
      setError('Ingrese un texto o cargue un archivo .txt para codificar')
      return
    }

    setLoading(true)
    setError(null)
    setResultados(null)

    try {
      if (activeTab === 'hamming') {
        const hamming = await encodeHamming(texto)
        setResultados({ hamming })
      } else {
        const [huffman, shannon, hamming] = await Promise.all([
          encodeHuffman(texto),
          encodeShannonFano(texto),
          encodeHamming(texto),
        ])
        setResultados({ huffman, shannon, hamming })
      }
    } catch (err) {
      setError(err.message || 'Error al ejecutar la codificación')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setTexto('')
    setResultados(null)
    setError(null)
    setResetKey((k) => k + 1)
  }

  const promedio = resultados ? computeAverages(resultados) : null
  const hamming = resultados?.hamming
  const parityValues = getHammingParityValues(hamming?.bits_codificados)

  return (
    <div className="coding-panel">
      <div className="coding-panel__tabs">
        <button
          type="button"
          className={`coding-tab ${activeTab === 'compresion' ? 'coding-tab--active' : ''}`}
          onClick={() => setActiveTab('compresion')}
        >
          Compresión
        </button>
        <button
          type="button"
          className={`coding-tab ${activeTab === 'hamming' ? 'coding-tab--active' : ''}`}
          onClick={() => setActiveTab('hamming')}
        >
          Hamming
        </button>
      </div>

      <div className="coding-panel__grid">
        <aside className="coding-panel__side">
          <div className="card card--panel">
            <div className="card__header">
              <p className="card__eyebrow">Código Hamming (7,4)</p>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-button ${mode === 'codificar' ? 'toggle-button--active' : ''}`}
                  onClick={() => setMode('codificar')}
                >
                  Codificar
                </button>
                <button
                  type="button"
                  className={`toggle-button ${mode === 'decodificar' ? 'toggle-button--active' : ''}`}
                  onClick={() => setMode('decodificar')}
                >
                  Decodificar
                </button>
              </div>
            </div>

            <div className="card__body">
              <label className="input-label">Datos (bits)</label>
              <input
                value={texto}
                onChange={handleTextoChange}
                placeholder="1011"
                className="input-field"
              />

              <button
                type="button"
                className="upload-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <span>Cargar archivo .txt</span>
              </button>
              <input
                key={resetKey}
                ref={fileInputRef}
                type="file"
                accept="text/plain"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div className="info-block">
                <p className="info-title">Hamming (7,4):</p>
                <p className="info-text">4 bits de datos · 3 bits de paridad · Detecta y corrige 1 error</p>
              </div>
            </div>

            <div className="card__footer">
              <button className="btn btn--ghost" type="button" onClick={handleReset}>Limpiar</button>
              <button className="btn btn--primary" type="button" onClick={handleRun} disabled={loading}>
                {loading ? 'Procesando...' : 'Codificar'}
              </button>
            </div>
          </div>
        </aside>

        <section className="coding-panel__main">
          <div className="card card--result">
            <div className="card__header">
              <div>
                <p className="card__eyebrow">Resultado Hamming</p>
                <h3 className="card__title">Palabra Código Generada</h3>
              </div>
            </div>

            <div className="card__body card__body--center">
              <div className="bit-grid">
                {(hamming?.bits_codificados ?? ['0', '0', '0', '0', '0', '0', '0']).map((bit, index) => (
                  <div key={`${bit}-${index}`} className={`bit-chip ${[0, 1, 3].includes(index) ? 'bit-chip--parity' : 'bit-chip--data'}`}>
                    {bit}
                  </div>
                ))}
              </div>
              <div className="legend-row">
                <span className="legend-item legend-item--data">Datos</span>
                <span className="legend-item legend-item--parity">Paridad</span>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <span>Bits entrada</span>
                <strong>{hamming?.longitud_bits_original ?? 0}</strong>
              </div>
              <div className="stat-card">
                <span>Bits salida</span>
                <strong>{hamming?.longitud_bits_codificados ?? 0}</strong>
              </div>
            </div>

            <div className="parity-row">
              {Object.entries(parityValues).map(([key, value]) => (
                <div key={key} className="parity-chip">
                  <span>{key}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="card card--summary">
            <h4 className="summary-title">Comparación promedio</h4>
            <div className="summary-grid summary-grid--compact">
              <div className="summary-card summary-card--accent">
                <span className="summary-card__label">Tasa de compresión</span>
                <strong>{promedio ? formatPercent(promedio.tasa_promedio) : '—'}</strong>
              </div>
              <div className="summary-card">
                <span className="summary-card__label">Eficiencia</span>
                <strong>{promedio ? formatPercent(promedio.eficiencia_promedio) : '—'}</strong>
              </div>
              <div className="summary-card">
                <span className="summary-card__label">Longitud promedio</span>
                <strong>{promedio ? formatNumber(promedio.longitud_promedio_codigo) : '—'}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
