# models/asistencia_model.py

from base.config.mysqlconnection import connectToMySQL
from flask import flash
from datetime import datetime, date
import re


class AsistenciaModel:
    # Definimos el nombre de la base de datos
    db = "colegio_AML"

    def __init__(self, data):
        """
        Constructor del modelo de asistencia.
        """
        self.id_asistencia = data.get('id_asistencia')
        self.id_alumno = data['id_alumno']
        self.fecha = data['fecha']
        # 'presente', 'ausente', 'tardanza', 'justificado'
        self.estado = data['estado']
        self.hora_llegada = data.get('hora_llegada')
        self.observaciones = data.get('observaciones', '')
        # 'manual', 'huella_dactilar'
        self.metodo_registro = data.get('metodo_registro', 'manual')
        self.id_huella_usada = data.get('id_huella_usada')
        self.id_profesor = data.get('id_profesor')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')

        # Campos de alumno (cuando se incluyen en JOIN)
        self.nombre = data.get('nombre')
        self.apellido_paterno = data.get('apellido_paterno')
        self.apellido_materno = data.get('apellido_materno')
        self.alumno_id = data.get('alumno_id')

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
        result = connectToMySQL(cls.db).query_db(
            query, (fecha.strftime('%Y-%m-%d'),))

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
        existing = cls.get_asistencia_by_alumno_fecha(
            data['id_alumno'], data['fecha'])

        if existing:
            # Si ya existe, actualizamos el registro
            data['id_asistencia'] = existing.id_asistencia
            return cls.actualizar_asistencia(data)
        else:
            # Si no existe, creamos un nuevo registro
            query = """
                INSERT INTO asistencias (id_alumno, fecha, estado, hora_llegada, observaciones, id_profesor) 
                VALUES (%(id_alumno)s, %(fecha)s, %(estado)s, %(hora_llegada)s, %(observaciones)s, %(id_profesor)s);
            """
            return connectToMySQL(cls.db).query_db(query, data)

    @classmethod
    def actualizar_asistencia(cls, data):
        query = """
            UPDATE asistencias 
            SET estado = %(estado)s, hora_llegada = %(hora_llegada)s, 
                observaciones = %(observaciones)s, id_profesor = %(id_profesor)s,
                updated_at = NOW()
            WHERE id_asistencia = %(id_asistencia)s;
        """
        result = connectToMySQL(cls.db).query_db(query, data)
        # Para UPDATE, query_db devuelve None en éxito, así que devolvemos True
        return True

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
    def get_by_id(cls, id_asistencia):
        """
        Obtiene un registro de asistencia por su ID.
        """
        query = """
            SELECT * FROM asistencias 
            WHERE id_asistencia = %(id_asistencia)s;
        """
        data = {'id_asistencia': id_asistencia}
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
            SELECT a.*, al.nombre, al.apellido_paterno, al.apellido_materno, al.id_alumno as alumno_id
            FROM asistencias a
            JOIN alumnos al ON a.id_alumno = al.id_alumno
            WHERE al.id_curso_fk = %(id_curso)s AND a.fecha = %(fecha)s
            ORDER BY al.apellido_paterno, al.nombre;
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
            WHERE al.id_curso_fk = %(id_curso)s AND a.id_asistencia IS NULL AND al.activo = 1
            ORDER BY al.apellido_paterno, al.nombre;
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
                    flash(
                        'No se puede marcar asistencia para fechas futuras.', "asistencia")
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

        dias_efectivos = resumen['dias_presente'] + \
            resumen['dias_tardanza'] + resumen['dias_justificado']
        return round((dias_efectivos / resumen['total_dias']) * 100, 2)

    @classmethod
    def generar_reporte_mensual(cls, mes, id_curso=None, tipo_reporte='general'):
        """
        Genera un reporte mensual de asistencia.

        Args:
            mes (str): Mes en formato 'YYYY-MM'
            id_curso (str): ID del curso (opcional)
            tipo_reporte (str): Tipo de reporte ('general', 'detallado', 'resumen')

        Returns:
            dict: Datos del reporte
        """
        try:
            # Convertir mes a fecha de inicio y fin
            year, month = mes.split('-')
            fecha_inicio = f"{year}-{month}-01"

            # Calcular último día del mes
            import calendar
            ultimo_dia = calendar.monthrange(int(year), int(month))[1]
            fecha_fin = f"{year}-{month}-{ultimo_dia}"

            # Query base para estadísticas generales
            query_stats = """
                SELECT 
                    COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) as total_presente,
                    COUNT(CASE WHEN a.estado = 'ausente' THEN 1 END) as total_ausente,
                    COUNT(CASE WHEN a.estado = 'tardanza' THEN 1 END) as total_tarde,
                    COUNT(CASE WHEN a.estado = 'justificado' THEN 1 END) as total_justificado,
                    COUNT(*) as total_registros
                FROM asistencias a
                JOIN alumnos al ON a.id_alumno = al.id_alumno
                WHERE a.fecha BETWEEN %s AND %s
            """

            params_stats = [fecha_inicio, fecha_fin]

            if id_curso:
                query_stats += " AND al.id_curso_fk = %s"
                params_stats.append(id_curso)

            result_stats = connectToMySQL(
                cls.db).query_db(query_stats, params_stats)
            stats = result_stats[0] if result_stats else {
                'total_presente': 0, 'total_ausente': 0, 'total_tarde': 0,
                'total_justificado': 0, 'total_registros': 0
            }

            # Calcular porcentaje de asistencia
            total_efectivo = stats['total_presente'] + \
                stats['total_tarde'] + stats['total_justificado']
            porcentaje_asistencia = round(
                (total_efectivo / stats['total_registros'] * 100), 2) if stats['total_registros'] > 0 else 0

            # Query para datos detallados por alumno
            query_detalle = """
                SELECT 
                    al.id_alumno,
                    al.nombre,
                    al.apellido_paterno,
                    al.apellido_materno,
                    c.nivel,
                    c.letra,
                    COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) as dias_presente,
                    COUNT(CASE WHEN a.estado = 'ausente' THEN 1 END) as dias_ausente,
                    COUNT(CASE WHEN a.estado = 'tardanza' THEN 1 END) as dias_tarde,
                    COUNT(CASE WHEN a.estado = 'justificado' THEN 1 END) as dias_justificado,
                    COUNT(*) as total_dias
                FROM alumnos al
                LEFT JOIN asistencias a ON al.id_alumno = a.id_alumno AND a.fecha BETWEEN %s AND %s
                JOIN cursos c ON al.id_curso_fk = c.id_curso
                WHERE al.activo = 1
            """

            params_detalle = [fecha_inicio, fecha_fin]

            if id_curso:
                query_detalle += " AND al.id_curso_fk = %s"
                params_detalle.append(id_curso)

            query_detalle += """
                GROUP BY al.id_alumno, al.nombre, al.apellido_paterno, al.apellido_materno, c.nivel, c.letra
                ORDER BY c.nivel, c.letra, al.apellido_paterno, al.nombre
            """

            result_detalle = connectToMySQL(cls.db).query_db(
                query_detalle, params_detalle)

            # Procesar datos detallados
            datos_alumnos = []
            if result_detalle:
                for alumno in result_detalle:
                    dias_efectivo = alumno['dias_presente'] + \
                        alumno['dias_tarde'] + alumno['dias_justificado']
                    porcentaje_alumno = round(
                        (dias_efectivo / alumno['total_dias'] * 100), 2) if alumno['total_dias'] > 0 else 0

                    # Determinar estado general
                    if porcentaje_alumno >= 85:
                        estado = 'Excelente'
                    elif porcentaje_alumno >= 75:
                        estado = 'Bueno'
                    elif porcentaje_alumno >= 65:
                        estado = 'Regular'
                    else:
                        estado = 'Crítico'

                    datos_alumnos.append({
                        'id_alumno': alumno['id_alumno'],
                        'nombre_completo': f"{alumno['nombre']} {alumno['apellido_paterno']} {alumno['apellido_materno']}",
                        'curso': f"{alumno['nivel']}° {alumno['letra']}",
                        'dias_presente': alumno['dias_presente'],
                        'dias_ausente': alumno['dias_ausente'],
                        'dias_tarde': alumno['dias_tarde'],
                        'dias_justificado': alumno['dias_justificado'],
                        'total_dias': alumno['total_dias'],
                        'porcentaje_asistencia': porcentaje_alumno,
                        'estado': estado
                    })

            # Query para datos de tendencia diaria
            query_tendencia = """
                SELECT 
                    a.fecha,
                    COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) as presente,
                    COUNT(CASE WHEN a.estado = 'ausente' THEN 1 END) as ausente,
                    COUNT(CASE WHEN a.estado = 'tardanza' THEN 1 END) as tarde,
                    COUNT(CASE WHEN a.estado = 'justificado' THEN 1 END) as justificado
                FROM asistencias a
                JOIN alumnos al ON a.id_alumno = al.id_alumno
                WHERE a.fecha BETWEEN %s AND %s
            """

            params_tendencia = [fecha_inicio, fecha_fin]

            if id_curso:
                query_tendencia += " AND al.id_curso_fk = %s"
                params_tendencia.append(id_curso)

            query_tendencia += " GROUP BY a.fecha ORDER BY a.fecha"

            result_tendencia = connectToMySQL(cls.db).query_db(
                query_tendencia, params_tendencia)

            # Procesar datos de tendencia
            tendencia_diaria = []
            if result_tendencia:
                for dia in result_tendencia:
                    tendencia_diaria.append({
                        'fecha': dia['fecha'].strftime('%Y-%m-%d'),
                        'presente': dia['presente'],
                        'ausente': dia['ausente'],
                        'tarde': dia['tarde'],
                        'justificado': dia['justificado']
                    })

            return {
                'resumen': {
                    'total_presente': stats['total_presente'],
                    'total_ausente': stats['total_ausente'],
                    'total_tarde': stats['total_tarde'],
                    'total_justificado': stats['total_justificado'],
                    'total_registros': stats['total_registros'],
                    'porcentaje_asistencia': porcentaje_asistencia
                },
                'alumnos': datos_alumnos,
                'tendencia_diaria': tendencia_diaria,
                'parametros': {
                    'mes': mes,
                    'curso': id_curso,
                    'tipo': tipo_reporte,
                    'fecha_inicio': fecha_inicio,
                    'fecha_fin': fecha_fin
                }
            }

        except Exception as e:
            print(f"Error generando reporte mensual: {str(e)}")
            raise e

    @classmethod
    def get_estadisticas_del_dia(cls, fecha):
        """
        Obtener estadísticas de asistencia para una fecha específica.

        Args:
            fecha (str): Fecha en formato 'YYYY-MM-DD'

        Returns:
            dict: Diccionario con estadísticas del día
        """
        try:
            query = """
                SELECT 
                    COUNT(CASE WHEN estado = 'presente' THEN 1 END) as presentes,
                    COUNT(CASE WHEN estado = 'ausente' THEN 1 END) as ausentes,
                    COUNT(CASE WHEN estado = 'tardanza' THEN 1 END) as tardanzas,
                    COUNT(CASE WHEN estado = 'justificado' THEN 1 END) as justificados,
                    COUNT(*) as total_registros
                FROM asistencias 
                WHERE DATE(fecha) = %s
            """

            result = connectToMySQL(cls.db).query_db(query, (fecha,))

            if result:
                stats = result[0]

                # Obtener total de alumnos activos
                query_total = "SELECT COUNT(*) as total_alumnos FROM alumnos WHERE activo = 1"
                total_result = connectToMySQL(cls.db).query_db(query_total)
                total_alumnos = total_result[0]['total_alumnos'] if total_result else 0

                return {
                    'presentes': stats['presentes'] or 0,
                    'ausentes': stats['ausentes'] or 0,
                    'tardanzas': stats['tardanzas'] or 0,
                    'justificados': stats['justificados'] or 0,
                    'total_registros': stats['total_registros'] or 0,
                    'total_alumnos': total_alumnos,
                    'fecha': fecha
                }
            else:
                # Si no hay registros, devolver ceros
                query_total = "SELECT COUNT(*) as total_alumnos FROM alumnos WHERE activo = 1"
                total_result = connectToMySQL(cls.db).query_db(query_total)
                total_alumnos = total_result[0]['total_alumnos'] if total_result else 0

                return {
                    'presentes': 0,
                    'ausentes': 0,
                    'tardanzas': 0,
                    'justificados': 0,
                    'total_registros': 0,
                    'total_alumnos': total_alumnos,
                    'fecha': fecha
                }

        except Exception as e:
            print(f"Error obteniendo estadísticas del día {fecha}: {str(e)}")
            # En caso de error, devolver datos por defecto
            return {
                'presentes': 0,
                'ausentes': 0,
                'tardanzas': 0,
                'justificados': 0,
                'total_registros': 0,
                'total_alumnos': 0,
                'fecha': fecha
            }
