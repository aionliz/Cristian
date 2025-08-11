# models/huella_model.py

from base.config.mysqlconnection import connectToMySQL
from flask import flash
import base64
import hashlib

class HuellaModel:
    """
    Modelo para gestionar las huellas dactilares de los alumnos
    Sistema integrado con DigitalPersona U.are.U 4500
    """
    db = "colegio_AML"

    def __init__(self, data):
        self.id_huella = data.get('id_huella')
        self.id_alumno = data['id_alumno']
        self.template_huella = data.get('template_huella')  # Template procesado
        self.hash_huella = data.get('hash_huella')  # Hash para comparación rápida
        self.calidad = data.get('calidad', 0)  # Calidad de la huella (0-100)
        self.dedo = data.get('dedo', 'indice_derecho')  # Qué dedo se registró
        self.activa = data.get('activa', True)
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')

    # --- Métodos de Clase ---

    @classmethod
    def save(cls, data):
        """
        Guarda una nueva huella en la base de datos.
        """
        query = """
            INSERT INTO huellas_dactilares (id_alumno, template_huella, hash_huella, calidad, dedo, activa) 
            VALUES (%(id_alumno)s, %(template_huella)s, %(hash_huella)s, %(calidad)s, %(dedo)s, %(activa)s);
        """
        return connectToMySQL(cls.db).query_db(query, data)

    @classmethod
    def create_fingerprint(cls, id_alumno, template_huella, hash_huella, calidad, dedo='indice_derecho'):
        """Crear nueva huella dactilar"""
        query = """
            INSERT INTO huellas_dactilares 
            (id_alumno, template_huella, hash_huella, calidad, dedo, activa) 
            VALUES (%(id_alumno)s, %(template_huella)s, %(hash_huella)s, %(calidad)s, %(dedo)s, 1)
        """
        data = {
            'id_alumno': id_alumno,
            'template_huella': template_huella,
            'hash_huella': hash_huella,
            'calidad': calidad,
            'dedo': dedo
        }
        return connectToMySQL(cls.db).query_db(query, data)

    @classmethod
    def update_fingerprint(cls, id_huella, template_huella, hash_huella, calidad):
        """Actualizar huella existente"""
        query = """
            UPDATE huellas_dactilares 
            SET template_huella = %(template_huella)s,
                hash_huella = %(hash_huella)s,
                calidad = %(calidad)s,
                updated_at = NOW()
            WHERE id_huella = %(id_huella)s
        """
        data = {
            'id_huella': id_huella,
            'template_huella': template_huella,
            'hash_huella': hash_huella,
            'calidad': calidad
        }
        return connectToMySQL(cls.db).query_db(query, data)

    @classmethod
    def get_by_student_id(cls, id_alumno):
        """Obtener huellas de un alumno específico"""
        query = """
            SELECT * FROM huellas_dactilares 
            WHERE id_alumno = %(id_alumno)s AND activa = 1
            ORDER BY created_at DESC
        """
        return connectToMySQL(cls.db).query_db(query, {'id_alumno': id_alumno})

    @classmethod
    def get_by_student_and_finger(cls, id_alumno, dedo):
        """Verificar si existe huella para un alumno en un dedo específico"""
        query = """
            SELECT * FROM huellas_dactilares 
            WHERE id_alumno = %(id_alumno)s AND dedo = %(dedo)s AND activa = 1
        """
        result = connectToMySQL(cls.db).query_db(query, {
            'id_alumno': id_alumno,
            'dedo': dedo
        })
        return result[0] if result else None

    @classmethod
    def get_by_id(cls, id_huella):
        """Obtener huella por ID"""
        query = """
            SELECT h.*, a.nombre, a.apellido_paterno, a.apellido_materno
            FROM huellas_dactilares h
            LEFT JOIN alumnos a ON h.id_alumno = a.id_alumno
            WHERE h.id_huella = %(id_huella)s
        """
        result = connectToMySQL(cls.db).query_db(query, {'id_huella': id_huella})
        return result[0] if result else None

    @classmethod
    def delete_fingerprint(cls, id_huella):
        """Eliminar huella (marcar como inactiva)"""
        query = """
            UPDATE huellas_dactilares 
            SET activa = 0, updated_at = NOW()
            WHERE id_huella = %(id_huella)s
        """
        return connectToMySQL(cls.db).query_db(query, {'id_huella': id_huella})

    @classmethod
    def verify_fingerprint(cls, hash_huella):
        """Verificar huella contra la base de datos y retornar información del alumno"""
        query = """
            SELECT h.id_huella, h.id_alumno, h.dedo, h.calidad,
                   a.nombre, a.apellido_paterno, a.apellido_materno,
                   c.nombre as curso
            FROM huellas_dactilares h
            LEFT JOIN alumnos a ON h.id_alumno = a.id_alumno
            LEFT JOIN cursos c ON a.id_curso_fk = c.id_curso
            WHERE h.hash_huella = %(hash_huella)s AND h.activa = 1 AND a.activo = 1
        """
        result = connectToMySQL(cls.db).query_db(query, {'hash_huella': hash_huella})
        return result[0] if result else None

    @classmethod
    def get_students_with_fingerprint_count(cls):
        """Contar alumnos que tienen huella registrada"""
        query = """
            SELECT COUNT(DISTINCT id_alumno) as count
            FROM huellas_dactilares 
            WHERE activa = 1
        """
        result = connectToMySQL(cls.db).query_db(query)
        return result[0]['count'] if result else 0

    @classmethod
    def get_all_with_student_info(cls):
        """Obtener todas las huellas con información del alumno"""
        query = """
            SELECT h.*, 
                   a.nombre, a.apellido_paterno, a.apellido_materno,
                   c.nombre as curso
            FROM huellas_dactilares h
            LEFT JOIN alumnos a ON h.id_alumno = a.id_alumno
            LEFT JOIN cursos c ON a.id_curso_fk = c.id_curso
            WHERE h.activa = 1 AND a.activo = 1
            ORDER BY a.apellido_paterno, a.nombre
        """
        return connectToMySQL(cls.db).query_db(query)
        results = connectToMySQL(cls.db).query_db(query, data)
        
        huellas = []
        if results:
            for row in results:
                huellas.append(cls(row))
        return huellas

    @classmethod
    def get_by_hash(cls, hash_huella):
        """
        Busca una huella por su hash para identificación rápida.
        """
        query = """
            SELECT h.*, a.nombre, a.apellido_paterno, a.apellido_materno, a.id_curso_fk
            FROM huellas_dactilares h
            JOIN alumnos a ON h.id_alumno = a.id_alumno
            WHERE h.hash_huella = %(hash_huella)s AND h.activa = 1 AND a.activo = 1;
        """
        data = {'hash_huella': hash_huella}
        result = connectToMySQL(cls.db).query_db(query, data)
        
        if result:
            return cls(result[0])
        return None

    @classmethod
    def search_similar_templates(cls, template_huella, threshold=0.8):
        """
        Busca templates similares en la base de datos.
        En un sistema real, esto se haría con un algoritmo de matching biométrico.
        """
        query = """
            SELECT h.*, a.nombre, a.apellido_paterno, a.apellido_materno
            FROM huellas_dactilares h
            JOIN alumnos a ON h.id_alumno = a.id_alumno
            WHERE h.activa = 1 AND a.activo = 1
            ORDER BY h.calidad DESC;
        """
        results = connectToMySQL(cls.db).query_db(query)
        
        # Aquí implementarías el algoritmo de matching real
        # Por ahora, devolvemos todas para simulación
        matches = []
        if results:
            for row in results:
                # En un sistema real, compararías el template_huella con cada resultado
                # usando algoritmos como minutiae matching
                match_score = cls.calculate_match_score(template_huella, row['template_huella'])
                if match_score >= threshold:
                    huella = cls(row)
                    huella.match_score = match_score
                    matches.append(huella)
        
        return sorted(matches, key=lambda x: x.match_score, reverse=True)

    @classmethod
    def update_huella(cls, id_huella, data):
        """
        Actualiza los datos de una huella.
        """
        query = """
            UPDATE huellas_dactilares 
            SET template_huella = %(template_huella)s, hash_huella = %(hash_huella)s,
                calidad = %(calidad)s, dedo = %(dedo)s, activa = %(activa)s,
                updated_at = NOW()
            WHERE id_huella = %(id_huella)s;
        """
        data['id_huella'] = id_huella
        return connectToMySQL(cls.db).query_db(query, data)

    @classmethod
    def delete_huella(cls, id_huella):
        """
        Desactiva una huella (soft delete).
        """
        query = """
            UPDATE huellas_dactilares 
            SET activa = 0, updated_at = NOW()
            WHERE id_huella = %(id_huella)s;
        """
        data = {'id_huella': id_huella}
        return connectToMySQL(cls.db).query_db(query, data)

    # --- Métodos Estáticos ---

    @classmethod
    def process_fingerprint_image(cls, image_data):
        """
        Procesar imagen de huella dactilar capturada por hardware DigitalPersona U.are.U 4500.
        Retorna: (template, hash_huella, calidad)
        """
        try:
            # Importar el driver DigitalPersona
            from base.hardware.hid_4500_driver import create_hid_4500_driver
            
            # Si image_data viene del hardware real (ya es un template)
            if isinstance(image_data, dict) and 'template_data' in image_data:
                template_data = image_data['template_data']
                quality = image_data.get('quality_score', 0)
                hash_value = image_data.get('hash_value')
                
                if not hash_value:
                    hash_value = cls.generate_fingerprint_hash(template_data)
                
                return base64.b64encode(template_data).decode(), hash_value, quality
            
            # Si es imagen cruda, procesarla
            else:
                # Usar OpenCV como fallback para procesar imágenes
                try:
                    import cv2
                    import numpy as np
                    
                    # Convertir bytes a imagen
                    nparr = np.frombuffer(image_data, np.uint8)
                    image = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
                    
                    if image is None:
                        return None, None, 0
                    
                    # Mejorar contraste
                    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
                    enhanced = clahe.apply(image)
                    
                    # Aplicar filtro Gabor para resaltar crestas
                    kernel = cv2.getGaborKernel((21, 21), 3, np.pi/4, 2*np.pi/3, 0.5, 0, ktype=cv2.CV_32F)
                    filtered = cv2.filter2D(enhanced, cv2.CV_8UC3, kernel)
                    
                    # Binarización adaptativa
                    binary = cv2.adaptiveThreshold(filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
                    
                    # Morfología para limpiar
                    kernel_morph = np.ones((2,2), np.uint8)
                    cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel_morph)
                    
                    # Redimensionar a tamaño estándar
                    template_image = cv2.resize(cleaned, (256, 256))
                    
                    # Convertir a template
                    template_data = template_image.tobytes()
                    template_b64 = base64.b64encode(template_data).decode()
                    
                    # Calcular hash
                    hash_huella = cls.generate_fingerprint_hash(template_data)
                    
                    # Calcular calidad basada en la imagen
                    calidad = cls._calculate_image_quality(template_image)
                    
                    return template_b64, hash_huella, calidad
                    
                except ImportError:
                    print("OpenCV no disponible para procesar imagen")
                    return None, None, 0
                except Exception as e:
                    print(f"Error procesando imagen: {e}")
                    return None, None, 0
            
        except Exception as e:
            print(f"Error general en process_fingerprint_image: {e}")
            return None, None, 0
    
    @classmethod
    def _calculate_image_quality(cls, image):
        """Calcular calidad de imagen de huella"""
        try:
            import cv2
            import numpy as np
            
            # Métricas de calidad
            
            # 1. Varianza (contraste)
            variance = np.var(image)
            contrast_score = min(100, variance / 100 * 100)
            
            # 2. Gradiente promedio (definición de bordes)
            grad_x = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=3)
            grad_y = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=3)
            gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
            gradient_score = min(100, np.mean(gradient_magnitude) / 50 * 100)
            
            # 3. Frecuencia dominante (patrón de crestas)
            f_transform = np.fft.fft2(image)
            f_shift = np.fft.fftshift(f_transform)
            magnitude_spectrum = np.log(np.abs(f_shift) + 1)
            freq_score = min(100, np.std(magnitude_spectrum) * 10)
            
            # 4. Cobertura del área útil
            non_zero_pixels = np.count_nonzero(image)
            total_pixels = image.shape[0] * image.shape[1]
            coverage_score = (non_zero_pixels / total_pixels) * 100
            
            # Combinar métricas con pesos
            quality = (
                contrast_score * 0.3 +
                gradient_score * 0.3 +
                freq_score * 0.2 +
                coverage_score * 0.2
            )
            
            return max(0, min(100, quality))
            
        except Exception as e:
            print(f"Error calculando calidad: {e}")
            return 50  # Calidad promedio por defecto

    @staticmethod
    def calculate_match_score(template1, template2):
        """
        Calcula el score de coincidencia entre dos templates.
        En un sistema real, usarías algoritmos de matching biométrico.
        """
        if not template1 or not template2:
            return 0.0
        
        # Simulación simple - en realidad compararías minutiae
        similarity = len(set(template1) & set(template2)) / len(set(template1) | set(template2))
        return similarity

    @staticmethod
    def validate_fingerprint_quality(quality_score):
        """
        Valida si la calidad de la huella es suficiente para registro.
        """
        MIN_QUALITY = 70  # Umbral mínimo de calidad
        return quality_score >= MIN_QUALITY

    @staticmethod
    def generate_fingerprint_hash(template):
        """
        Genera un hash único para búsqueda rápida.
        """
        if not template:
            return None
        return hashlib.md5(template.encode()).hexdigest()

    # --- Métodos de Instancia ---

    def to_dict(self):
        """
        Convierte el objeto a diccionario para serialización.
        """
        return {
            'id_huella': self.id_huella,
            'id_alumno': self.id_alumno,
            'calidad': self.calidad,
            'dedo': self.dedo,
            'activa': self.activa,
            'created_at': str(self.created_at) if self.created_at else None,
            'updated_at': str(self.updated_at) if self.updated_at else None
        }

    def get_alumno_info(self):
        """
        Obtiene información del alumno asociado a esta huella.
        """
        from base.models.alumno_model import AlumnoModel
        return AlumnoModel.get_by_id(self.id_alumno)
