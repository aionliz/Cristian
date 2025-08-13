# controllers/asistencia_controller.py

from flask import render_template, request, redirect, url_for, flash, session, jsonify
from base.models.asistencia_model import AsistenciaModel
from base.models.alumno_model import AlumnoModel
from base.models.user_model import UserModel
from base.models.curso_model import CursoModel
from datetime import datetime, date
import json
import logging
import urllib.parse

# Configurar logging
logger = logging.getLogger(__name__)


def index():
    """
    Página principal de asistencia - muestra el resumen del día actual.
    """
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    # Obtener la fecha actual
    fecha_actual = date.today().strftime('%Y-%m-%d')

    # Si es profesor, mostrar solo sus cursos
    # Si es admin, mostrar todos los cursos
    user = UserModel.get_by_id(session['user_id'])

    if not user:
        flash('Usuario no encontrado.', 'error')
        return redirect(url_for('auth.login'))

    return render_template('asistencia/index.html',
                           fecha_actual=fecha_actual,
                           user=user)


def marcar_asistencia():
    """
    Página para marcar asistencia de alumnos.
    """
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    user = UserModel.get_by_id(session['user_id'])

    if request.method == 'POST':
        print(f"[DEBUG] POST recibido en marcar_asistencia")
        print(f"[DEBUG] Content-Type: {request.content_type}")

        # Manejar peticiones JSON (desde sistema biométrico) y formularios
        if request.is_json:
            data = request.get_json()
            form_data = {
                'id_alumno': data.get('id_alumno'),
                'fecha': data.get('fecha'),
                'estado': data.get('estado', 'presente'),
                'hora_llegada': data.get('hora_llegada'),
                'observaciones': data.get('observaciones', ''),
                'id_profesor': user.id_profesor_fk if user.rol == 'profesor' else None,
                'metodo_verificacion': data.get('metodo_verificacion', 'manual')
            }
        else:
            # Datos de formulario tradicional
            form_data = {
                'id_alumno': request.form.get('id_alumno'),
                'fecha': request.form.get('fecha'),
                'estado': request.form.get('estado'),
                'hora_llegada': request.form.get('hora_llegada'),
                'observaciones': request.form.get('observaciones', ''),
                'id_profesor': user.id_profesor_fk if user.rol == 'profesor' else None,
                'metodo_verificacion': 'manual'
            }

        print(f"[DEBUG] form_data procesado: {form_data}")

        # Validar los datos
        if AsistenciaModel.validar_asistencia(form_data):
            # Marcar la asistencia
            result = AsistenciaModel.marcar_asistencia(form_data)

            if result:
                alumno = AlumnoModel.get_by_id(form_data['id_alumno'])
                message = f'Asistencia marcada correctamente para {alumno.nombre_completo()}.' if alumno else 'Asistencia marcada correctamente.'

                # Si es una petición JSON, devolver JSON
                if request.is_json:
                    return jsonify({'success': True, 'message': message})

                # Para formularios HTML, usar flash message
                flash(message, 'success')
                return redirect(url_for('asistencia.marcar_asistencia'))
            else:
                error_message = 'Error al marcar la asistencia. Intente nuevamente.'

                if request.is_json:
                    return jsonify({'success': False, 'message': error_message})

                flash(error_message, 'error')
        else:
            error_message = 'Datos de asistencia inválidos.'

            if request.is_json:
                return jsonify({'success': False, 'message': error_message})

            flash(error_message, 'error')

    # Obtener todos los alumnos para el formulario
    alumnos = AlumnoModel.get_all()
    fecha_actual = date.today().strftime('%Y-%m-%d')

    return render_template('asistencia/marcar.html',
                           alumnos=alumnos,
                           fecha_actual=fecha_actual,
                           user=user)


