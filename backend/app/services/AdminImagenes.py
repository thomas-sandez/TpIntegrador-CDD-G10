import os
import uuid
import cv2
import numpy as np
from datetime import datetime


# Ruta absoluta al directorio uploads (backend/uploads/)
# __file__ está en backend/app/services/, subimos 3 niveles para llegar a backend/
DIRECTORIO = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'uploads')
os.makedirs(DIRECTORIO, exist_ok=True)

class AdminImagenes:

    @staticmethod
    def cuantizar_canales(imagen, bits_por_canal):
        if bits_por_canal >= 8:
            return imagen
        niveles = 2 ** bits_por_canal
        return (imagen // (256 // niveles) * (255 // (niveles - 1))).astype(np.uint8)
    
    @staticmethod
    def guardar_imagen(archivo):
        from app import db
        from app.models.imagen import Imagen

        imagen_id = str(uuid.uuid4())
        ruta_archivo = os.path.join(DIRECTORIO, f"{imagen_id}.jpg")

        archivo.save(ruta_archivo)

        nueva_imagen = Imagen(id_imagen=imagen_id, ruta=ruta_archivo, fecha_subida=datetime.now())
        db.session.add(nueva_imagen)
        db.session.commit()

        return nueva_imagen
    

    @staticmethod
    def obtener_lista_ids():
        from app.models.imagen import Imagen
        imagenes = Imagen.query.order_by(Imagen.fecha_subida.desc()).all()
        return [imagen.id_imagen for imagen in imagenes]
    

    @staticmethod
    def obtener_ruta_original(id_imagen):
        from app.models.imagen import Imagen
        imagen = Imagen.query.get(id_imagen)
        if not imagen or not os.path.exists(imagen.ruta):
            return None
        return imagen.ruta
    

    @classmethod
    def procesar_digitalizacion(cls, id_imagen, ancho, alto, bits_por_canal):
        from app.models.imagen import Imagen
        imagen_db = Imagen.query.get(id_imagen)
        if not imagen_db or not os.path.exists(imagen_db.ruta):
            return None
        
        imagen = cv2.imread(imagen_db.ruta)
        imagen_redimensionada = cv2.resize(imagen, (ancho, alto), interpolation=cv2.INTER_AREA)

        blue, green, red = cv2.split(imagen_redimensionada)
        blue_cuantizado = cls.cuantizar_canales(blue, bits_por_canal)
        green_cuantizado = cls.cuantizar_canales(green, bits_por_canal)
        red_cuantizado = cls.cuantizar_canales(red, bits_por_canal)
        imagen_cuantizada = cv2.merge((blue_cuantizado, green_cuantizado, red_cuantizado))

        archivo_temporal = os.path.join(DIRECTORIO, f"{id_imagen}_procesada.jpg")
        cv2.imwrite(archivo_temporal, imagen_cuantizada)
        return archivo_temporal


    @classmethod
    def procesar_compresion(cls, id_imagen, ancho, alto, bits_por_canal, calidad):
        digitalizacion = cls.procesar_digitalizacion(id_imagen, ancho, alto, bits_por_canal)
        if not digitalizacion:
            return None
        
        imagen_cuantizada = cv2.imread(digitalizacion)

        archivo_comprimido = os.path.join(DIRECTORIO, f"{id_imagen}_comprimida.jpg")
        cv2.imwrite(archivo_comprimido, imagen_cuantizada, [cv2.IMWRITE_JPEG_QUALITY, calidad])
        return archivo_comprimido