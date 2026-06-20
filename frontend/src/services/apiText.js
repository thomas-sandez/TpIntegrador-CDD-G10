const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/algoritmos`

async function postAlgorithm(endpoint, texto) {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texto }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Error en el servicio de codificación')
  }

  return data
}

export function encodeHuffman(texto) {
  return postAlgorithm('huffman', texto)
}

export function encodeShannonFano(texto) {
  return postAlgorithm('shannon-fano', texto)
}

export function encodeHamming(texto) {
  return postAlgorithm('hamming', texto)
}
