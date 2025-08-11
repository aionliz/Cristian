# models/profesor_model.py

from base.config.mysqlconnection import connectToMySQL
from flask import flash
from datetime import datetime


class ProfesorModel:
    # Definimos el nombre de la base de datos
    db = "colegio_AML"

    def __init__(self, data):
        """
        Constructor del modelo de profesor.
        """
        self.id_profesor = data.get('id_profesor')
        self.nombre = data['nombre']
        self.apellido = data['apellido']
        self.email = data['email']
        self.especialidad = data.get('especialidad', '')
        self.id_asignatura_fk = data.get('id_asignatura_fk')
        self.activo = data.get('activo', 1)
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')

    @property
    def nombre_completo(self):
        """Retorna el nombre completo del profesor"""
        return f"{self.nombre} {self.apellido}"

    # --- Métodos de Clase ---

    @classmethod
    def get_all(cls):
        """
        Obtiene todos los profesores activos.
        """
        query = "SELECT * FROM profesores WHERE activo = 1 ORDER BY apellido, nombre;"
        results = connectToMySQL(cls.db).query_db(query)

        profesores = []
        if results:
            for row in results:
                profesores.append(cls(row))
        return profesores

    @classmethod
    def get_all_with_details(cls):
        """
        Obtiene todos los profesores activos con información completa de asignaturas y asignaciones.
        """
        query = """
        SELECT 
            p.*,
            asig.nombre as asignatura_nombre,
            COUNT(asignaciones.id_asignacion) as total_asignaciones,
            CONCAT(p.nombre, ' ', p.apellido) as nombre_completo
        FROM profesores p
        LEFT JOIN asignaturas asig ON p.id_asignatura_fk = asig.id_asignatura
        LEFT JOIN asignaciones ON p.id_profesor = asignaciones.id_profesor_fk AND asignaciones.activo = 1
        WHERE p.activo = 1
        GROUP BY p.id_profesor, p.nombre, p.apellido, p.email, p.especialidad, p.id_asignatura_fk, p.activo, p.created_at, p.updated_at, asig.nombre
        ORDER BY p.apellido, p.nombre
        """
        results = connectToMySQL(cls.db).query_db(query)
        return results if results else []

    @classmethod
    def get_by_id(cls, id_profesor):
        """
        Obtiene un profesor por su ID.
        """
        query = "SELECT * FROM profesores WHERE id_profesor = %(id_profesor)s;"
        data = {'id_profesor': id_profesor}
        results = connectToMySQL(cls.db).query_db(query, data)

        if results:
            return cls(results[0])
        return None

    @classmethod
    def get_disponibles(cls):
        """
        Obtiene profesores que están disponibles para asignaciones.
        """
        query = """
            SELECT p.* FROM profesores p
            WHERE p.activo = 1
            ORDER BY p.apellido, p.nombre;
        """
        results = connectToMySQL(cls.db).query_db(query)

        profesores = []
        if results:
            for row in results:
                profesores.append(cls(row))
        return profesores

    @classmethod
    def create(cls, profesor):
        """
        Crea un nuevo profesor.
        """
        try:
            query = """
                INSERT INTO profesores (nombre, apellido, email, especialidad, id_asignatura_fk, activo)
                VALUES (%(nombre)s, %(apellido)s, %(email)s, %(especialidad)s, %(id_asignatura_fk)s, %(activo)s)
            """
            data = {
                'nombre': profesor.nombre,
                'apellido': profesor.apellido,
                'email': profesor.email,
                'especialidad': profesor.especialidad,
                'id_asignatura_fk': profesor.id_asignatura_fk,
                'activo': profesor.activo
            }
            return connectToMySQL(cls.db).query_db(query, data)
        except Exception as e:
            print(f"Error en create: {e}")
            return False

    @classmethod
    def update(cls, id_profesor, data):
        """
        Actualiza un profesor existente.
        """
        try:
            query = """
                UPDATE profesores 
                SET nombre = %(nombre)s, apellido = %(apellido)s, email = %(email)s, 
                    especialidad = %(especialidad)s, id_asignatura_fk = %(id_asignatura_fk)s, 
                    activo = %(activo)s, updated_at = NOW()
                WHERE id_profesor = %(id_profesor)s
            """
            data['id_profesor'] = id_profesor
            return connectToMySQL(cls.db).query_db(query, data)
        except Exception as e:
            print(f"Error en update: {e}")
            return False

    @classmethod
    def delete(cls, id_profesor):
        """
        Elimina (desactiva) un profesor.
        """
        try:
            query = """
                UPDATE profesores 
                SET activo = 0, updated_at = NOW()
                WHERE id_profesor = %(id_profesor)s
            """
            data = {'id_profesor': id_profesor}
            return connectToMySQL(cls.db).query_db(query, data)
        except Exception as e:
            print(f"Error en delete: {e}")
            return False

    @classmethod
    def get_asignaciones(cls, id_profesor):
        """
        Obtiene las asignaciones de un profesor.
        """
        try:
            query = """
                SELECT a.*, 
                       asi.nombre as asignatura_nombre,
                       c.nivel, c.letra, c.nombre as curso_nombre,
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
                       END as nivel_texto,
                       CONCAT(
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
                           END, 
                           ' ', c.letra
                       ) as curso_completo,
                       YEAR(NOW()) as año
                FROM asignaciones a
                LEFT JOIN asignaturas asi ON a.id_asignatura_fk = asi.id_asignatura
                LEFT JOIN cursos c ON a.id_curso_fk = c.id_curso
                WHERE a.id_profesor_fk = %(id_profesor)s AND a.activo = 1
                ORDER BY c.nivel, c.letra, asi.nombre
            """
            data = {'id_profesor': id_profesor}
            return connectToMySQL(cls.db).query_db(query, data)
        except Exception as e:
            print(f"Error en get_asignaciones: {e}")
            return []

    @classmethod
    def get_stats_by_profesor(cls, id_profesor):
        """
        Obtiene estadísticas de un profesor.
        """
        try:
            query = """
                SELECT 
                    COUNT(DISTINCT id_asignatura) as total_asignaturas,
                    COUNT(DISTINCT id_curso) as total_cursos,
                    COUNT(*) as total_asignaciones
                FROM vista_asignaciones_completa
                WHERE id_profesor = %(id_profesor)s AND activo = 1
            """
            data = {'id_profesor': id_profesor}
            result = connectToMySQL(cls.db).query_db(query, data)
            return result[0] if result else {
                'total_asignaturas': 0,
                'total_cursos': 0,
                'total_asignaciones': 0
            }
        except Exception as e:
            print(f"Error en get_stats_by_profesor: {e}")
            return {
                'total_asignaturas': 0,
                'total_cursos': 0,
                'total_asignaciones': 0
            }

    @classmethod
    def validate_form(cls, form):
        """
        Valida los datos del formulario de profesor.
        """
        errors = []

        if 'nombre' not in form or not form['nombre'].strip():
            errors.append('El nombre es requerido')

        if 'apellido' not in form or not form['apellido'].strip():
            errors.append('El apellido es requerido')

        if 'email' not in form or not form['email'].strip():
            errors.append('El email es requerido')
        elif '@' not in form['email']:
            errors.append('El email debe tener un formato válido')

        return errors

    @classmethod
    def get_by_email(cls, email):
        """
        Obtiene un profesor por su email.
        """
        query = "SELECT * FROM profesores WHERE email = %(email)s AND activo = 1;"
        data = {'email': email}
        results = connectToMySQL(cls.db).query_db(query, data)

        if results:
            return cls(results[0])
        return None
