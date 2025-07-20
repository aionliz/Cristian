# models/alumno_model.py

from base.config.mysqlconnection import connectToMySQL
from flask import flash
import re

RUT_REGEX = re.compile(r'^\d{1,8}-[0-9kK]$')

class AlumnoModel:
    # Definimos el nombre de la base de datos
    db = "colegio-AML"

    def __init__(self, data):
        """
        Constructor del modelo de alumno.
        """
        self.id_alumno = data.get('id_alumno')
        self.nombre = data['nombre']
        self.apellido_paterno = data['apellido_paterno']
        self.apellido_materno = data['apellido_materno']
        self.fecha_nacimiento = data.get('fecha_nacimiento')
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
    def get_all(cls):
        """Obtiene todos los alumnos activos."""
        query = "SELECT * FROM alumnos WHERE activo = 1 ORDER BY apellido_paterno, nombre;"
        return connectToMySQL(cls.db).query_db(query)

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
        Obtiene un alumno por su ID.
        """
        query = """
            SELECT a.*, c.nombre as nombre_curso, c.nivel,
                   ap.nombre as nombre_apoderado, ap.apellido as apellido_apoderado, ap.telefono as telefono_apoderado
            FROM alumnos a
            LEFT JOIN cursos c ON a.id_curso = c.id_curso
            LEFT JOIN apoderados ap ON a.id_apoderado = ap.id_apoderado
            WHERE a.id_alumno = %(id_alumno)s;
        """
        data = {'id_alumno': id_alumno}
        result = connectToMySQL(cls.db).query_db(query, data)
        
        if result:
            return cls(result[0])
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
        """Buscar alumnos por nombre, apellido o RUT"""
        query = """
            SELECT a.*, c.nombre as curso
            FROM alumnos a
            LEFT JOIN cursos c ON a.id_curso_fk = c.id_curso
            WHERE a.activo = 1 AND (
                a.nombre LIKE %s OR 
                a.apellido_paterno LIKE %s OR 
                a.apellido_materno LIKE %s OR
                CONCAT(a.nombre, ' ', a.apellido_paterno) LIKE %s OR
                CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', a.apellido_materno) LIKE %s
            )
            ORDER BY a.apellido_paterno, a.nombre
            LIMIT 20
        """
        search_term = f"%{term}%"
        return connectToMySQL(cls.db).query_db(query, (search_term, search_term, search_term, search_term, search_term))

    @classmethod
    def update(cls, id_alumno, data):
        """
        Actualiza los datos de un alumno.
        """
        query = """
            UPDATE alumnos 
            SET rut = %(rut)s, nombre = %(nombre)s, apellido = %(apellido)s, 
                fecha_nacimiento = %(fecha_nacimiento)s, telefono = %(telefono)s, 
                direccion = %(direccion)s, email = %(email)s, id_curso = %(id_curso)s, 
                id_apoderado = %(id_apoderado)s, activo = %(activo)s, updated_at = NOW()
            WHERE id_alumno = %(id_alumno)s;
        """
        data['id_alumno'] = id_alumno
        return connectToMySQL(cls.db).query_db(query, data)

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
            'rut': self.rut,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'nombre_completo': self.nombre_completo(),
            'fecha_nacimiento': str(self.fecha_nacimiento) if self.fecha_nacimiento else None,
            'telefono': self.telefono,
            'direccion': self.direccion,
            'email': self.email,
            'id_curso': self.id_curso,
            'id_apoderado': self.id_apoderado,
            'activo': self.activo
        }

    # --- Métodos Estáticos ---

    @staticmethod
    def validar_alumno(form, alumno_existente=False):
        """
        Valida los datos de un formulario de alumno.
        """
        is_valid = True
        
        # Validar nombre
        if 'nombre' not in form or len(form['nombre']) < 2:
            flash('El nombre debe tener al menos 2 caracteres.', "alumno")
            is_valid = False
            
        # Validar apellido
        if 'apellido' not in form or len(form['apellido']) < 2:
            flash('El apellido debe tener al menos 2 caracteres.', "alumno")
            is_valid = False
            
        # Validar RUT
        if 'rut' not in form or not RUT_REGEX.match(form['rut']):
            flash('El formato del RUT es inválido. Debe ser: 12345678-9', "alumno")
            is_valid = False
        elif alumno_existente:
            flash('Ya existe un alumno con este RUT.', "alumno")
            is_valid = False
            
        # Validar email si se proporciona
        if 'email' in form and form['email'] and '@' not in form['email']:
            flash('El formato del email es inválido.', "alumno")
            is_valid = False
            
        return is_valid

    @staticmethod
    def validar_rut(rut):
        """
        Valida el formato de un RUT chileno.
        """
        if not RUT_REGEX.match(rut):
            return False
            
        # Aquí podrías agregar validación del dígito verificador si lo deseas
        return True
