/**
 * apiAlgoritmos.js
 * Servicio centralizado para todos los endpoints de /api/algoritmos.
 *
 * Endpoints disponibles en el backend (ControladorAlgoritmos.py):
 *   POST /api/algoritmos/huffman        → AdminAlgoritmos.huffman(texto)
 *   POST /api/algoritmos/shannon-fano   → AdminAlgoritmos.shannon_fano(texto)
 *   POST /api/algoritmos/hamming        → AdminAlgoritmos.hamming(texto)
 *   POST /api/algoritmos/comprimir      → Huffman + Shannon-Fano combinados (normalizado)
 */

const API_BASE = 'http://localhost:5000/api/algoritmos'

// ── helpers ──────────────────────────────────────────────────────────────────

async function _post(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `Error ${response.status} en ${path}`)
  }

  return response.json()
}

// ── Huffman ──────────────────────────────────────────────────────────────────

/**
 * Codifica un texto con el algoritmo de Huffman.
 * @param {string} texto
 * @returns {Promise<{
 *   metodo: string,
 *   texto_original: string,
 *   frecuencias: Record<string, number>,
 *   codigos: Record<string, string>,
 *   texto_comprimido: string,
 *   entropia: number,
 *   longitud_promedio_codigo: number,
 *   tasa_compresion: number,
 *   eficiencia: number,
 *   ruta_imagen: string,
 * }>}
 */
export function huffman(texto) {
  return _post('/huffman', { texto })
}

// ── Shannon-Fano ─────────────────────────────────────────────────────────────

/**
 * Codifica un texto con el algoritmo de Shannon-Fano.
 * @param {string} texto
 * @returns {Promise<{
 *   metodo: string,
 *   texto_original: string,
 *   frecuencias: Record<string, number>,
 *   codigos: Record<string, string>,
 *   texto_comprimido: string,
 *   entropia: number,
 *   longitud_promedio_codigo: number,
 *   tasa_compresion: number,
 *   eficiencia: number,
 *   ruta_imagen: string,
 * }>}
 */
export function shannonFano(texto) {
  return _post('/shannon-fano', { texto })
}

// ── Hamming ───────────────────────────────────────────────────────────────────

/**
 * Codifica y decodifica un texto con Hamming (detección/corrección de errores).
 * @param {string} texto
 * @returns {Promise<{
 *   metodo: string,
 *   texto_original: string,
 *   bits_originales: number[],
 *   bits_codificados: number[],
 *   bits_decodificados: number[],
 *   texto_decodificado: string,
 *   longitud_bits_original: number,
 *   longitud_bits_codificados: number,
 *   longitud_bits_decodificados: number,
 * }>}
 */
export function hamming(texto) {
  return _post('/hamming', { texto })
}

// ── Comprimir (Huffman + Shannon-Fano combinados) ────────────────────────────

/**
 * Ejecuta Huffman y Shannon-Fano sobre el mismo texto y devuelve ambos
 * resultados normalizados para comparación directa en el frontend.
 *
 * Los valores de `tasa` y `eficiencia` están en rango 0–1.
 *
 * @param {string} texto
 * @returns {Promise<{
 *   huffman: {
 *     codigo: string,
 *     tasa: number,
 *     longitud_promedio: number,
 *     eficiencia: number,
 *   },
 *   shannon_fano: {
 *     codigo: string,
 *     tasa: number,
 *     longitud_promedio: number,
 *     eficiencia: number,
 *   },
 *   ganador: 'huffman' | 'shannon_fano' | 'empate',
 * }>}
 */
export function comprimir(texto) {
  return _post('/comprimir', { texto })
}
