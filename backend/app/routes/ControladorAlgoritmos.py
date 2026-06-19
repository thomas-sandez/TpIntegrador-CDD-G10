from flask import Blueprint, jsonify, request
from app.services.AdminAlgoritmos import AdminAlgoritmos

controlador_algoritmos_bp = Blueprint('controlador_algoritmos', __name__)


def _obtener_texto():
    data = request.get_json(silent=True) or {}
    texto = data.get('texto')
    if not isinstance(texto, str):
        return None, jsonify({"error": "El campo 'texto' debe ser un string"}), 400
    if not texto.strip():
        return None, jsonify({"error": "El texto no puede estar vacío"}), 400
    return texto, None, None


# ── Huffman ──────────────────────────────────────────────────────────────────
@controlador_algoritmos_bp.route('/huffman', methods=['POST'])
def endpoint_huffman():
    texto, error_response, error_code = _obtener_texto()
    if error_response:
        return error_response, error_code
    return jsonify(AdminAlgoritmos.huffman(texto))


# ── Shannon-Fano ──────────────────────────────────────────────────────────────
@controlador_algoritmos_bp.route('/shannon-fano', methods=['POST'])
def endpoint_shannon_fano():
    texto, error_response, error_code = _obtener_texto()
    if error_response:
        return error_response, error_code
    return jsonify(AdminAlgoritmos.shannon_fano(texto))


# ── Hamming ───────────────────────────────────────────────────────────────────
@controlador_algoritmos_bp.route('/hamming', methods=['POST'])
def endpoint_hamming():
    texto, error_response, error_code = _obtener_texto()
    if error_response:
        return error_response, error_code
    return jsonify(AdminAlgoritmos.hamming(texto))


# ── Comprimir (Huffman + Shannon-Fano combinados) ────────────────────────────
@controlador_algoritmos_bp.route('/comprimir', methods=['POST'])
def endpoint_comprimir():
    """Ejecuta Huffman y Shannon-Fano sobre el mismo texto y devuelve ambos
    resultados normalizados junto con el algoritmo ganador por eficiencia."""
    texto, error_response, error_code = _obtener_texto()
    if error_response:
        return error_response, error_code

    res_h = AdminAlgoritmos.huffman(texto)
    res_sf = AdminAlgoritmos.shannon_fano(texto)

    def _normalizar(res):
        """Convierte la respuesta interna de AdminAlgoritmos al formato del frontend."""
        return {
            "codigo":            res.get("texto_comprimido", ""),
            "tasa":              round(res.get("tasa_compresion", 0) / 100, 4),
            "longitud_promedio": round(res.get("longitud_promedio_codigo", 0), 4),
            "eficiencia":        round(res.get("eficiencia", 0) / 100, 4),
        }

    huffman_norm = _normalizar(res_h)
    shannon_norm = _normalizar(res_sf)

    ef_h = huffman_norm["eficiencia"]
    ef_sf = shannon_norm["eficiencia"]
    if ef_h > ef_sf:
        ganador = "huffman"
    elif ef_sf > ef_h:
        ganador = "shannon_fano"
    else:
        ganador = "empate"

    return jsonify({
        "huffman":      huffman_norm,
        "shannon_fano": shannon_norm,
        "ganador":      ganador,
    })

