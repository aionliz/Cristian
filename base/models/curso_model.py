# models/curso_model.py

from base.config.mysqlconnection import connectToMySQL
from flask import flash
from datetime import datetime, date
import re


class CursoModel:
    # Definimos el nombre de la base de datos
    db = "colegio_AML"

    def __init__(self, data):
        """
        Constructor del modelo de curso.
        """
        self.id_curso = data.get('id_curso')
        self.nivel = data['nivel']
        self.letra = data['letra']
        self.nombre = data.get('nombre')  # Campo generado automáticamente
        self.descripcion = data.get('descripcion')
        self.activo = data.get('activo', True)
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
        self.total_alumnos = data.get('total_alumnos', 0)  # Conteo de alumnos

    @property
    def nombre_completo(self):
        """
        Genera el nombre completo del curso basado en el nivel y letra.
        """
        niveles_map = {
            1: '1° Básico', 2: '2° Básico', 3: '3° Básico', 4: '4° Básico',
            5: '5° Básico', 6: '6° Básico', 7: '7° Básico', 8: '8° Básico',
            9: '1° Medio', 10: '2° Medio', 11: '3° Medio', 12: '4° Medio'
        }
        nivel_nombre = niveles_map.get(int(self.nivel), f'{self.nivel}°')
        return f'{nivel_nombre} {self.letra}'

    @property
    def nivel_texto(self):
        """
        Devuelve el texto del nivel (ej: "4° Medio" en lugar de "12").
        """
        niveles_map = {
            1: '1° Básico', 2: '2° Básico', 3: '3° Básico', 4: '4° Básico',
            5: '5° Básico', 6: '6° Básico', 7: '7° Básico', 8: '8° Básico',
            9: '1° Medio', 10: '2° Medio', 11: '3° Medio', 12: '4° Medio'
        }
        return niveles_map.get(int(self.nivel), f'{self.nivel}°')

    # --- Métodos de Clase ---

    @classmethod
    def create(cls, data):
        """
        Crea un nuevo curso en la base de datos.
        """
        query = """
            INSERT INTO cursos (nivel, letra, descripcion, activo) 
            VALUES (%(nivel)s, %(letra)s, %(descripcion)s, %(activo)s);
        """
        try:
            result = connectToMySQL(cls.db).query_db(query, data)
            return True  # Si llega aquí, la operación fue exitosa
        except Exception as e:
            print(f"Error al crear curso: {e}")
            return False

    @classmethod
    def get_all(cls):
        """
        Obtiene todos los cursos activos.
        """
        query = """
            SELECT *, 
                   (SELECT COUNT(*) FROM alumnos WHERE id_curso_fk = c.id_curso AND activo = 1) as total_alumnos
            FROM cursos c 
            WHERE activo = 1 
            ORDER BY nivel, letra;
        """
        results = connectToMySQL(cls.db).query_db(query)

        cursos = []
        if results:
            for row in results:
                cursos.append(cls(row))
        return cursos

    @classmethod
    def get_by_id(cls, id_curso):
        """
        Obtiene un curso por su ID.
        """
        query = """
            SELECT *, 
                   (SELECT COUNT(*) FROM alumnos WHERE id_curso_fk = c.id_curso AND activo = 1) as total_alumnos
            FROM cursos c 
            WHERE id_curso = %(id_curso)s;
        """
        data = {'id_curso': id_curso}
        results = connectToMySQL(cls.db).query_db(query, data)

        if results:
            return cls(results[0])
        return None

    @classmethod
    def update(cls, id_curso, data):
        """
        Actualiza los datos de un curso.
        """
        query = """
            UPDATE cursos 
            SET nivel = %(nivel)s, letra = %(letra)s, descripcion = %(descripcion)s, 
                activo = %(activo)s, updated_at = NOW()
            WHERE id_curso = %(id_curso)s;
        """
        data['id_curso'] = id_curso
        try:
            result = connectToMySQL(cls.db).query_db(query, data)
            return True  # Si llega aquí, la operación fue exitosa
        except Exception as e:
            print(f"Error al actualizar curso: {e}")
            return False

    @classmethod
    def delete(cls, id_curso):
        """
        Desactiva un curso (soft delete).
        """
        # Verificar si el curso tiene alumnos asignados
        query_check = """
            SELECT COUNT(*) as total FROM alumnos 
            WHERE id_curso_fk = %(id_curso)s AND activo = 1;
        """
        result = connectToMySQL(cls.db).query_db(
            query_check, {'id_curso': id_curso})

        if result and result[0]['total'] > 0:
            return {'success': False, 'message': 'No se puede eliminar el curso porque tiene alumnos asignados'}

        # Si no tiene alumnos, proceder con la desactivación
        query = """
            UPDATE cursos 
            SET activo = 0, updated_at = NOW()
            WHERE id_curso = %(id_curso)s;
        """
        data = {'id_curso': id_curso}
        result = connectToMySQL(cls.db).query_db(query, data)

        if result:
            return {'success': True, 'message': 'Curso eliminado exitosamente'}
        else:
            return {'success': False, 'message': 'Error al eliminar el curso'}

    @classmethod
    def search(cls, search_term):
        """
        Busca cursos por nombre o descripción.
        """
        query = """
            SELECT *, 
                   (SELECT COUNT(*) FROM alumnos WHERE id_curso_fk = c.id_curso AND activo = 1) as total_alumnos
            FROM cursos c
            WHERE (CONCAT(nivel, '° ', letra) LIKE %(search_term)s 
                   OR descripcion LIKE %(search_term)s)
                  AND activo = 1
            ORDER BY nivel, letra;
        """
        search_pattern = f"%{search_term}%"
        data = {'search_term': search_pattern}
        results = connectToMySQL(cls.db).query_db(query, data)

        cursos = []
        if results:
            for row in results:
                cursos.append(cls(row))
        return cursos

    @classmethod
    def get_cursos_with_students_count(cls):
        """
        Obtiene todos los cursos con el conteo de estudiantes.
        """
        query = """
            SELECT c.*, 
                   COUNT(a.id_alumno) as total_alumnos,
                   COUNT(CASE WHEN a.activo = 1 THEN 1 END) as alumnos_activos
            FROM cursos c
            LEFT JOIN alumnos a ON c.id_curso = a.id_curso_fk
            WHERE c.activo = 1
            GROUP BY c.id_curso
            ORDER BY c.nivel, c.letra;
        """
        return connectToMySQL(cls.db).query_db(query)

    # --- Métodos de Instancia ---

    def to_dict(self):
        """
        Convierte el objeto a diccionario para serialización.
        """
        return {
            'id_curso': self.id_curso,
            'nivel': self.nivel,
            'letra': self.letra,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'activo': self.activo,
            'total_alumnos': getattr(self, 'total_alumnos', 0),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }

    # --- Métodos Estáticos ---

    @staticmethod
    def validar_curso(form, curso_existente=False):
        """
        Valida los datos de un formulario de curso.
        """
        is_valid = True

        # Validar nivel
        if 'nivel' not in form or not form['nivel']:
            flash('El nivel es obligatorio.', "curso")
            is_valid = False
        else:
            try:
                nivel = int(form['nivel'])
                if nivel < 1 or nivel > 12:
                    flash('El nivel debe estar entre 1 y 12.', "curso")
                    is_valid = False
            except ValueError:
                flash('El nivel debe ser un número válido.', "curso")
                is_valid = False

        # Validar letra
        if 'letra' not in form or not form['letra']:
            flash('La letra del curso es obligatoria.', "curso")
            is_valid = False
        elif not re.match(r'^[A-Z]$', form['letra']):
            flash('La letra debe ser una sola letra mayúscula (A-Z).', "curso")
            is_valid = False

        # Validar que no exista la combinación nivel-letra (solo para cursos nuevos)
        if not curso_existente and is_valid:
            existing_query = """
                SELECT id_curso FROM cursos 
                WHERE nivel = %(nivel)s AND letra = %(letra)s AND activo = 1;
            """
            existing_data = {'nivel': form['nivel'], 'letra': form['letra']}
            existing_result = connectToMySQL(CursoModel.db).query_db(
                existing_query, existing_data)

            if existing_result:
                flash(
                    f'Ya existe un curso {form["nivel"]}° {form["letra"]}.', "curso")
                is_valid = False

        return is_valid

    @staticmethod
    def get_niveles_disponibles():
        """
        Retorna los niveles educativos disponibles.
        """
        return [
            {'valor': 1, 'nombre': '1° Básico'},
            {'valor': 2, 'nombre': '2° Básico'},
            {'valor': 3, 'nombre': '3° Básico'},
            {'valor': 4, 'nombre': '4° Básico'},
            {'valor': 5, 'nombre': '5° Básico'},
            {'valor': 6, 'nombre': '6° Básico'},
            {'valor': 7, 'nombre': '7° Básico'},
            {'valor': 8, 'nombre': '8° Básico'},
            {'valor': 9, 'nombre': '1° Medio'},
            {'valor': 10, 'nombre': '2° Medio'},
            {'valor': 11, 'nombre': '3° Medio'},
            {'valor': 12, 'nombre': '4° Medio'}
        ]

    @staticmethod
    def get_letras_disponibles():
        """
        Retorna las letras disponibles para los cursos.
        """
        return ['A', 'B', 'C', 'D', 'E', 'F']