def listar_por_curso():
    """
    Lista la asistencia de todos los alumnos de un curso para una fecha específica.
    """
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    id_curso = request.args.get('curso')
    fecha = request.args.get('fecha', date.today().strftime('%Y-%m-%d'))

    asistencias = []
    alumnos_sin_asistencia = []

    if id_curso:
        # Obtener asistencias del curso para la fecha
        asistencias = AsistenciaModel.get_asistencia_por_curso_fecha(
            id_curso, fecha)

        # Obtener alumnos sin asistencia marcada
        alumnos_sin_asistencia = AsistenciaModel.get_alumnos_sin_asistencia(
            id_curso, fecha)

    # Obtener todos los cursos para el selector
    cursos = CursoModel.get_all()

    # Debug: verificar qué tipos de objetos estamos obteniendo
    print(f"DEBUG: Número de cursos: {len(cursos) if cursos else 0}")
    if cursos:
        print(f"DEBUG: Tipo del primer curso: {type(cursos[0])}")
        print(f"DEBUG: Atributos del primer curso: {dir(cursos[0])}")
        if hasattr(cursos[0], 'nivel'):
            print(f"DEBUG: Nivel del primer curso: {cursos[0].nivel}")
        if hasattr(cursos[0], 'nombre_completo'):
            print(
                f"DEBUG: ¿Es callable nombre_completo?: {callable(cursos[0].nombre_completo)}")

    return render_template('asistencia/por_curso.html',
                           asistencias=asistencias,
                           alumnos_sin_asistencia=alumnos_sin_asistencia,
                           cursos=cursos,
                           id_curso=id_curso,
                           fecha=fecha)


