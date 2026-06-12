from flask import Blueprint, jsonify

prueba_bp = Blueprint('prueba', __name__)

@prueba_bp.route('/', methods=['GET'])
def get_prueba():
    respuesta = jsonify({"texto": "ESTO ES UNA PRUEBA"})
    return respuesta