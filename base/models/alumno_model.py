# models/alumno_model.py

from base.config.mysqlconnection import connectToMySQL
from flask import flash
import re
from datetime import datetime

# Regex para validar email
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$')


class AlumnoModel:
    # Definimos el nombre de la base de datos
    db = "colegio_AML"

    def __init__(self, data):
        """
        Constructor del modelo de alumno.
        """
        self.id_alumno = data.get('id_alumno')
        self.nombre = data['nombre']
        self.apellido_paterno = data.get(
            'apellido_paterno', data.get('apellido', ''))
        self.apellido_materno = data.get('apellido_materno', '')
        # Compatibilidad con el template que usa 'apellido'
        self.apellido = self.apellido_paterno
        self.fecha_nacimiento = data.get('fecha_nacimiento')
        self.fecha_ingreso = data.get('fecha_ingreso')
        self.edad = data.get('edad')
        self.telefono = data.get('telefono')
        self.direccion = data.get('direccion')
        self.email = data.get('email')
        self.huella_dactilar = data.get('huella_dactilar')
        self.id_curso_fk = data.get('id_curso_fk')
        self.id_comuna_fk = data.get('id_comuna_fk')
        self.activo = data.get('activo', True)
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
        # Campos adicionales para relaciones
        self.curso_nombre = data.get('curso_nombre', '')

    # --- Métodos de Clase ---

    @classmethod
    def save(cls, data):
        """
        Guarda un nuevo alumno en la base de datos.
        """
        query = """
            INSERT INTO alumnos (nombre, apellido_paterno, apellido_materno, fecha_nacimiento, edad, 
                               telefono, direccion, email, huella_dactilar, id_curso_fk, id_comuna_fk, activo) 
            VALUES (%(nombre)s, %(apellido_paterno)s, %(apellido_materno)s, %(fecha_nacimiento)s, %(edad)s,
                   %(telefono)s, %(direccion)s, %(email)s, %(huella_dactilar)s, %(id_curso_fk)s, %(id_comuna_fk)s, %(activo)s);
        """
        return connectToMySQL(cls.db).query_db(query, data)

    @classmethod
    def create(cls, data):
        """
        Crea un nuevo alumno en la base de datos.
        """
        query = """
            INSERT INTO alumnos (nombre, apellido_paterno, apellido_materno, 
                               email, telefono, fecha_nacimiento, fecha_ingreso, 
                               id_curso_fk, direccion, activo, created_at, updated_at) 
            VALUES (%(nombre)s, %(apellido_paterno)s, %(apellido_materno)s,
                   %(email)s, %(telefono)s, %(fecha_nacimiento)s, %(fecha_ingreso)s,
                   %(id_curso_fk)s, %(direccion)s, %(activo)s, NOW(), NOW());
        """
        return connectToMySQL(cls.db).query_db(query, data)

    @classmethod
    def get_all(cls):
        """Obtiene todos los alumnos activos."""
        query = "SELECT * FROM alumnos WHERE activo = 1 ORDER BY apellido_paterno, nombre;"
        return connectToMySQL(cls.db).query_db(query)

    @classmethod
    def get_all_with_course(cls):
        """Obtiene todos los alumnos activos con información del curso."""
        query = """
            SELECT a.*, 
                   c.nombre as curso_nombre, 
                   c.nivel as curso_nivel, 
                   c.letra as curso_letra
            FROM alumnos a
            LEFT JOIN cursos c ON a.id_curso_fk = c.id_curso
            WHERE a.activo = 1 
            ORDER BY a.apellido_paterno, a.nombre;
        """
        results = connectToMySQL(cls.db).query_db(query)

        alumnos = []
        if results:
            for row in results:
                alumno = cls(row)
                # Agregar información del curso al objeto
                alumno.curso_nombre = row.get('curso_nombre', '')
                alumno.curso_nivel = row.get('curso_nivel', '')
                alumno.curso_letra = row.get('curso_letra', '')
                alumnos.append(alumno)
        return alumnos

    @classmethod
    def get_students_with_fingerprint_status(cls):
        """Obtener todos los alumnos con información sobre si tienen huella registrada"""
        query = """
            SELECT a.id_alumno, a.nombre, a.apellido_paterno, a.apellido_materno,
                   c.nombre as curso,
                   h.id_huella,
                   h.dedo,
                   h.calidad,
                   CASE WHEN h.id_huella IS NOT NULL THEN 1 ELSE 0 END as tiene_huella
            FROM alumnos a
            LEFT JOIN cursos c ON a.id_curso_fk = c.id_curso
            LEFT JOIN huellas_dactilares h ON a.id_alumno = h.id_alumno AND h.activa = 1
            WHERE a.activo = 1
            ORDER BY a.apellido_paterno, a.nombre
        """
        return connectToMySQL(cls.db).query_db(query)

    @classmethod
    def get_by_id(cls, id_alumno):
        """
        Obtiene un alumno por su ID con información del curso.
        """
        query = """
            SELECT a.*, c.nombre as nombre_curso, c.nivel, c.letra,
                   CASE 
                       WHEN c.nivel = 1 THEN '1° Básico'
                       WHEN c.nivel = 2 THEN '2° Básico'
                       WHEN c.nivel = 3 THEN '3° Básico'
                       WHEN c.nivel = 4 THEN '4° Básico'
                       WHEN c.nivel = 5 THEN '5° Básico'
                       WHEN c.nivel = 6 THEN '6° Básico'
                       WHEN c.nivel = 7 THEN '7° Básico'
                       WHEN c.nivel = 8 THEN '8° Básico'
                       WHEN c.nivel = 9 THEN '1° Medio'
                       WHEN c.nivel = 10 THEN '2° Medio'
                       WHEN c.nivel = 11 THEN '3° Medio'
                       WHEN c.nivel = 12 THEN '4° Medio'
                       ELSE CONCAT(c.nivel, '°')
                   END as nivel_texto
            FROM alumnos a
            LEFT JOIN cursos c ON a.id_curso_fk = c.id_curso
            WHERE a.id_alumno = %(id_alumno)s;
        """
        data = {'id_alumno': id_alumno}
        result = connectToMySQL(cls.db).query_db(query, data)

        if result:
            alumno = cls(result[0])
            # Agregar información del curso como atributos adicionales
            nivel_texto = result[0].get('nivel_texto', '')
            letra = result[0].get('letra', '')
            if nivel_texto and letra:
                alumno.nombre_curso = f"{nivel_texto} {letra}"
            else:
                alumno.nombre_curso = result[0].get('nombre_curso')
            alumno.nivel = result[0].get('nivel')
            alumno.letra = result[0].get('letra')
            return alumno
        return None

    @classmethod
    def get_by_email(cls, email):
        """
        Obtiene un alumno por su email.
        """
        query = "SELECT * FROM alumnos WHERE email = %(email)s;"
        data = {'email': email}
        result = connectToMySQL(cls.db).query_db(query, data)

        if result:
            return cls(result[0])
        return None

    @classmethod
    def get_by_curso(cls, id_curso):
        """
        Obtiene todos los alumnos de un curso específico.
        """
        query = """
            SELECT a.*, c.nombre as nombre_curso, c.nivel, c.letra, com.nombre as nombre_comuna
            FROM alumnos a
            LEFT JOIN cursos c ON a.id_curso_fk = c.id_curso
            LEFT JOIN comunas com ON a.id_comuna_fk = com.id_comuna
            WHERE a.id_curso_fk = %(id_curso)s AND a.activo = 1
            ORDER BY a.apellido_paterno, a.apellido_materno, a.nombre;
        """
        data = {'id_curso': id_curso}
        results = connectToMySQL(cls.db).query_db(query, data)

        alumnos = []
        if results:
            for row in results:
                alumnos.append(cls(row))
        return alumnos

    @classmethod
    def search(cls, term):
        """Buscar alumnos por nombre o apellido"""
        query = """
            SELECT a.*, c.nombre as curso_nombre
            FROM alumnos a
            LEFT JOIN cursos c ON a.id_curso_fk = c.id_curso
            WHERE a.activo = 1 AND (
                a.nombre LIKE %s OR 
                a.apellido_paterno LIKE %s OR 
                a.apellido_materno LIKE %s OR
                CONCAT(a.nombre, ' ', a.apellido_paterno) LIKE %s OR
                CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', a.apellido_materno) LIKE %s OR
                a.email LIKE %s
            )
            ORDER BY a.apellido_paterno, a.nombre
            LIMIT 20
        """
        search_term = f"%{term}%"
        results = connectToMySQL(cls.db).query_db(
            query, (search_term, search_term, search_term, search_term, search_term, search_term))

        alumnos = []
        if results:
            for row in results:
                alumno = cls(row)
                alumno.curso = row.get('curso_nombre', '')
                alumnos.append(alumno)

        return alumnos

    @classmethod
    def from_db_row(cls, row):
        """
        Crea una instancia del modelo desde una fila de la base de datos.
        """
        return cls(row)

    @classmethod
    def search_alumnos(cls, nombre):
        """
        Busca alumnos por nombre (búsqueda parcial).
        """
        query = """
            SELECT a.*, c.nombre_curso 
            FROM alumnos a 
            LEFT JOIN cursos c ON a.id_curso_fk = c.id 
            WHERE a.activo = 1 
            AND (a.nombre LIKE %(nombre)s 
                 OR a.apellido_paterno LIKE %(nombre)s 
                 OR a.apellido_materno LIKE %(nombre)s 
                 OR CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', a.apellido_materno) LIKE %(nombre)s)
            ORDER BY a.apellido_paterno, a.apellido_materno, a.nombre;
        """
        data = {"nombre": f"%{nombre}%"}
        results = connectToMySQL(cls.db).query_db(query, data)
        alumnos = []
        if results:
            for row in results:
                alumnos.append(cls.from_db_row(row))
        return alumnos

    @classmethod
    def update(cls, id_alumno, data):
        """
        Actualiza los datos de un alumno.
        """
        # Construir la query dinámicamente solo con los campos que se proporcionan
        set_clauses = []
        allowed_fields = ['nombre', 'apellido_paterno', 'apellido_materno', 'fecha_nacimiento',
                          'telefono', 'direccion', 'email', 'id_curso_fk', 'activo', 'fecha_ingreso']

        # Solo incluir campos que existen en data y están permitidos
        for field in allowed_fields:
            if field in data:
                set_clauses.append(f"{field} = %({field})s")

        if not set_clauses:
            return False

        query = f"""
            UPDATE alumnos 
            SET {', '.join(set_clauses)}, updated_at = NOW()
            WHERE id_alumno = %(id_alumno)s;
        """
        data['id_alumno'] = id_alumno

        try:
            result = connectToMySQL(cls.db).query_db(query, data)
            return True  # Si llega aquí, la operación fue exitosa
        except Exception as e:
            print(f"Something went wrong {e}")
            return False

    @classmethod
    def delete(cls, id_alumno):
        """
        Desactiva un alumno (soft delete).
        """
        query = """
            UPDATE alumnos 
            SET activo = 0, updated_at = NOW()
            WHERE id_alumno = %(id_alumno)s;
        """
        data = {'id_alumno': id_alumno}
        return connectToMySQL(cls.db).query_db(query, data)

    @classmethod
    def search(cls, search_term):
        """
        Busca alumnos por nombre, apellidos o email.
        """
        query = """
            SELECT a.*, c.nombre as nombre_curso, c.nivel, c.letra, com.nombre as nombre_comuna
            FROM alumnos a
            LEFT JOIN cursos c ON a.id_curso_fk = c.id_curso
            LEFT JOIN comunas com ON a.id_comuna_fk = com.id_comuna
            WHERE a.activo = 1 AND (
                a.nombre LIKE %(search)s OR 
                a.apellido_paterno LIKE %(search)s OR 
                a.apellido_materno LIKE %(search)s OR
                a.email LIKE %(search)s OR
                CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', a.apellido_materno) LIKE %(search)s
            )
            ORDER BY a.apellido_paterno, a.apellido_materno, a.nombre;
        """
        data = {'search': f'%{search_term}%'}
        results = connectToMySQL(cls.db).query_db(query, data)

        alumnos = []
        if results:
            for row in results:
                alumnos.append(cls(row))
        return alumnos

    # --- Métodos de Instancia ---

    def nombre_completo(self):
        """
        Retorna el nombre completo del alumno.
        """
        return f"{self.nombre} {self.apellido_paterno} {self.apellido_materno}"

    def to_dict(self):
        """
        Convierte el objeto a diccionario para serialización.
        """
        return {
            'id_alumno': self.id_alumno,
            'nombre': self.nombre,
            'apellido_paterno': self.apellido_paterno,
            'apellido_materno': self.apellido_materno,
            'nombre_completo': self.nombre_completo(),
            'fecha_nacimiento': str(self.fecha_nacimiento) if self.fecha_nacimiento else None,
            'telefono': self.telefono,
            'direccion': self.direccion,
            'email': self.email,
            'id_curso_fk': self.id_curso_fk,
            'activo': self.activo
        }

    # --- Métodos Estáticos ---

    @staticmethod
    def validate_formulario(form):
        """
        Valida los datos del formulario para crear/editar alumno.
        """
        errores = []

        # Validar nombre
        if 'nombre' not in form or not form['nombre'] or len(form['nombre'].strip()) < 2:
            errores.append("El nombre debe tener al menos 2 caracteres.")

        # Validar apellido paterno
        if 'apellido_paterno' not in form or not form['apellido_paterno'] or len(form['apellido_paterno'].strip()) < 2:
            errores.append(
                "El apellido paterno debe tener al menos 2 caracteres.")

        # Validar apellido materno
        if 'apellido_materno' not in form or not form['apellido_materno'] or len(form['apellido_materno'].strip()) < 2:
            errores.append(
                "El apellido materno debe tener al menos 2 caracteres.")

        # Validar email
        if 'email' not in form or not EMAIL_REGEX.match(form['email']):
            errores.append("El email debe tener un formato válido.")

        # Validar curso
        if 'id_curso_fk' not in form or not form['id_curso_fk']:
            errores.append("Debe seleccionar un curso.")

        # Validar fecha de nacimiento
        if 'fecha_nacimiento' in form and form['fecha_nacimiento']:
            try:
                fecha_nacimiento = datetime.strptime(
                    form['fecha_nacimiento'], '%Y-%m-%d')
                hoy = datetime.now()
                edad_maxima = hoy.replace(year=hoy.year - 80)
                edad_minima = hoy.replace(year=hoy.year - 5)

                if fecha_nacimiento < edad_maxima or fecha_nacimiento > edad_minima:
                    errores.append(
                        "La fecha de nacimiento debe estar entre 5 y 80 años.")
            except ValueError:
                errores.append(
                    "La fecha de nacimiento debe tener formato válido.")

        return errores