def marcar_curso_completo():
    """
    Marca la asistencia de todos los alumnos de un curso de una vez.
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    if request.method == 'POST':
        try:
            data = request.get_json()
            id_curso = data.get('id_curso')
            fecha = data.get('fecha')
            asistencias = data.get('asistencias', [])

            user = UserModel.get_by_id(session['user_id'])

            resultados = []
            errores = []

            for asistencia in asistencias:
                form_data = {
                    'id_alumno': asistencia['id_alumno'],
                    'fecha': fecha,
                    'estado': asistencia['estado'],
                    'hora_llegada': asistencia.get('hora_llegada'),
                    'observaciones': asistencia.get('observaciones', ''),
                    'id_profesor': user.id_profesor_fk if user.rol == 'profesor' else None
                }

                if AsistenciaModel.validar_asistencia(form_data):
                    result = AsistenciaModel.marcar_asistencia(form_data)
                    if result:
                        resultados.append(asistencia['id_alumno'])
                    else:
                        errores.append(
                            f"Error al marcar asistencia para alumno {asistencia['id_alumno']}")
                else:
                    errores.append(
                        f"Datos inválidos para alumno {asistencia['id_alumno']}")

            return jsonify({
                'success': len(errores) == 0,
                'procesados': len(resultados),
                'errores': errores
            })

        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 400

    return jsonify({'success': False, 'message': 'Método no permitido'}), 405


def detalle_alumno(id_alumno):
    """
    Muestra el detalle de asistencia de un alumno específico.
    """
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    # Obtener información del alumno
    alumno = AlumnoModel.get_by_id(id_alumno)
    if not alumno:
        flash('Alumno no encontrado.', 'error')
        return redirect(url_for('asistencia.index'))

    # Obtener parámetros de fecha
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')

    # Si no se especifican fechas, usar el mes actual
    if not fecha_inicio:
        today = date.today()
        fecha_inicio = date(today.year, today.month, 1).strftime('%Y-%m-%d')
    if not fecha_fin:
        fecha_fin = date.today().strftime('%Y-%m-%d')

    # Obtener resumen de asistencia
    resumen = AsistenciaModel.get_resumen_asistencia_alumno(
        id_alumno, fecha_inicio, fecha_fin)

    # Obtener historial de asistencia
    historial = AsistenciaModel.get_historial_asistencia_alumno(id_alumno, 50)

    # Calcular porcentaje de asistencia
    porcentaje = AsistenciaModel.calcular_porcentaje_asistencia(
        resumen) if resumen else 0

    return render_template('asistencia/detalle_alumno.html',
                           alumno=alumno,
                           resumen=resumen,
                           historial=historial,
                           porcentaje=porcentaje,
                           fecha_inicio=fecha_inicio,
                           fecha_fin=fecha_fin)


def editar_asistencia(id_asistencia):
    """
    Permite editar un registro de asistencia existente.
    """
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    # Obtener el registro de asistencia
    asistencia = AsistenciaModel.get_by_id(id_asistencia)
    if not asistencia:
        flash('Registro de asistencia no encontrado.', 'error')
        return redirect(url_for('asistencia.index'))

    if request.method == 'POST':
        # Procesar hora_llegada: si está vacía, enviar None
        hora_llegada = request.form.get('hora_llegada')
        if hora_llegada == '' or hora_llegada is None:
            hora_llegada = None

        form_data = {
            'id_asistencia': id_asistencia,
            'estado': request.form.get('estado'),
            'hora_llegada': hora_llegada,
            'observaciones': request.form.get('observaciones', ''),
            'id_profesor': session.get('user_id')
        }

        # Actualizar la asistencia
        try:
            result = AsistenciaModel.actualizar_asistencia(form_data)

            if result:
                flash('Asistencia actualizada correctamente.', 'success')
                # Obtener información del alumno para la redirección
                alumno = AlumnoModel.get_by_id(asistencia.id_alumno)
                if alumno and alumno.id_curso_fk:
                    # Redirigir a la página del curso con la fecha
                    return redirect(url_for('asistencia.por_curso',
                                            curso=alumno.id_curso_fk,
                                            fecha=asistencia.fecha.strftime('%Y-%m-%d')))
                else:
                    # Si no tiene curso, redirigir al detalle del alumno
                    return redirect(url_for('asistencia.detalle_alumno', id_alumno=asistencia.id_alumno))
            else:
                flash(
                    'Error al actualizar la asistencia: No se pudo completar la operación.', 'error')
        except Exception as e:
            logger.error(
                f"Error al actualizar asistencia {id_asistencia}: {str(e)}")
            flash(f'Error al actualizar la asistencia: {str(e)}', 'error')

    # Obtener información del alumno
    alumno = AlumnoModel.get_by_id(asistencia.id_alumno)

    return render_template('asistencia/editar.html',
                           asistencia=asistencia,
                           alumno=alumno)


def eliminar_asistencia(id_asistencia):
    """
    Elimina un registro de asistencia.
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    # Verificar que el usuario tenga permisos (solo admin o el profesor que la marcó)
    user = UserModel.get_by_id(session['user_id'])

    if user.rol not in ['admin', 'profesor']:
        return jsonify({'success': False, 'message': 'Sin permisos'}), 403

    result = AsistenciaModel.eliminar_asistencia(id_asistencia)

    if result:
        return jsonify({'success': True, 'message': 'Asistencia eliminada correctamente'})
    else:
        return jsonify({'success': False, 'message': 'Error al eliminar la asistencia'}), 400


