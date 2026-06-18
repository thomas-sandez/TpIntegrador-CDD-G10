import { useRef } from 'react'
import './ProcessingParams.css'

const RESOLUCION_MIN = 100
const RESOLUCION_MAX = 1000
const BITS_OPTIONS = [1, 2, 4, 8, 16, 24]

function formatResolucion(val) {
  return `${val}×${val}`
}

function formatBits(val) {
  const colors = Math.pow(2, val)
  if (colors >= 1000000) return `${val} bits (${(colors / 1000000).toFixed(0)}M)`
  if (colors >= 1000) return `${val} bits (${(colors / 1000).toFixed(0)}K)`
  return `${val} bits (${colors})`
}

export default function ProcessingParams({ params, onParamsChange, onApply, onReset, onExport, onImageUpload, resetKey }) {
  const fileInputRef = useRef(null)

  const handleResolucionChange = (e) => {
    onParamsChange({ ...params, resolucion: Number(e.target.value) })
  }

  const handleBitsChange = (e) => {
    const idx = Number(e.target.value)
    onParamsChange({ ...params, bits: BITS_OPTIONS[idx] })
  }

  const handleCompresionChange = (e) => {
    onParamsChange({ ...params, compresion: Number(e.target.value) })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) onImageUpload(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onImageUpload(file)
  }

  const handleDragOver = (e) => e.preventDefault()

  const bitsIdx = BITS_OPTIONS.indexOf(params.bits)

  const sliderStyle = (pct) => ({
    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${pct}%, #5a5a68 ${pct}%, #5a5a68 100%)`
  })

  return (
    <aside className="params-panel">
      <div className="params-panel__header">
        <h2 className="params-panel__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
          Parámetros de Procesamiento
        </h2>
      </div>

      <div className="params-panel__body">
        {/* Upload zone */}
        <div
          className="upload-zone"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          role="button"
          tabIndex={0}
          id="upload-zone"
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <div className="upload-zone__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="upload-zone__label">Cargar Imagen</p>
          <p className="upload-zone__hint">PNG, JPG hasta 10MB</p>
          <input
            key={resetKey}
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            id="file-input"
          />
        </div>

        {/* Resolución */}
        <div className="param-group">
          <div className="param-group__header">
            <span className="param-group__label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Resolución (Muestreo)
            </span>
            <span className="param-group__value">{formatResolucion(params.resolucion)}</span>
          </div>
          <input
            id="slider-resolucion"
            type="range"
            min={RESOLUCION_MIN}
            max={RESOLUCION_MAX}
            step={10}
            value={params.resolucion}
            onChange={handleResolucionChange}
            className="param-slider"
            style={sliderStyle(((params.resolucion - RESOLUCION_MIN) / (RESOLUCION_MAX - RESOLUCION_MIN)) * 100)}
          />
          <div className="param-group__range-labels">
            <span>100×100</span>
            <span>1000×1000</span>
          </div>
        </div>

        {/* Profundidad de Bits */}
        <div className="param-group">
          <div className="param-group__header">
            <span className="param-group__label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              Profundidad de Bits
            </span>
            <span className="param-group__value">{formatBits(params.bits)}</span>
          </div>
          <input
            id="slider-bits"
            type="range"
            min={0}
            max={BITS_OPTIONS.length - 1}
            step={1}
            value={bitsIdx >= 0 ? bitsIdx : 5}
            onChange={handleBitsChange}
            className="param-slider"
            style={sliderStyle(((bitsIdx >= 0 ? bitsIdx : 5) / (BITS_OPTIONS.length - 1)) * 100)}
          />
          <div className="param-group__range-labels">
            <span>1 bit</span>
            <span>24 bits</span>
          </div>
        </div>

        {/* Compresión */}
        <div className="param-group">
          <div className="param-group__header">
            <span className="param-group__label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Compresión
            </span>
            <span className="param-group__value">{params.compresion}%</span>
          </div>
          <input
            id="slider-compresion"
            type="range"
            min={0}
            max={100}
            step={1}
            value={params.compresion}
            onChange={handleCompresionChange}
            className="param-slider"
            style={sliderStyle(params.compresion)}
          />
          <div className="param-group__range-labels">
            <span>Sin compresión</span>
            <span>Máxima</span>
          </div>
        </div>
      </div>

      <div className="params-panel__footer">
        <div className="params-panel__actions-row">
          <button id="btn-reiniciar" className="btn btn--ghost" onClick={onReset}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reiniciar
          </button>
          <button id="btn-exportar" className="btn btn--ghost" onClick={onExport}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar
          </button>
        </div>
        <button id="btn-aplicar" className="btn btn--primary" onClick={onApply}>
          Aplicar Procesamiento
        </button>
      </div>
    </aside>
  )
}
