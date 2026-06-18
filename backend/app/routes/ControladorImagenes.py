from flask import Blueprint, jsonify, request, send_file

# imports de servicios
from app.services.AdminImagenes import AdminImagenes

controlador_imagenes_bp = Blueprint('controlador_imagenes', __name__)


def validar_resolucion(resolucion_str):
    try:
        ancho, alto = map(int, resolucion_str.split('x'))
        if ancho <= 0 or alto <= 0:
            raise ValueError
        return ancho, alto
    except (ValueError, AttributeError):
        return None, None


@controlador_imagenes_bp.route('/upload', methods=['POST'])
def subir_imagen():
    if 'file' not in request.files:
        return jsonify({"error": "No se ha proporcionado ningún archivo"}), 400
    
    archivo = request.files['file']
    if archivo.filename == '':
        return jsonify({"error": "Archivo invalido"}), 400
    
    id_imagen = AdminImagenes.guardar_imagen(archivo)
    return jsonify({"id_imagen": id_imagen.id_imagen}), 201


@controlador_imagenes_bp.route('/images', methods=['GET'])
def obtener_imagenes():
    lista_ids = AdminImagenes.obtener_lista_ids()
    return jsonify({"imagenes": lista_ids}), 200


@controlador_imagenes_bp.route('/image/<string:id_imagen>/original', methods=['GET'])
def obtener_imagen_original(id_imagen):
    ruta = AdminImagenes.obtener_ruta_original(id_imagen)
    if not ruta:
        return jsonify({"error": "Imagen no encontrada"}), 404
    return send_file(ruta, mimetype='image/jpeg')


@controlador_imagenes_bp.route('/image/<string:id_imagen>/digitized', methods=['GET'])
def obtener_imagen_digitalizada(id_imagen):
    resolucion = request.args.get('resolucion')
    bits_por_canal = request.args.get('bits_por_canal', type=int)

    ancho, alto = validar_resolucion(resolucion)
    if not ancho or not alto:
        return jsonify({"error": "Resolución inválida. Use formato 'anchoxalto' (ej: '100x100')"}), 400
    
    if bits_por_canal is None or bits_por_canal <= 0:
        return jsonify({"error": "bits_por_canal debe ser un entero positivo"}), 400
    
    ruta_imagen = AdminImagenes.procesar_digitalizacion(id_imagen, ancho, alto, bits_por_canal)
    if not ruta_imagen:
        return jsonify({"error": "Imagen no encontrada o error al procesar"}), 404
    
    return send_file(ruta_imagen, mimetype='image/jpeg')


@controlador_imagenes_bp.route('/image/<string:id_imagen>/compressed', methods=['GET'])
def obtener_imagen_comprimida(id_imagen):
    resolucion = request.args.get('resolucion')
    bits_por_canal = request.args.get('bits_por_canal', type=int)
    calidad = request.args.get('calidad', type=int)

    ancho, alto = validar_resolucion(resolucion)
    if not ancho or not alto:
        return jsonify({"error": "Resolución inválida. Use formato 'anchoxalto' (ej: '100x100')"}), 400
    
    if bits_por_canal is None or bits_por_canal <= 0:
        return jsonify({"error": "bits_por_canal debe ser un entero positivo"}), 400
    
    if calidad is None or not (0 <= calidad <= 100):
        return jsonify({"error": "calidad debe ser un entero entre 0 y 100"}), 400
    
    ruta_imagen = AdminImagenes.procesar_compresion(id_imagen, ancho, alto, bits_por_canal, calidad)
    if not ruta_imagen:
        return jsonify({"error": "Imagen no encontrada o error al procesar"}), 404
    
    return send_file(ruta_imagen, mimetype='image/jpeg')