def buscar_alumno():
    """
    API endpoint para buscar alumnos (autocompletado).
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    term = request.args.get('term', '')

    if len(term) < 2:
        return jsonify([])

    alumnos = AlumnoModel.search(term)

    # Convertir a formato JSON para autocomplete
    results = []
    for alumno in alumnos:
        results.append({
            'id': alumno.id_alumno,
            'value': f"{alumno.nombre_completo()} - {alumno.email}",
            'label': f"{alumno.nombre_completo()} - {alumno.email}",
            'email': alumno.email,
            'nombre': alumno.nombre,
            'apellido': alumno.apellido_paterno,
            'apellido_paterno': alumno.apellido_paterno,
            'apellido_materno': alumno.apellido_materno,
            'curso': getattr(alumno, 'curso', '')
        })

    return jsonify(results)


def reporte_mensual():
    """
    Genera un reporte mensual de asistencia con datos reales.
    """
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    # Obtener parámetros
    mes = request.args.get('mes', date.today().strftime('%Y-%m'))
    id_curso = request.args.get('curso')
    tipo_reporte = request.args.get('tipo', 'general')

    logger.info(
        f"Reporte mensual solicitado - Mes: {mes}, Curso: {id_curso}, Tipo: {tipo_reporte}")
    logger.info(f"Formato solicitado: {request.args.get('formato')}")
    logger.info(f"Headers Accept: {request.headers.get('Accept')}")

    # Si es una petición para generar datos JSON
    if request.args.get('formato') == 'json' or request.headers.get('Accept') == 'application/json':
        try:
            logger.info("Generando datos del reporte...")
            # Generar datos del reporte
            datos_reporte = AsistenciaModel.generar_reporte_mensual(
                mes, id_curso, tipo_reporte)

            logger.info(
                f"Reporte generado exitosamente. Datos: {len(datos_reporte.get('alumnos', []))} alumnos")

            return jsonify({
                'success': True,
                'data': datos_reporte,
                'parametros': {
                    'mes': mes,
                    'curso': id_curso,
                    'tipo': tipo_reporte
                }
            })
        except Exception as e:
            logger.error(f"Error generando reporte mensual: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({
                'success': False,
                'message': str(e)
            }), 500

    # Obtener todos los cursos para el selector
    cursos = CursoModel.get_all()

    return render_template('asistencia/reporte_mensual.html',
                           mes=mes,
                           id_curso=id_curso,
                           tipo_reporte=tipo_reporte,
                           cursos=cursos)


def exportar_reporte_pdf():
    """
    Exporta el reporte de asistencia a PDF.
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    try:
        # Obtener parámetros
        mes = request.args.get('mes', date.today().strftime('%Y-%m'))
        id_curso = request.args.get('curso')
        tipo_reporte = request.args.get('tipo', 'general')

        # Generar datos del reporte
        datos_reporte = AsistenciaModel.generar_reporte_mensual(
            mes, id_curso, tipo_reporte)

        # Generar PDF
        from base.utils.pdf_generator import PDFGenerator

        pdf_generator = PDFGenerator()
        pdf_buffer = pdf_generator.generar_reporte_asistencia(datos_reporte)

        # Crear nombre del archivo
        fecha_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        curso_str = f"_curso_{id_curso}" if id_curso else "_todos_cursos"
        filename = f"reporte_asistencia_{mes}{curso_str}_{fecha_str}.pdf"

        # Devolver el PDF
        from flask import make_response

        response = make_response(pdf_buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'

        return response

    except Exception as e:
        logger.error(f"Error generando PDF: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error generando PDF: {str(e)}'
        }), 500


