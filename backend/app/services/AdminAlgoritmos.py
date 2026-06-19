import heapq
import math
from collections import Counter, deque
from pathlib import Path
from xml.sax.saxutils import escape


class NodoHuffman:
    def __init__(self, caracter, frecuencia):
        self.caracter = caracter
        self.frecuencia = frecuencia
        self.izquierda = None
        self.derecha = None

    def __lt__(self, otro):
        return self.frecuencia < otro.frecuencia


class NodoTrie:
    def __init__(self, caracter=None):
        self.caracter = caracter
        self.hijos = {}
        self.x = 0
        self.y = 0


class AdminAlgoritmos:
    @staticmethod
    def _frecuencias(texto):
        return Counter(texto)

    @staticmethod
    def _calcular_entropia(frecuencias, total_caracteres):
        if total_caracteres == 0:
            return 0
        entropia = 0
        for freq in frecuencias.values():
            probabilidad = freq / total_caracteres
            if probabilidad > 0:
                entropia -= probabilidad * math.log2(probabilidad)
        return entropia

    @staticmethod
    def _calcular_tasa_compresion(texto_original, texto_comprimido):
        if not texto_original:
            return 0
        tamano_original_bits = len(texto_original) * 8
        tamano_comprimido_bits = len(texto_comprimido)
        if tamano_original_bits == 0:
            return 0
        return ((tamano_original_bits - tamano_comprimido_bits) / tamano_original_bits) * 100

    @staticmethod
    def _calcular_eficiencia(entropia, longitud_promedio):
        if longitud_promedio == 0:
            return 0
        return (entropia / longitud_promedio) * 100

    @staticmethod
    def _ruta_static():
        return Path(__file__).resolve().parents[1] / "static" / "algoritmos"

    @classmethod
    def _guardar_svg(cls, nombre_base, texto, contenido_svg):
        carpeta = cls._ruta_static()
        carpeta.mkdir(parents=True, exist_ok=True)
        nombre_archivo = f"{nombre_base}_{abs(hash(texto))}.svg"
        ruta = carpeta / nombre_archivo
        ruta.write_text(contenido_svg, encoding='utf-8')
        return f"/static/algoritmos/{nombre_archivo}"

    @classmethod
    def _generar_svg_arbol_trie(cls, codigos, nombre_base, texto, titulo):
        raiz = NodoTrie()
        for caracter, codigo in codigos.items():
            nodo_actual = raiz
            for bit in codigo:
                nodo_actual = nodo_actual.hijos.setdefault(bit, NodoTrie())
            nodo_actual.caracter = caracter

        # Layout por niveles
        niveles = {}
        cola = deque([(raiz, 0)])
        max_depth = 0
        while cola:
            nodo, profundidad = cola.popleft()
            niveles.setdefault(profundidad, []).append(nodo)
            max_depth = max(max_depth, profundidad)
            for bit in sorted(nodo.hijos.keys()):
                cola.append((nodo.hijos[bit], profundidad + 1))

        max_nodes_por_nivel = max((len(nodos) for nodos in niveles.values()), default=1)
        ancho_canvas = max(1000, max_nodes_por_nivel * 140)
        alto_canvas = max(400, (max_depth + 1) * 140)

        for profundidad, nodos in niveles.items():
            cantidad = len(nodos)
            for indice, nodo in enumerate(nodos):
                nodo.x = 50 + (indice + 0.5) * (ancho_canvas - 100) / max(1, cantidad)
                nodo.y = 50 + profundidad * 120

        # Construcción SVG
        lineas = []
        circulos = []
        textos = []

        for nodo in [raiz]:
            pass

        # Recorrer todo el trie para dibujar líneas y nodos
        cola = deque([raiz])
        while cola:
            nodo = cola.popleft()
            for bit, hijo in sorted(nodo.hijos.items()):
                lineas.append(
                    f'<line x1="{nodo.x:.1f}" y1="{nodo.y:.1f}" x2="{hijo.x:.1f}" y2="{hijo.y:.1f}" '
                    f'stroke="#444" stroke-width="2" marker-end="url(#arrow)" />'
                )
                lineas.append(
                    f'<text x="{(nodo.x + hijo.x) / 2:.1f}" y="{(nodo.y + hijo.y) / 2 - 8:.1f}" '
                    f'text-anchor="middle" font-size="12" fill="#222">{bit}</text>'
                )
                cola.append(hijo)

        # Dibujar nodos
        def dibujar_nodo(nodo, es_raiz=False):
            if es_raiz:
                circulos.append(
                    f'<ellipse cx="{nodo.x:.1f}" cy="{nodo.y:.1f}" rx="22" ry="22" fill="#f3f4f6" stroke="#111" stroke-width="2" />'
                )
                textos.append(
                    f'<text x="{nodo.x:.1f}" y="{nodo.y:.1f}" text-anchor="middle" dominant-baseline="middle" '
                    f'font-size="12" fill="#111">Raíz</text>'
                )
            elif nodo.caracter is not None:
                circulos.append(
                    f'<ellipse cx="{nodo.x:.1f}" cy="{nodo.y:.1f}" rx="22" ry="22" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2" />'
                )
                textos.append(
                    f'<text x="{nodo.x:.1f}" y="{nodo.y:.1f}" text-anchor="middle" dominant-baseline="middle" '
                    f'font-size="14" fill="#111">{escape(str(nodo.caracter))}</text>'
                )
            else:
                circulos.append(
                    f'<ellipse cx="{nodo.x:.1f}" cy="{nodo.y:.1f}" rx="18" ry="18" fill="#eef2ff" stroke="#6b7280" stroke-width="1.5" />'
                )

        dibujar_nodo(raiz, es_raiz=True)
        cola = deque([raiz])
        while cola:
            nodo = cola.popleft()
            for hijo in nodo.hijos.values():
                dibujar_nodo(hijo)
                cola.append(hijo)

        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{ancho_canvas}" height="{alto_canvas}" viewBox="0 0 {ancho_canvas} {alto_canvas}">
                    <defs>
                      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L6,3 z" fill="#444" />
                      </marker>
                    </defs>
                    <rect width="100%" height="100%" fill="#ffffff"/>
                    <text x="20" y="25" font-size="18" font-weight="bold" fill="#111">{escape(titulo)}</text>
                    {''.join(lineas)}
                    {''.join(circulos)}
                    {''.join(textos)}
                  </svg>'''

        return cls._guardar_svg(nombre_base, texto, svg)

    @classmethod
    def huffman(cls, texto):
        if not isinstance(texto, str) or not texto:
            return {
                "error": "El texto no puede estar vacío"
            }

        frecuencias = cls._frecuencias(texto)
        total_caracteres = len(texto)

        cola = []
        for caracter, freq in frecuencias.items():
            nodo = NodoHuffman(caracter, freq)
            heapq.heappush(cola, (nodo.frecuencia, nodo))

        while len(cola) > 1:
            _, nodo_izq = heapq.heappop(cola)
            _, nodo_der = heapq.heappop(cola)
            padre = NodoHuffman(None, nodo_izq.frecuencia + nodo_der.frecuencia)
            padre.izquierda = nodo_izq
            padre.derecha = nodo_der
            heapq.heappush(cola, (padre.frecuencia, padre))

        raiz = cola[0][1] if cola else None
        diccionario = {}

        def asignar_codigos(nodo, codigo):
            if nodo is None:
                return
            if nodo.caracter is not None:
                diccionario[nodo.caracter] = codigo or "0"
                return
            asignar_codigos(nodo.izquierda, codigo + "0")
            asignar_codigos(nodo.derecha, codigo + "1")

        asignar_codigos(raiz, "")
        texto_comprimido = ''.join(diccionario[caracter] for caracter in texto)

        longitud_promedio = sum(
            (freq / total_caracteres) * len(diccionario[caracter])
            for caracter, freq in frecuencias.items()
        )
        entropia = cls._calcular_entropia(frecuencias, total_caracteres)
        tasa_compresion = cls._calcular_tasa_compresion(texto, texto_comprimido)
        eficiencia = cls._calcular_eficiencia(entropia, longitud_promedio)

        resultado = {
            "metodo": "Huffman",
            "texto_original": texto,
            "frecuencias": dict(sorted(frecuencias.items())),
            "codigos": dict(sorted(diccionario.items())),
            "texto_comprimido": texto_comprimido,
            "entropia": entropia,
            "longitud_promedio_codigo": longitud_promedio,
            "tasa_compresion": tasa_compresion,
            "eficiencia": eficiencia,
        }
        resultado["ruta_imagen"] = cls._generar_svg_arbol_trie(
            diccionario,
            "huffman",
            texto,
            "Árbol de Huffman"
        )
        return resultado

    @classmethod
    def shannon_fano(cls, texto):
        if not isinstance(texto, str) or not texto:
            return {
                "error": "El texto no puede estar vacío"
            }

        frecuencias = cls._frecuencias(texto)
        total_caracteres = len(texto)

        def obtener_frecuencia(tupla):
            return tupla[1]

        grupo_ordenado = sorted(frecuencias.items(), key=obtener_frecuencia, reverse=True)

        def dividir_grupo(grupo):
            if len(grupo) <= 1:
                return grupo, []
            total = sum(freq for _, freq in grupo)
            mejor_punto = -1
            minima_diferencia = float('inf')
            for i in range(1, len(grupo)):
                suma_izq = sum(freq for _, freq in grupo[:i])
                suma_der = total - suma_izq
                diferencia = abs(suma_izq - suma_der)
                if diferencia < minima_diferencia:
                    minima_diferencia = diferencia
                    mejor_punto = i
            return grupo[:mejor_punto], grupo[mejor_punto:]

        codigos = {}

        def asignar_codigos(grupo, codigo_actual=''):
            if len(grupo) == 1:
                caracter = grupo[0][0]
                codigos[caracter] = codigo_actual or '0'
                return
            izquierda, derecha = dividir_grupo(grupo)
            asignar_codigos(izquierda, codigo_actual + '0')
            asignar_codigos(derecha, codigo_actual + '1')

        asignar_codigos(grupo_ordenado)
        texto_comprimido = ''.join(codigos[caracter] for caracter in texto)

        longitud_promedio = sum(
            (freq / total_caracteres) * len(codigos[caracter])
            for caracter, freq in frecuencias.items()
        )
        entropia = cls._calcular_entropia(frecuencias, total_caracteres)
        tasa_compresion = cls._calcular_tasa_compresion(texto, texto_comprimido)
        eficiencia = cls._calcular_eficiencia(entropia, longitud_promedio)

        resultado = {
            "metodo": "Shannon-Fano",
            "texto_original": texto,
            "frecuencias": dict(sorted(frecuencias.items())),
            "codigos": dict(sorted(codigos.items())),
            "texto_comprimido": texto_comprimido,
            "entropia": entropia,
            "longitud_promedio_codigo": longitud_promedio,
            "tasa_compresion": tasa_compresion,
            "eficiencia": eficiencia,
        }
        resultado["ruta_imagen"] = cls._generar_svg_arbol_trie(
            codigos,
            "shannon_fano",
            texto,
            "Árbol de Shannon-Fano"
        )
        return resultado

    @classmethod
    def hamming(cls, texto):
        if not isinstance(texto, str) or not texto:
            return {
                "error": "El texto no puede estar vacío"
            }

        def texto_a_bits(texto_entrada):
            texto_entrada = texto_entrada.strip()
            if texto_entrada and all(ch in '01' for ch in texto_entrada):
                return [int(bit) for bit in texto_entrada]
            return [int(bit) for parte in (format(ord(caracter), '08b') for caracter in texto_entrada) for bit in parte]

        def bits_a_texto(bits, original_is_binary=False):
            if original_is_binary:
                return ''.join(str(bit) for bit in bits)

            texto_decodificado = []
            for i in range(0, len(bits), 8):
                bloque = bits[i:i + 8]
                if len(bloque) < 8:
                    bloque = bloque + [0] * (8 - len(bloque))
                texto_decodificado.append(chr(int(''.join(str(bit) for bit in bloque), 2)))
            return ''.join(texto_decodificado)

        def codificar(bits_datos):
            bits_datos = [int(bit) for bit in bits_datos]
            long_datos = len(bits_datos)
            bits_paridad = 0
            while (2 ** bits_paridad) < (long_datos + bits_paridad + 1):
                bits_paridad += 1
            long_total = long_datos + bits_paridad
            codificacion = [0] * long_total
            i = 0
            for j in range(long_total):
                if not math.log2(j + 1).is_integer():
                    codificacion[j] = bits_datos[i]
                    i += 1
            for i in range(long_total):
                pos_recorrido = i + 1
                if math.log2(pos_recorrido).is_integer():
                    paridad = 0
                    for j in range(long_total):
                        if (j + 1) & pos_recorrido and j != i:
                            paridad ^= codificacion[j]
                    codificacion[i] = paridad
            return codificacion

        def decodificar(bits_entrada):
            bits_entrada = [int(bit) for bit in bits_entrada]
            long_entrada = len(bits_entrada)
            bits_paridad = int(math.log2(long_entrada + 1))
            pos_error = 0
            for i in range(bits_paridad):
                pos_bit_paridad = 2 ** i
                paridad = 0
                for j in range(long_entrada):
                    if (j + 1) & pos_bit_paridad:
                        paridad ^= bits_entrada[j]
                if paridad != 0:
                    pos_error += pos_bit_paridad
            if pos_error != 0:
                pos_error -= 1
                bits_entrada[pos_error] ^= 1
            bits_datos = []
            for i in range(long_entrada):
                if not math.log2(i + 1).is_integer():
                    bits_datos.append(bits_entrada[i])
            return bits_datos

        es_binario = bool(texto.strip()) and all(ch in '01' for ch in texto.strip())
        bits_originales = texto_a_bits(texto)
        bits_codificados = codificar(bits_originales)
        bits_decodificados = decodificar(bits_codificados)
        texto_decodificado = bits_a_texto(bits_decodificados, original_is_binary=es_binario)

        return {
            "metodo": "Hamming",
            "texto_original": texto,
            "bits_originales": bits_originales,
            "bits_codificados": bits_codificados,
            "bits_decodificados": bits_decodificados,
            "texto_decodificado": texto_decodificado,
            "texto_binario_original": ''.join(str(bit) for bit in bits_originales) if es_binario else None,
            "longitud_bits_original": len(bits_originales),
            "longitud_bits_codificados": len(bits_codificados),
            "longitud_bits_decodificados": len(bits_decodificados),
            "original_es_binario": es_binario,
        }

    # ── Hamming bit-level helpers (usados por la UI de bits) ─────────────────

    @staticmethod
    def hamming_codificar_bits(bits_datos):
        """Codifica una lista de bits de datos con Hamming y devuelve el código completo.

        Para Hamming(7,4): recibe 4 bits de datos y genera 7 bits con 3 de paridad
        en posiciones 1, 2 y 4 (1-indexed).

        Args:
            bits_datos: lista de ints (0/1), ej. [1, 0, 1, 1]

        Returns:
            dict con bits_codificados (7 ints), posiciones de paridad y longitudes.
        """
        import math
        bits_datos = [int(b) for b in bits_datos]
        n = len(bits_datos)
        bits_paridad = 0
        while (2 ** bits_paridad) < (n + bits_paridad + 1):
            bits_paridad += 1
        long_total = n + bits_paridad

        code = [0] * long_total
        # Colocar bits de datos en posiciones que no son potencias de 2
        i = 0
        for j in range(long_total):
            if not math.log2(j + 1).is_integer():
                code[j] = bits_datos[i]
                i += 1

        # Calcular bits de paridad
        paridad_positions = []
        for i in range(long_total):
            pos = i + 1
            if math.log2(pos).is_integer():
                paridad = 0
                for j in range(long_total):
                    if (j + 1) & pos and j != i:
                        paridad ^= code[j]
                code[i] = paridad
                paridad_positions.append(pos)

        return {
            "bits_datos":           bits_datos,
            "bits_codificados":     code,
            "posiciones_paridad":   paridad_positions,
            "longitud_bits_original":    n,
            "longitud_bits_codificados": long_total,
            "longitud_bits_decodificados": n,
        }

    @staticmethod
    def hamming_decodificar_bits(bits_entrada):
        """Decodifica un código Hamming, detecta y corrige hasta 1 error.

        Para Hamming(7,4): recibe 7 bits y devuelve los 4 bits de datos corregidos.

        Args:
            bits_entrada: lista de ints (0/1), ej. [0, 1, 1, 0, 0, 1, 1]

        Returns:
            dict con bits_decodificados (4 ints), error_posicion (0 si no hay error),
            bits_corregidos (los 7 bits después de corregir) y longitudes.
        """
        import math
        bits = [int(b) for b in bits_entrada]
        long_entrada = len(bits)
        bits_paridad = int(math.log2(long_entrada + 1))

        pos_error = 0
        for i in range(bits_paridad):
            pos_bit = 2 ** i
            paridad = 0
            for j in range(long_entrada):
                if (j + 1) & pos_bit:
                    paridad ^= bits[j]
            if paridad != 0:
                pos_error += pos_bit

        bits_corregidos = bits[:]
        if pos_error != 0:
            bits_corregidos[pos_error - 1] ^= 1

        # Extraer bits de datos (posiciones que no son potencias de 2)
        bits_datos = [
            bits_corregidos[i]
            for i in range(long_entrada)
            if not math.log2(i + 1).is_integer()
        ]

        return {
            "bits_decodificados":        bits_datos,
            "bits_corregidos":           bits_corregidos,
            "error_posicion":            pos_error,
            "longitud_bits_original":    long_entrada,
            "longitud_bits_codificados": long_entrada,
            "longitud_bits_decodificados": len(bits_datos),
        }

