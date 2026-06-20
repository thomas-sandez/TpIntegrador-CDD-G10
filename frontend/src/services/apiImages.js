const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/imagenes`

/**
 * Convierte bits totales (ej. 24) a bits por canal RGB (ej. 8).
 * El backend espera bits_por_canal (profundidad por cada canal R, G, B).
 */
function bitsPorCanal(bitsTotales) {
  return Math.max(1, Math.floor(bitsTotales / 3))
}

/**
 * Sube una imagen al servidor.
 * POST /api/imagenes/upload
 * @param {File} file
 * @returns {Promise<{ id_imagen: string }>}
 */
export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Error al subir la imagen')
  }

  return response.json()
}

/**
 * URL de la imagen original sin procesar.
 * GET /api/imagenes/image/:id/original
 * @param {string} idImagen
 * @returns {string}
 */
export function getOriginalImageUrl(idImagen) {
  return `${API_BASE_URL}/image/${idImagen}/original`
}

/**
 * URL de la imagen digitalizada (muestreo + cuantización sin compresión JPEG adicional).
 * GET /api/imagenes/image/:id/digitized?resolucion=NxN&bits_por_canal=N
 * @param {string} idImagen
 * @param {number} resolucion - Valor del slider (ej. 500 → "500x500")
 * @param {number} bits       - Bits totales del slider (ej. 24 → 8 bits por canal)
 * @returns {string}
 */
export function getDigitizedImageUrl(idImagen, resolucion, bits) {
  const res = `${resolucion}x${resolucion}`
  const bpc = bitsPorCanal(bits)
  return `${API_BASE_URL}/image/${idImagen}/digitized?resolucion=${res}&bits_por_canal=${bpc}`
}

/**
 * URL de la imagen digitalizada + comprimida con calidad JPEG.
 * GET /api/imagenes/image/:id/compressed?resolucion=NxN&bits_por_canal=N&calidad=N
 * @param {string} idImagen
 * @param {number} resolucion  - Valor del slider (ej. 500)
 * @param {number} bits        - Bits totales del slider (ej. 24)
 * @param {number} compresion  - Porcentaje de compresión 0–100 (0 = sin compresión, 100 = máxima)
 * @returns {string}
 */
export function getCompressedImageUrl(idImagen, resolucion, bits, compresion) {
  const res = `${resolucion}x${resolucion}`
  const bpc = bitsPorCanal(bits)
  const calidad = 100 - compresion  // El backend usa calidad JPEG (100=máxima calidad, 0=más comprimida)
  return `${API_BASE_URL}/image/${idImagen}/compressed?resolucion=${res}&bits_por_canal=${bpc}&calidad=${calidad}`
}