def detectar_dispositivos():
    """
    Detecta y muestra información sobre los lectores de huellas conectados.
    """
    if 'user_id' not in session:
        return jsonify({'error': 'Debe iniciar sesión para acceder a esta función'}), 401

    # Verificar permisos (admin o profesor)
    user_role = session.get('user_role')
    if user_role not in ['admin', 'profesor']:
        return jsonify({'error': 'No tiene permisos para acceder a esta función'}), 403

    try:
        # Importar el sistema de detección
        from base.hardware.fingerprint_reader import FingerprintReaderFactory
        import platform
        import subprocess
        import os

        dispositivos_detectados = []

        # 1. Auto-detectar lectores de huellas con verificación en tiempo real
        try:
            reader = FingerprintReaderFactory.auto_detect_reader()
            if reader:
                # Obtener información actualizada del dispositivo
                device_info = reader.get_device_info()

                # Verificar estado en tiempo real
                connection_status = "Desconectado"
                devices_found = 0
                available_ports = []

                if hasattr(reader, 'hid_driver'):
                    try:
                        # Verificar conexión actual
                        detected_devices = reader.hid_driver.detect_device()
                        devices_found = len(detected_devices)
                        available_ports = detected_devices

                        if detected_devices:
                            connection_status = "Conectado y funcionando"
                        else:
                            connection_status = "Desconectado físicamente"
                    except Exception as e:
                        logger.warning(
                            f"Error verificando estado del dispositivo: {e}")
                        connection_status = "Error de comunicación"

                dispositivos_detectados.append({
                    'tipo': 'Lector de Huellas',
                    'modelo': device_info.get('model', 'DigitalPersona 4500'),
                    'estado': connection_status,
                    'dispositivos_encontrados': devices_found,
                    'puertos_disponibles': available_ports,
                    'detalles': {
                        **device_info,
                        'verificacion_tiempo_real': True,
                        'ultima_verificacion': device_info.get('last_check', 'N/A')
                    },
                    'dispositivo': device_info.get('port', 'N/A'),
                    'capacidades': {
                        'captura_huellas': True,
                        'control_luces': hasattr(reader, 'hid_driver') and hasattr(reader.hid_driver, 'control_lights'),
                        'led_effects': ['on', 'off', 'blink', 'pulse'] if hasattr(reader, 'hid_driver') else []
                    }
                })
                reader.disconnect()
            else:
                dispositivos_detectados.append({
                    'tipo': 'Lector de Huellas',
                    'modelo': 'No detectado',
                    'estado': 'Desconectado',
                    'dispositivos_encontrados': 0,
                    'puertos_disponibles': [],
                    'detalles': {'verificacion_tiempo_real': True},
                    'dispositivo': 'N/A'
                })
        except Exception as e:
            dispositivos_detectados.append({
                'tipo': 'Lector de Huellas',
                'modelo': 'Error en detección',
                'estado': f'Error: {str(e)}',
                'detalles': {},
                'dispositivo': 'N/A'
            })

        # 2. Detectar dispositivos USB en general
        dispositivos_usb = []
        sistema = platform.system()

        if sistema == "Darwin":  # macOS
            try:
                result = subprocess.run(['system_profiler', 'SPUSBDataType', '-json'],
                                        capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    import json
                    usb_data = json.loads(result.stdout)
                    for item in usb_data.get('SPUSBDataType', []):
                        dispositivos_usb.extend(_extract_usb_devices(item))
            except Exception as e:
                dispositivos_usb.append(
                    {'error': f'Error obteniendo dispositivos USB: {str(e)}'})

        elif sistema == "Linux":
            try:
                result = subprocess.run(
                    ['lsusb'], capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    for line in result.stdout.strip().split('\n'):
                        if line.strip():
                            dispositivos_usb.append(
                                {'descripcion': line.strip()})
            except Exception as e:
                dispositivos_usb.append(
                    {'error': f'Error obteniendo dispositivos USB: {str(e)}'})

        elif sistema == "Windows":
            try:
                result = subprocess.run(['wmic', 'path', 'Win32_USBHub', 'get', 'DeviceID,Name', '/format:csv'],
                                        capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    lines = result.stdout.strip().split('\n')[
                        1:]  # Skip header
                    for line in lines:
                        if line.strip():
                            parts = line.strip().split(',')
                            if len(parts) >= 3:
                                dispositivos_usb.append({
                                    'id': parts[1],
                                    'nombre': parts[2]
                                })
            except Exception as e:
                dispositivos_usb.append(
                    {'error': f'Error obteniendo dispositivos USB: {str(e)}'})

        # 3. Información del sistema
        info_sistema = {
            'sistema_operativo': platform.system(),
            'version': platform.version(),
            'arquitectura': platform.machine(),
            'python_version': platform.python_version()
        }

        return jsonify({
            'dispositivos_huellas': dispositivos_detectados,
            'dispositivos_usb': dispositivos_usb,
            'sistema': info_sistema,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': f'Error en detección: {str(e)}'}), 500


def _extract_usb_devices(item, devices=[]):
    """Función auxiliar para extraer dispositivos USB de macOS system_profiler"""
    if isinstance(item, dict):
        # Si es un dispositivo USB
        if 'product_id' in item or 'vendor_id' in item:
            device_info = {
                'nombre': item.get('_name', 'Dispositivo USB'),
                'vendor_id': item.get('vendor_id', 'N/A'),
                'product_id': item.get('product_id', 'N/A'),
                'manufacturer': item.get('manufacturer', 'N/A')
            }
            devices.append(device_info)

        # Buscar recursivamente en elementos anidados
        for key, value in item.items():
            if isinstance(value, (list, dict)):
                _extract_usb_devices(value, devices)

    elif isinstance(item, list):
        for sub_item in item:
            _extract_usb_devices(sub_item, devices)

    return devices


def debug_sesion():
    """Función de debug para verificar el estado de la sesión"""
    return jsonify({
        'session_data': dict(session),
        'user_id': session.get('user_id'),
        'user_email': session.get('user_email'),
        'user_role': session.get('user_role'),
        'session_keys': list(session.keys())
    })


def controlar_luces_lector():
    """Controlar las luces del lector de huellas"""
    if 'user_id' not in session:
        return jsonify({'error': 'Debe iniciar sesión para acceder a esta función'}), 401

    # Verificar permisos (admin o profesor)
    user_role = session.get('user_role')
    if user_role not in ['admin', 'profesor']:
        return jsonify({'error': 'No tiene permisos para acceder a esta función'}), 403

    try:
        # Obtener parámetros
        action = request.args.get('action', 'on')  # on, off, blink, pulse
        duration = float(request.args.get('duration', 0))

        # Importar el sistema de lectores
        from base.hardware.fingerprint_reader import FingerprintReaderFactory

        # Detectar lector
        reader = FingerprintReaderFactory.auto_detect_reader()
        if not reader:
            return jsonify({
                'success': False,
                'error': 'No se detectó ningún lector de huellas'
            }), 404

        # Verificar si el lector soporta control de luces
        if hasattr(reader, 'hid_driver') and hasattr(reader.hid_driver, 'control_lights'):
            # Ejecutar comando de luces
            success = reader.hid_driver.control_lights(action, duration)

            response = {
                'success': success,
                'action': action,
                'duration': duration,
                'reader_model': reader.device_info.get('model', 'Desconocido'),
                'message': f'Comando de luces "{action}" enviado al lector',
                'timestamp': datetime.now().isoformat()
            }

            # Desconectar lector
            reader.disconnect()

            return jsonify(response)

        else:
            return jsonify({
                'success': False,
                'error': 'El lector detectado no soporta control de luces',
                'reader_model': reader.device_info.get('model', 'Desconocido')
            }), 400

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error controlando luces: {str(e)}'
        }), 500


def estadisticas_hoy():
    """
    Endpoint para obtener estadísticas de asistencia del día actual.
    Retorna un JSON con el conteo de presentes y ausentes.
    """
    if 'user_id' not in session:
        return jsonify({'error': 'No autorizado'}), 401

    try:
        # Obtener la fecha actual
        fecha_actual = date.today().strftime('%Y-%m-%d')

        # Obtener estadísticas del modelo
        estadisticas = AsistenciaModel.get_estadisticas_del_dia(fecha_actual)

        return jsonify({
            'success': True,
            'presentes': estadisticas.get('presentes', 0),
            'ausentes': estadisticas.get('ausentes', 0),
            'tardanzas': estadisticas.get('tardanzas', 0),
            'justificados': estadisticas.get('justificados', 0),
            'total_alumnos': estadisticas.get('total_alumnos', 0),
            'fecha': fecha_actual
        })

    except Exception as e:
        logger.error(f"Error obteniendo estadísticas del día: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor',
            'presentes': 0,
            'ausentes': 0,
            'tardanzas': 0,
            'justificados': 0,
            'total_alumnos': 0
        }), 500
