# models/asignatura_model.py

from base.config.mysqlconnection import connectToMySQL
from flask import flash
import re
from datetime import datetime


class AsignaturaModel:
    # Definimos el nombre de la base de datos
    db = "colegio_AML"

    def __init__(self, data):
        """
        Constructor del modelo de asignatura.
        """
        self.id_asignatura = data.get('id_asignatura')
        self.nombre = data['nombre']
        self.descripcion = data.get('descripcion', '')
        self.activo = data.get('activo', 1)
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')

    # --- Métodos de Clase ---

    @classmethod
    def create(cls, data):
        """
        Crea una nueva asignatura en la base de datos.
        """
        query = """
            INSERT INTO asignaturas (nombre, descripcion) 
            VALUES (%(nombre)s, %(descripcion)s);
        """
        result = connectToMySQL(cls.db).query_db(query, data)
        return result

    @classmethod
    def get_all(cls):
        """
        Obtiene todas las asignaturas.
        """
        query = "SELECT * FROM asignaturas ORDER BY nombre;"
        results = connectToMySQL(cls.db).query_db(query)

        asignaturas = []
        if results:
            for row in results:
                asignaturas.append(cls(row))
        return asignaturas

    @classmethod
    def get_by_id(cls, id_asignatura):
        """
        Obtiene una asignatura por su ID.
        """
        query = "SELECT * FROM asignaturas WHERE id_asignatura = %(id_asignatura)s;"
        data = {'id_asignatura': id_asignatura}
        results = connectToMySQL(cls.db).query_db(query, data)

        if results:
            return cls(results[0])
        return None

    @classmethod
    def update(cls, id_asignatura, data):
        """
        Actualiza una asignatura existente.
        """
        query = """
            UPDATE asignaturas 
            SET nombre = %(nombre)s, descripcion = %(descripcion)s
            WHERE id_asignatura = %(id_asignatura)s;
        """
        data['id_asignatura'] = id_asignatura
        result = connectToMySQL(cls.db).query_db(query, data)
        return result

    @classmethod
    def delete(cls, id_asignatura):
        """
        Elimina una asignatura (soft delete - marca como inactiva).
        """
        # Primero verificar si hay asignaciones asociadas
        query_check = """
            SELECT COUNT(*) as count FROM asignaciones 
            WHERE id_asignatura_fk = %(id_asignatura)s AND activo = 1;
        """
        data = {'id_asignatura': id_asignatura}
        result_check = connectToMySQL(cls.db).query_db(query_check, data)

        if result_check and result_check[0]['count'] > 0:
            flash('No se puede eliminar la asignatura porque tiene asignaciones activas (profesores/cursos).', 'error')
            return False

        # Si no hay asignaciones, eliminar la asignatura
        query = "DELETE FROM asignaturas WHERE id_asignatura = %(id_asignatura)s;"
        result = connectToMySQL(cls.db).query_db(query, data)
        return result

    @classmethod
    def get_profesores_count(cls, id_asignatura):
        """
        Obtiene el número de profesores asignados a esta asignatura.
        """
        query = """
            SELECT COUNT(DISTINCT id_profesor_fk) as total_profesores 
            FROM asignaciones 
            WHERE id_asignatura_fk = %(id_asignatura)s AND activo = 1;
        """
        data = {'id_asignatura': id_asignatura}
        result = connectToMySQL(cls.db).query_db(query, data)
        return result[0]['total_profesores'] if result else 0

    @classmethod
    def get_with_stats(cls):
        """
        Obtiene todas las asignaturas con estadísticas de profesores y cursos.
        """
        query = """
            SELECT 
                a.*,
                COUNT(DISTINCT asig.id_profesor_fk) as total_profesores,
                COUNT(DISTINCT asig.id_curso_fk) as total_cursos,
                COUNT(asig.id_asignacion) as total_asignaciones
            FROM asignaturas a
            LEFT JOIN asignaciones asig ON a.id_asignatura = asig.id_asignatura_fk AND asig.activo = 1
            GROUP BY a.id_asignatura
            ORDER BY a.nombre;
        """
        results = connectToMySQL(cls.db).query_db(query)

        asignaturas = []
        if results:
            for row in results:
                asignatura = cls(row)
                asignatura.total_profesores = row['total_profesores']
                asignatura.total_cursos = row['total_cursos']
                asignatura.total_asignaciones = row['total_asignaciones']
                asignaturas.append(asignatura)
        return asignaturas

    # --- Métodos Estáticos ---

    @staticmethod
    def validate_form(form):
        """
        Valida los datos del formulario para crear/editar asignatura.
        """
        errores = []

        # Validar nombre
        if 'nombre' not in form or not form['nombre'] or len(form['nombre'].strip()) < 3:
            errores.append(
                "El nombre de la asignatura debe tener al menos 3 caracteres.")

        # Validar que el nombre no contenga solo números
        if 'nombre' in form and form['nombre'].strip().isdigit():
            errores.append(
                "El nombre de la asignatura no puede contener solo números.")

        return errores

    @staticmethod
    def check_duplicate_name(nombre, id_asignatura=None):
        """
        Verifica si ya existe una asignatura con el mismo nombre.
        """
        query = "SELECT id_asignatura FROM asignaturas WHERE LOWER(nombre) = LOWER(%(nombre)s)"
        data = {'nombre': nombre.strip()}

        if id_asignatura:
            query += " AND id_asignatura != %(id_asignatura)s"
            data['id_asignatura'] = id_asignatura

        result = connectToMySQL(AsignaturaModel.db).query_db(query, data)
        return len(result) > 0 if result else False
