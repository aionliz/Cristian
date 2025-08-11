# models/asignacion_model.py

from base.config.mysqlconnection import connectToMySQL
from flask import flash


class AsignacionModel:
    # Definimos el nombre de la base de datos
    db = "colegio_AML"

    def __init__(self, data):
        self.id_asignacion = data.get('id_asignacion')
        self.id_asignatura_fk = data.get(
            'id_asignatura') or data.get('id_asignatura_fk')
        self.id_curso_fk = data.get('id_curso') or data.get('id_curso_fk')
        self.id_profesor_fk = data.get(
            'id_profesor') or data.get('id_profesor_fk')
        self.activo = data.get('activo', 1)
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')

    # --- Métodos de Clase ---

    @classmethod
    def create(cls, asignacion):
        """Crear una nueva asignación"""
        try:
            # Verificar que la asignación no exista ya
            if cls.exists_asignacion(asignacion.id_asignatura_fk, asignacion.id_curso_fk):
                return False

            query = """
            INSERT INTO asignaciones (id_asignatura_fk, id_curso_fk, id_profesor_fk, activo)
            VALUES (%(id_asignatura_fk)s, %(id_curso_fk)s, %(id_profesor_fk)s, %(activo)s)
            """
            data = {
                'id_asignatura_fk': asignacion.id_asignatura_fk,
                'id_curso_fk': asignacion.id_curso_fk,
                'id_profesor_fk': asignacion.id_profesor_fk,
                'activo': asignacion.activo
            }
            result = connectToMySQL(cls.db).query_db(query, data)
            return result
        except Exception as e:
            print(f"Error en create: {e}")
            return False

    @classmethod
    def get_all(cls):
        """Obtener todas las asignaciones usando la vista completa"""
        try:
            query = "SELECT * FROM vista_asignaciones_completa WHERE activo = 1 ORDER BY asignatura_nombre, curso_completo"
            results = connectToMySQL(cls.db).query_db(query)
            return results if results else []
        except Exception as e:
            print(f"Error en get_all: {e}")
            return []

    @classmethod
    def get_by_asignatura(cls, id_asignatura):
        """Obtener asignaciones por asignatura"""
        try:
            query = """
            SELECT * FROM vista_asignaciones_completa 
            WHERE id_asignatura = %(id_asignatura)s AND activo = 1 
            ORDER BY curso_completo
            """
            data = {'id_asignatura': id_asignatura}
            results = connectToMySQL(cls.db).query_db(query, data)
            return results if results else []
        except Exception as e:
            print(f"Error en get_by_asignatura: {e}")
            return []

    @classmethod
    def get_by_curso(cls, id_curso):
        """Obtener asignaciones por curso"""
        try:
            query = """
            SELECT * FROM vista_asignaciones_completa 
            WHERE id_curso = %(id_curso)s AND activo = 1 
            ORDER BY nombre_asignatura
            """
            data = {'id_curso': id_curso}
            results = connectToMySQL(cls.db).query_db(query, data)
            return results if results else []
        except Exception as e:
            print(f"Error en get_by_curso: {e}")
            return []

    @classmethod
    def get_by_profesor(cls, id_profesor):
        """Obtener asignaciones por profesor"""
        try:
            query = """
            SELECT * FROM vista_asignaciones_completa 
            WHERE id_profesor = %(id_profesor)s AND activo = 1 
            ORDER BY nombre_asignatura, curso_completo
            """
            data = {'id_profesor': id_profesor}
            results = connectToMySQL(cls.db).query_db(query, data)
            return results if results else []
        except Exception as e:
            print(f"Error en get_by_profesor: {e}")
            return []

    @classmethod
    def get_by_id(cls, id_asignacion):
        """Obtener una asignación por ID"""
        try:
            query = """
            SELECT * FROM vista_asignaciones_completa 
            WHERE id_asignacion = %(id_asignacion)s
            """
            data = {'id_asignacion': id_asignacion}
            results = connectToMySQL(cls.db).query_db(query, data)
            return results[0] if results else None
        except Exception as e:
            print(f"Error en get_by_id: {e}")
            return None

    @classmethod
    def update(cls, id_asignacion, data):
        """Actualizar una asignación"""
        try:
            query = """
            UPDATE asignaciones SET 
                id_asignatura_fk = %(id_asignatura_fk)s,
                id_curso_fk = %(id_curso_fk)s,
                id_profesor_fk = %(id_profesor_fk)s,
                activo = %(activo)s,
                updated_at = NOW()
            WHERE id_asignacion = %(id_asignacion)s
            """
            data['id_asignacion'] = id_asignacion
            result = connectToMySQL(cls.db).query_db(query, data)
            return result
        except Exception as e:
            print(f"Error en update: {e}")
            return False

    @classmethod
    def delete(cls, id_asignacion):
        """Eliminar una asignación (soft delete)"""
        try:
            query = """
            UPDATE asignaciones SET activo = 0, updated_at = NOW() 
            WHERE id_asignacion = %(id_asignacion)s
            """
            data = {'id_asignacion': id_asignacion}
            result = connectToMySQL(cls.db).query_db(query, data)
            return result
        except Exception as e:
            print(f"Error en delete: {e}")
            return False

    @classmethod
    def exists_asignacion(cls, id_asignatura, id_curso):
        """Verificar si existe una asignación para la asignatura y curso"""
        try:
            query = """
            SELECT COUNT(*) as count FROM asignaciones 
            WHERE id_asignatura_fk = %(id_asignatura)s 
            AND id_curso_fk = %(id_curso)s 
            AND activo = 1
            """
            data = {
                'id_asignatura': id_asignatura,
                'id_curso': id_curso
            }
            result = connectToMySQL(cls.db).query_db(query, data)
            return result[0]['count'] > 0 if result else False
        except Exception as e:
            print(f"Error en exists_asignacion: {e}")
            return False

    @classmethod
    def get_stats(cls):
        """Obtener estadísticas de asignaciones"""
        try:
            query = """
            SELECT 
                COUNT(*) as total_asignaciones,
                COUNT(DISTINCT id_asignatura_fk) as total_asignaturas_asignadas,
                COUNT(DISTINCT id_curso_fk) as total_cursos_con_asignaturas,
                COUNT(DISTINCT id_profesor_fk) as total_profesores_asignados
            FROM asignaciones 
            WHERE activo = 1
            """
            result = connectToMySQL(cls.db).query_db(query)
            return result[0] if result else {}
        except Exception as e:
            print(f"Error en get_stats: {e}")
            return {}

    @classmethod
    def get_stats_by_asignatura(cls, id_asignatura):
        """
        Obtiene estadísticas de una asignatura (cursos y profesores asignados).
        """
        try:
            query = """
                SELECT 
                    COUNT(DISTINCT id_curso) as total_cursos,
                    COUNT(DISTINCT id_profesor) as total_profesores,
                    COUNT(*) as total_asignaciones,
                    GROUP_CONCAT(DISTINCT curso_completo ORDER BY curso_completo SEPARATOR ', ') as cursos,
                    GROUP_CONCAT(DISTINCT profesor_completo ORDER BY profesor_completo SEPARATOR ', ') as profesores
                FROM vista_asignaciones_completa
                WHERE id_asignatura = %(id_asignatura)s AND activo = 1
            """
            data = {'id_asignatura': id_asignatura}
            result = connectToMySQL(cls.db).query_db(query, data)
            return result[0] if result else {
                'total_cursos': 0,
                'total_profesores': 0,
                'total_asignaciones': 0,
                'cursos': '',
                'profesores': ''
            }
        except Exception as e:
            print(f"Error en get_stats_by_asignatura: {e}")
            return {
                'total_cursos': 0,
                'total_profesores': 0,
                'total_asignaciones': 0,
                'cursos': '',
                'profesores': ''
            }

    @classmethod
    def validate_form(cls, form):
        """Validar datos del formulario"""
        errors = []

        if 'id_asignatura_fk' not in form or not form['id_asignatura_fk']:
            errors.append('La asignatura es requerida')

        if 'id_curso_fk' not in form or not form['id_curso_fk']:
            errors.append('El curso es requerido')

        if 'id_profesor_fk' not in form or not form['id_profesor_fk']:
            errors.append('El profesor es requerido')

        return errors

    @classmethod
    def get_alumnos_by_curso_asignatura(cls, id_curso, id_asignatura):
        """
        Obtiene los alumnos de un curso específico para una asignatura.
        Utiliza la existencia de una asignación como filtro.
        """
        try:
            query = """
                SELECT DISTINCT a.*
                FROM alumnos a
                INNER JOIN asignaciones asig ON a.id_curso_fk = asig.id_curso_fk
                WHERE asig.id_curso_fk = %(id_curso)s 
                AND asig.id_asignatura_fk = %(id_asignatura)s 
                AND asig.activo = 1
                AND a.activo = 1
                ORDER BY a.apellido_paterno, a.nombre
            """
            data = {
                'id_curso': id_curso,
                'id_asignatura': id_asignatura
            }
            return connectToMySQL(cls.db).query_db(query, data)
        except Exception as e:
            print(f"Error en get_alumnos_by_curso_asignatura: {e}")
            return []

    @classmethod
    def get_asignatura_curso_info(cls, id_asignatura, id_curso):
        """
        Obtiene información completa de una asignatura y curso específicos.
        """
        try:
            query = """
                SELECT *
                FROM vista_asignaciones_completa
                WHERE id_asignatura = %(id_asignatura)s 
                AND id_curso = %(id_curso)s 
                AND activo = 1
                LIMIT 1
            """
            data = {
                'id_asignatura': id_asignatura,
                'id_curso': id_curso
            }
            result = connectToMySQL(cls.db).query_db(query, data)
            return result[0] if result else None
        except Exception as e:
            print(f"Error en get_asignatura_curso_info: {e}")
            return None

    @classmethod
    def get_by_profesor_asignatura_curso(cls, id_profesor, id_asignatura, id_curso):
        """
        Verifica si existe una asignación específica de profesor-asignatura-curso.
        """
        try:
            query = """
                SELECT * FROM asignaciones 
                WHERE id_profesor_fk = %(id_profesor)s 
                AND id_asignatura_fk = %(id_asignatura)s 
                AND id_curso_fk = %(id_curso)s
                AND activo = 1
            """
            data = {
                'id_profesor': id_profesor,
                'id_asignatura': id_asignatura,
                'id_curso': id_curso
            }
            result = connectToMySQL(cls.db).query_db(query, data)
            return result[0] if result else None
        except Exception as e:
            print(f"Error en get_by_profesor_asignatura_curso: {e}")
            return None
