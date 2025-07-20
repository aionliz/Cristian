# models/asistencia_model.py

from base.config.mysqlconnection import connectToMySQL
from flask import flash
from datetime import datetime, date
import re

class AsistenciaModel:
    # Definimos el nombre de la base de datos
    db = "colegio-AML"

    def __init__(self, data):
        """
        Constructor del modelo de asistencia.
        """
        self.id_asistencia = data.get('id_asistencia')
        self.id_alumno = data['id_alumno']
        self.fecha = data['fecha']
        self.estado = data['estado']  # 'presente', 'ausente', 'tardanza', 'justificado'
        self.hora_llegada = data.get('hora_llegada')
        self.observaciones = data.get('observaciones', '')
        self.metodo_registro = data.get('metodo_registro', 'manual')  # 'manual', 'huella_dactilar'
        self.id_huella_usada = data.get('id_huella_usada')
        self.id_profesor = data.get('id_profesor')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')

    # --- Métodos de Clase ---

    @classmethod
    def get_daily_attendance_stats(cls, fecha):
        """Obtener estadísticas de asistencia para una fecha específica"""
        query = """
            SELECT 
                COUNT(CASE WHEN a.presente = 1 THEN 1 END) as presentes,
                COUNT(CASE WHEN a.presente = 0 THEN 1 END) as ausentes,
                (SELECT COUNT(*) FROM alumnos WHERE activo = 1) as total
            FROM asistencias a
            WHERE DATE(a.fecha) = %s
        """
        result = connectToMySQL(cls.db).query_db(query, (fecha.strftime('%Y-%m-%d'),))
        
        if result:
            stats = result[0]
            # Si no hay registros, calcular totales
            if stats['presentes'] == 0 and stats['ausentes'] == 0:
                total_alumnos = stats['total']
                return {
                    'presentes': 0,
                    'ausentes': total_alumnos,
                    'total': total_alumnos
                }
            return stats
        
        # Fallback: obtener total de alumnos
        total_query = "SELECT COUNT(*) as total FROM alumnos WHERE activo = 1"
        total_result = connectToMySQL(cls.db).query_db(total_query)
        total_alumnos = total_result[0]['total'] if total_result else 0
        
        return {
            'presentes': 0,
            'ausentes': total_alumnos,
            'total': total_alumnos
        }

    @classmethod
    def get_asistencia_by_alumno_fecha(cls, id_alumno, fecha):
        """Verificar si existe asistencia para un alumno en una fecha específica"""
        query = """
            SELECT * FROM asistencias 
            WHERE id_alumno = %s AND DATE(fecha) = %s
            ORDER BY fecha DESC LIMIT 1
        """
        result = connectToMySQL(cls.db).query_db(query, (id_alumno, fecha))
        return result[0] if result else None

    @classmethod
    def marcar_presente(cls, attendance_data):
        """Marcar asistencia presente con método biométrico"""
        query = """
            INSERT INTO asistencias 
            (id_alumno, fecha, presente, metodo_registro, id_huella_usada, hora_registro) 
            VALUES (%(id_alumno)s, %(fecha)s, %(presente)s, %(metodo_registro)s, 
                    %(id_huella_usada)s, %(hora_registro)s)
        """
        return connectToMySQL(cls.db).query_db(query, attendance_data)

    @classmethod
    def marcar_asistencia(cls, data):
        """
        Marca la asistencia de un alumno para una fecha específica.
        """
        # Primero verificamos si ya existe un registro para este alumno en esta fecha
        existing = cls.get_asistencia_by_alumno_fecha(data['id_alumno'], data['fecha'])
        
        if existing:
            # Si ya existe, actualizamos el registro
            return cls.actualizar_asistencia(existing.id_asistencia, data)
        else:
            # Si no existe, creamos un nuevo registro
            query = """
                INSERT INTO asistencias (id_alumno, fecha, estado, hora_llegada, observaciones, id_profesor) 
                VALUES (%(id_alumno)s, %(fecha)s, %(estado)s, %(hora_llegada)s, %(observaciones)s, %(id_profesor)s);
            """
            return connectToMySQL(cls.db).query_db(query, data)

    @classmethod
    def actualizar_asistencia(cls, id_asistencia, data):
        """
        Actualiza un registro de asistencia existente.
        """
        query = """
            UPDATE asistencias 
            SET estado = %(estado)s, hora_llegada = %(hora_llegada)s, 
                observaciones = %(observaciones)s, id_profesor = %(id_profesor)s,
                updated_at = NOW()
            WHERE id_asistencia = %(id_asistencia)s;
        """
        data['id_asistencia'] = id_asistencia
        return connectToMySQL(cls.db).query_db(query, data)

    @classmethod
    def get_asistencia_by_alumno_fecha(cls, id_alumno, fecha):
        """
        Obtiene el registro de asistencia de un alumno para una fecha específica.
        """
        query = """
            SELECT * FROM asistencias 
            WHERE id_alumno = %(id_alumno)s AND fecha = %(fecha)s;
        """
        data = {'id_alumno': id_alumno, 'fecha': fecha}
        result = connectToMySQL(cls.db).query_db(query, data)
        
        if result:
            return cls(result[0])
        return None

    @classmethod
    def get_asistencia_por_curso_fecha(cls, id_curso, fecha):
        """
        Obtiene la asistencia de todos los alumnos de un curso para una fecha específica.
        """
        query = """
            SELECT a.*, al.nombre, al.apellido, al.rut 
            FROM asistencias a
            JOIN alumnos al ON a.id_alumno = al.id_alumno
            WHERE al.id_curso = %(id_curso)s AND a.fecha = %(fecha)s
            ORDER BY al.apellido, al.nombre;
        """
        data = {'id_curso': id_curso, 'fecha': fecha}
        results = connectToMySQL(cls.db).query_db(query, data)
        
        asistencias = []
        if results:
            for row in results:
                asistencias.append(cls(row))
        return asistencias

    @classmethod
    def get_alumnos_sin_asistencia(cls, id_curso, fecha):
        """
        Obtiene los alumnos de un curso que no tienen registro de asistencia para una fecha específica.
        """
        query = """
            SELECT al.* FROM alumnos al
            LEFT JOIN asistencias a ON al.id_alumno = a.id_alumno AND a.fecha = %(fecha)s
            WHERE al.id_curso = %(id_curso)s AND a.id_asistencia IS NULL
            ORDER BY al.apellido, al.nombre;
        """
        data = {'id_curso': id_curso, 'fecha': fecha}
        return connectToMySQL(cls.db).query_db(query, data)

    @classmethod
    def get_resumen_asistencia_alumno(cls, id_alumno, fecha_inicio=None, fecha_fin=None):
        """
        Obtiene un resumen de asistencia de un alumno en un período específico.
        """
        query = """
            SELECT 
                COUNT(*) as total_dias,
                SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) as dias_presente,
                SUM(CASE WHEN estado = 'ausente' THEN 1 ELSE 0 END) as dias_ausente,
                SUM(CASE WHEN estado = 'tardanza' THEN 1 ELSE 0 END) as dias_tardanza,
                SUM(CASE WHEN estado = 'justificado' THEN 1 ELSE 0 END) as dias_justificado
            FROM asistencias 
            WHERE id_alumno = %(id_alumno)s
        """
        
        data = {'id_alumno': id_alumno}
        
        if fecha_inicio and fecha_fin:
            query += " AND fecha BETWEEN %(fecha_inicio)s AND %(fecha_fin)s"
            data['fecha_inicio'] = fecha_inicio
            data['fecha_fin'] = fecha_fin
        elif fecha_inicio:
            query += " AND fecha >= %(fecha_inicio)s"
            data['fecha_inicio'] = fecha_inicio
        elif fecha_fin:
            query += " AND fecha <= %(fecha_fin)s"
            data['fecha_fin'] = fecha_fin
            
        result = connectToMySQL(cls.db).query_db(query, data)
        return result[0] if result else None

    @classmethod
    def get_historial_asistencia_alumno(cls, id_alumno, limit=30):
        """
        Obtiene el historial de asistencia de un alumno (últimos registros).
        """
        query = """
            SELECT * FROM asistencias 
            WHERE id_alumno = %(id_alumno)s 
            ORDER BY fecha DESC 
            LIMIT %(limit)s;
        """
        data = {'id_alumno': id_alumno, 'limit': limit}
        results = connectToMySQL(cls.db).query_db(query, data)
        
        historial = []
        if results:
            for row in results:
                historial.append(cls(row))
        return historial

    @classmethod
    def eliminar_asistencia(cls, id_asistencia):
        """
        Elimina un registro de asistencia.
        """
        query = "DELETE FROM asistencias WHERE id_asistencia = %(id_asistencia)s;"
        data = {'id_asistencia': id_asistencia}
        return connectToMySQL(cls.db).query_db(query, data)

    # --- Métodos Estáticos ---

    @staticmethod
    def validar_asistencia(form):
        """
        Valida los datos de un formulario de asistencia.
        """
        is_valid = True
        
        if 'id_alumno' not in form or not form['id_alumno']:
            flash('Debe seleccionar un alumno.', "asistencia")
            is_valid = False
            
        if 'fecha' not in form or not form['fecha']:
            flash('Debe especificar una fecha.', "asistencia")
            is_valid = False
        else:
            try:
                fecha = datetime.strptime(form['fecha'], '%Y-%m-%d').date()
                if fecha > date.today():
                    flash('No se puede marcar asistencia para fechas futuras.', "asistencia")
                    is_valid = False
            except ValueError:
                flash('Formato de fecha inválido.', "asistencia")
                is_valid = False
                
        if 'estado' not in form or form['estado'] not in ['presente', 'ausente', 'tardanza', 'justificado']:
            flash('Estado de asistencia inválido.', "asistencia")
            is_valid = False
            
        return is_valid

    @staticmethod
    def calcular_porcentaje_asistencia(resumen):
        """
        Calcula el porcentaje de asistencia basado en un resumen.
        """
        if not resumen or resumen['total_dias'] == 0:
            return 0
            
        dias_efectivos = resumen['dias_presente'] + resumen['dias_tardanza'] + resumen['dias_justificado']
        return round((dias_efectivos / resumen['total_dias']) * 100, 2)
