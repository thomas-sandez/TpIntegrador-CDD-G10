import { useRef, useState } from 'react'
import './TextInput.css'

const EJEMPLO_TEXTO = 'La codificación de datos es fundamental para la transmisión eficiente de información.'

export default function TextInput({ onCodificar, loading }) {
  const [texto, setTexto] = useState('')
  const fileInputRef = useRef(null)

  const caracteres = texto.length
  const simbolosUnicos = new Set(texto.replace(/\s/g, '')).size

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setTexto(ev.target.result)
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleEjemplo = () => setTexto(EJEMPLO_TEXTO)
  const handleLimpiar = () => setTexto('')

  const handleSubmit = () => {
    if (!texto.trim() || loading) return
    onCodificar(texto)
  }

  return (
    <aside className="text-input-panel">
      <div className="text-input-panel__header">
        <h2 className="text-input-panel__title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Entrada de Texto
        </h2>
      </div>

      <div className="text-input-panel__body">
        <div className="text-field-group">
          <label className="text-field-group__label" htmlFor="texto-codificar">
            Texto a comprimir
          </label>
          <textarea
            id="texto-codificar"
            className="text-field-group__textarea"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe o pega el texto a codificar..."
            rows={6}
          />
        </div>

        <button
          id="btn-cargar-archivo"
          className="btn btn--outline btn--block"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Cargar archivo .txt
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            id="file-input-txt"
          />
        </button>

        <div className="text-stats">
          <div className="text-stats__item">
            <span className="text-stats__value">{caracteres}</span>
            <span className="text-stats__label">Caracteres</span>
          </div>
          <div className="text-stats__divider" />
          <div className="text-stats__item">
            <span className="text-stats__value text-stats__value--accent">{simbolosUnicos}</span>
            <span className="text-stats__label">Símbolos únicos</span>
          </div>
        </div>
      </div>

      <div className="text-input-panel__footer">
        <button
          id="btn-codificar"
          className="btn btn--primary btn--block"
          onClick={handleSubmit}
          disabled={!texto.trim() || loading}
        >
          {loading ? (
            <>
              <span className="btn-spinner" />
              Codificando...
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Codificar
            </>
          )}
        </button>

        <div className="text-input-panel__actions-row">
          <button id="btn-ejemplo" className="btn btn--ghost" onClick={handleEjemplo}>
            Ejemplo
          </button>
          <button id="btn-limpiar" className="btn btn--ghost" onClick={handleLimpiar}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Limpiar
          </button>
        </div>
      </div>
    </aside>
  )
}
