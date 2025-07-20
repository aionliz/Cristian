# models/user_model.py

# Importamos la instancia de la base de datos desde base/database.py
# (No usamos connectToMySQL directamente, sino la instancia 'db' que ya se inicializó)
from base.config.mysqlconnection import connectToMySQL
from flask import flash
import re # Importamos la librería de expresiones regulares para validar email
from werkzeug.security import generate_password_hash, check_password_hash

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$')

class UserModel:
    # Definimos el nombre de la base de datos con la que trabajaremos
    # Aunque la instancia 'db' ya apunta a 'colegio_AML', es bueno tenerlo aquí para claridad
    db = "colegio_AML" 

    def __init__(self, data):
        """
        Constructor del modelo de usuario. 
        Mapea los datos de la base de datos a atributos del objeto.
        """
        self.id_usuario = data['id_usuario']
        self.email = data['email']
        self.password_hash = data['password_hash'] # Nuestra BD usa 'password_hash'
        self.rol = data['rol'] 
        self.id_profesor_fk = data.get('id_profesor_fk') # Puede ser NULL
        self.id_alumno_fk = data.get('id_alumno_fk')   # Puede ser NULL
        self.es_apoderado = data.get('es_apoderado', False) # Por defecto False si no está
        # created_at y updated_at no están en la tabla 'usuarios' según nuestro CREATE TABLE inicial,
        # pero si los añades a la tabla, aquí es donde irían.
        # self.created_at = data['created_at'] 
        # self.updated_at = data['updated_at']

    @property
    def tipo(self):
        """Alias para compatibilidad con código que usa 'tipo' en lugar de 'rol'"""
        return self.rol

    # --- Métodos de Clase (Interactúan con la Base de Datos) ---

    @classmethod
    def save(cls, form):
        """
        Guarda un nuevo usuario en la base de datos.
        La contraseña DEBE venir ya hasheada desde el controlador.
        Los campos deben coincidir con la tabla 'usuarios'.
        """
        query = """
            INSERT INTO usuarios (email, password_hash, rol, id_profesor_fk, id_alumno_fk, es_apoderado) 
            VALUES (%(email)s, %(password_hash)s, %(rol)s, %(id_profesor_fk)s, %(id_alumno_fk)s, %(es_apoderado)s);
        """
        # Usamos la instancia 'db' global para ejecutar la consulta
        return connectToMySQL(cls.db).query_db(query, form)

    @classmethod
    def get_by_email(cls, data):
        """
        Busca un usuario en la base de datos por su dirección de email.
        """
        query = "SELECT * FROM usuarios WHERE email = %(email)s;"
        
        # Usamos la instancia 'db' global para ejecutar la consulta
        result = connectToMySQL(cls.db).query_db(query, data)

        # Si la consulta devuelve al menos una fila...
        if result:
            # Creamos una instancia de la clase UserModel con los datos de la primera fila
            return cls(result[0])
        
        # Si la consulta no encuentra nada, retornamos None.
        return None

    @classmethod
    def get_by_id(cls, user_id):
        """Obtiene un usuario por su ID, incluyendo su rol y datos relacionados."""
        query = "SELECT * FROM usuarios WHERE id_usuario = %s;"
        result = connectToMySQL(cls.db).query_db(query, (user_id,))
        if result:
            return cls(result[0])
        return None

    # --- Métodos Estáticos (Validaciones sin interactuar con la Base de Datos) ---

    @staticmethod
    def validar_registro(form, usuario_existente=False):
        """
        Valida los datos de un formulario de registro.
        'form' es un diccionario con los datos del formulario.
        'usuario_existente' es un booleano para indicar si el email ya está en uso.
        """
        is_valid = True
        # Nota: La tabla 'usuarios' no tiene 'nombre' y 'apellido' directamente, 
        # sino que están asociados a 'profesores' o 'alumnos'.
        # Si el usuario es un profesor o apoderado vinculado a un alumno,
        # el nombre y apellido se obtendrían de esas tablas.
        # Para esta validación básica, asumiremos que si se usan,
        # vienen en el 'form' para el registro inicial del usuario.
        
        # Si el formulario incluye nombre y apellido (para un registro completo de usuario)
        if 'nombre' in form and len(form['nombre']) < 2:
            flash('El nombre debe tener al menos 2 caracteres.', "registro")
            is_valid = False
        if 'apellido' in form and len(form['apellido']) < 2:
            flash('El apellido debe tener al menos 2 caracteres.', "registro")
            is_valid = False

        if not EMAIL_REGEX.match(form['email']):
            flash('El formato del email es inválido.', "registro")
            is_valid = False
        if usuario_existente:
            flash('Este correo electrónico ya está registrado.', "registro")
            is_valid = False
        if len(form['password']) < 8:
            flash('La contraseña debe tener al menos 8 caracteres.', "registro")
            is_valid = False
        if form['password'] != form['confirm_password']:
            flash('Las contraseñas no coinciden.', "registro")
            is_valid = False
        return is_valid