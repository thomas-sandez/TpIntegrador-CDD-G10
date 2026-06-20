import { useState } from 'react'
import './index.css'
import './App.css'
import Navbar from './components/Navbar'
import ProcessingParams from './components/ProcessingParams'
import ImageComparison from './components/ImageComparison'
import TextInput from './components/TextInput'
import CodificacionResults from './components/CodificacionResults'
import HammingInput from './components/HammingInput'
import HammingResults from './components/HammingResults'
import {
  uploadImage,
  getOriginalImageUrl,
  getCompressedImageUrl,
} from './services/apiImages'
import { comprimir as comprimirTexto, hammingCodificarBits, hammingDecodificarBits } from './services/apiAlgoritmos'

const DEFAULT_PARAMS = {
  resolucion: 500,
  bits: 24,
  compresion: 50,
}

function DigitalizacionPage() {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [imageId, setImageId] = useState(null)
  const [originalImage, setOriginalImage] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resetKey, setResetKey] = useState(0)

  const handleImageUpload = async (file) => {
    try {
      setLoading(true)
      setError(null)
      setOriginalImage(null)
      setProcessedImage(null)
      const data = await uploadImage(file)
      setImageId(data.id_imagen)
      setOriginalImage(getOriginalImageUrl(data.id_imagen))
      setResetKey(k => k + 1)  // resetea el input de archivo para permitir volver a seleccionar
    } catch (err) {
      setError(err.message || 'Error al subir la imagen')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (!imageId) return
    // Timestamp para forzar recarga si cambiaron los parámetros
    const ts = Date.now()
    setProcessedImage(
      `${getCompressedImageUrl(imageId, params.resolucion, params.bits, params.compresion)}&t=${ts}`
    )
  }

  const handleReset = () => {
    setParams(DEFAULT_PARAMS)
    setImageId(null)
    setOriginalImage(null)
    setProcessedImage(null)
    setError(null)
    setResetKey(k => k + 1)  // fuerza remontado del input de archivo
  }

  const handleExport = async () => {
    if (!processedImage) return
    try {
      const response = await fetch(processedImage)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = 'imagen_digitalizada.jpg'
      a.click()
      URL.revokeObjectURL(blobUrl)
    } catch {
      // fallback: abrir en nueva pestaña
      window.open(processedImage, '_blank')
    }
  }

  return (
    <div className="page">
      <div className="page__subheader">
        <div className="page__subheader-left">
          <h1 className="page__title">Digitalización de Imágenes</h1>
          <p className="page__subtitle">Muestreo y cuantización de color en imágenes analógicas</p>
        </div>
        <div className="page__subheader-right">
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <span>Subiendo imagen...</span>
            </div>
          )}
          {error && (
            <div className="error-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="page__content">
        <ProcessingParams
          params={params}
          onParamsChange={setParams}
          onApply={handleApply}
          onReset={handleReset}
          onExport={handleExport}
          onImageUpload={handleImageUpload}
          resetKey={resetKey}
        />
        <ImageComparison
          originalImage={originalImage}
          processedImage={processedImage}
        />
      </div>
    </div>
  )
}

function CodificacionPage() {
  const [subTab, setSubTab] = useState('compresion')

  // Compresión state
  const [resultado, setResultado] = useState(null)
  const [errorComp, setErrorComp] = useState(null)
  const [loadingComp, setLoadingComp] = useState(false)

  const handleCodificar = async (texto) => {
    try {
      setLoadingComp(true)
      setErrorComp(null)
      const data = await comprimirTexto(texto)
      setResultado(data)
    } catch (err) {
      setErrorComp(err.message || 'Error al codificar el texto')
      setResultado(null)
    } finally {
      setLoadingComp(false)
    }
  }

  // Hamming state
  const [hammingResultado, setHammingResultado] = useState(null)
  const [hammingModo, setHammingModo] = useState('decodificar')
  const [errorHamming, setErrorHamming] = useState(null)
  const [loadingHamming, setLoadingHamming] = useState(false)

  const handleHamming = async ({ bits, modo }) => {
    try {
      setLoadingHamming(true)
      setErrorHamming(null)
      setHammingModo(modo)
      const data = modo === 'codificar'
        ? await hammingCodificarBits(bits)
        : await hammingDecodificarBits(bits)
      setHammingResultado(data)
    } catch (err) {
      setErrorHamming(err.message || 'Error al procesar Hamming')
      setHammingResultado(null)
    } finally {
      setLoadingHamming(false)
    }
  }

  const loading = subTab === 'compresion' ? loadingComp : loadingHamming
  const error = subTab === 'compresion' ? errorComp : errorHamming

  return (
    <div className="page">
      <div className="page__subheader">
        <div className="page__subheader-left">
          <h1 className="page__title">Codificación de Datos</h1>
          <p className="page__subtitle">Compresión y corrección de errores</p>
        </div>
        <div className="page__subheader-right">
          {loading && (
            <div className="loading-indicator">
              <div className="spinner" />
              <span>Procesando...</span>
            </div>
          )}
          {error && (
            <div className="error-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="sub-tabs">
        <button
          id="subtab-compresion"
          className={`sub-tabs__btn ${subTab === 'compresion' ? 'sub-tabs__btn--active' : ''}`}
          onClick={() => setSubTab('compresion')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Compresión
        </button>
        <button
          id="subtab-hamming"
          className={`sub-tabs__btn ${subTab === 'hamming' ? 'sub-tabs__btn--active' : ''}`}
          onClick={() => setSubTab('hamming')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          Hamming
        </button>
      </div>

      <div className="page__content">
        {subTab === 'compresion' ? (
          <>
            <TextInput onCodificar={handleCodificar} loading={loadingComp} />
            <CodificacionResults resultado={resultado} error={errorComp} />
          </>
        ) : (
          <>
            <HammingInput onProcesar={handleHamming} loading={loadingHamming} />
            <HammingResults resultado={hammingResultado} modo={hammingModo} error={errorHamming} />
          </>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('digitalizacion')

  return (
    <div className="app">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app__main">
        {activeTab === 'digitalizacion' ? <DigitalizacionPage /> : <CodificacionPage />}
      </main>
    </div>
  )
}
