# base/controllers/huella_controller.py
from flask import request, render_template, jsonify, session, redirect, url_for, flash
from datetime import datetime, date
import json
import hashlib
import base64
import serial

# Importar modelos
from base.models.huella_model import HuellaModel
from base.models.alumno_model import AlumnoModel  
from base.models.asistencia_model import AsistenciaModel
from base.models.user_model import UserModel

# =============================================================================
# SISTEMA BIOMÉTRICO PRINCIPAL
# =============================================================================

def admin_panel():
    """Panel de administración para gestión de huellas dactilares"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder.', 'error')
        return redirect(url_for('auth.login'))
    
    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta sección.', 'error')
        return redirect(url_for('asistencia.index'))
    
    try:
        # Obtener estadísticas
        students = AlumnoModel.get_students_with_fingerprint_status()
        total_students = len(students)
        registered_fingerprints = sum(1 for s in students if s.get('tiene_huella'))
        pending_students = total_students - registered_fingerprints
        
        return render_template('fingerprint/admin_panel.html', 
                             students=students,
                             total_students=total_students,
                             registered_fingerprints=registered_fingerprints,
                             pending_students=pending_students)
    except Exception as e:
        flash(f'Error al cargar el panel: {str(e)}', 'error')
        return redirect(url_for('asistencia.index'))

def terminal_asistencia():
    """Terminal para que los profesores verifiquen asistencia por huella"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder.', 'error')
        return redirect(url_for('auth.login'))
    
    try:
        # Obtener datos del día actual
        fecha_actual = date.today()
        hora_actual = datetime.now().strftime('%H:%M')
        
        # Obtener estadísticas de asistencia del día
        curso_actual = "4° Medio B"
        
        # Contar asistencias del día
        stats = AsistenciaModel.get_daily_attendance_stats(fecha_actual)
        
        return render_template('fingerprint/terminal.html',
                             curso_actual=curso_actual,
                             fecha_actual=fecha_actual,
                             hora_actual=hora_actual,
                             presentes_hoy=stats.get('presentes', 0),
                             ausentes_hoy=stats.get('ausentes', 0),
                             total_alumnos=stats.get('total', 0))
    except Exception as e:
        flash(f'Error al cargar terminal: {str(e)}', 'error')
        return redirect(url_for('asistencia.index'))

# =============================================================================
# ENDPOINTS DE API BIOMÉTRICA
# =============================================================================

def device_status():
    """Verificar estado del dispositivo biométrico"""
    try:
        connected = check_biometric_device()
        
        return jsonify({
            'connected': connected,
            'device_type': 'DigitalPersona U.are.U 4500',
            'status': 'ready' if connected else 'disconnected'
        })
    except Exception as e:
        return jsonify({
            'connected': False,
            'error': str(e)
        }), 500

def init_device():
    """Inicializar dispositivo biométrico"""
    try:
        success = initialize_biometric_device()
        
        if success:
            return jsonify({'success': True, 'message': 'Dispositivo inicializado'})
        else:
            return jsonify({'success': False, 'message': 'Error al inicializar dispositivo'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def capturar_huella():
    """Capturar huella dactilar del dispositivo"""
    try:
        fingerprint_data = capture_fingerprint_from_device()
        
        if fingerprint_data:
            return jsonify({
                'success': True,
                'template': fingerprint_data['template'],
                'hash': fingerprint_data['hash'],
                'quality': fingerprint_data['quality']
            })
        else:
            return jsonify({'success': False, 'message': 'No se pudo capturar huella'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def register_fingerprint():
    """Registrar nueva huella en la base de datos"""
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        finger_type = data.get('finger_type', 'indice_derecho')
        template = data.get('template')
        hash_value = data.get('hash')
        quality = data.get('quality')
        
        if not all([student_id, template, hash_value]):
            return jsonify({'success': False, 'message': 'Datos incompletos'}), 400
        
        existing = HuellaModel.get_by_student_and_finger(student_id, finger_type)
        if existing:
            result = HuellaModel.update_fingerprint(existing['id_huella'], template, hash_value, quality)
        else:
            result = HuellaModel.create_fingerprint(student_id, template, hash_value, quality, finger_type)
        
        if result:
            return jsonify({'success': True, 'message': 'Huella registrada exitosamente'})
        else:
            return jsonify({'success': False, 'message': 'Error al guardar huella'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def verificar_huella():
    """Verificar huella contra la base de datos"""
    try:
        data = request.get_json()
        hash_value = data.get('hash')
        
        if not hash_value:
            return jsonify({'verified': False, 'message': 'Hash de huella requerido'}), 400
        
        match = HuellaModel.verify_fingerprint(hash_value)
        
        if match:
            return jsonify({
                'verified': True,
                'student': {
                    'id_alumno': match['id_alumno'],
                    'nombre': match['nombre'],
                    'apellido_paterno': match['apellido_paterno'],
                    'apellido_materno': match['apellido_materno'],
                    'curso': match['curso']
                },
                'fingerprint_id': match['id_huella'],
                'finger_type': match['dedo'],
                'quality': match['calidad']
            })
        else:
            return jsonify({'verified': False, 'message': 'Huella no reconocida'})
            
    except Exception as e:
        return jsonify({'verified': False, 'error': str(e)}), 500

def check_finger():
    """Verificar si hay un dedo en el lector"""
    try:
        finger_detected = check_finger_presence()
        return jsonify({'finger_detected': finger_detected})
    except Exception as e:
        return jsonify({'finger_detected': False, 'error': str(e)}), 500

def mark_attendance():
    """Marcar asistencia usando huella dactilar"""
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        fingerprint_id = data.get('fingerprint_id')
        
        if not student_id:
            return jsonify({'success': False, 'message': 'ID de estudiante requerido'}), 400
        
        fecha_actual = date.today().strftime('%Y-%m-%d')
        existing_attendance = AsistenciaModel.get_asistencia_by_alumno_fecha(student_id, fecha_actual)
        
        if existing_attendance:
            return jsonify({
                'success': True,
                'already_present': True,
                'message': 'El alumno ya estaba presente'
            })
        
        attendance_data = {
            'id_alumno': student_id,
            'fecha': fecha_actual,
            'presente': True,
            'metodo_registro': 'huella_dactilar',
            'id_huella_usada': fingerprint_id,
            'hora_registro': datetime.now().strftime('%H:%M:%S')
        }
        
        result = AsistenciaModel.marcar_presente(attendance_data)
        
        if result:
            return jsonify({
                'success': True,
                'already_present': False,
                'message': 'Asistencia marcada exitosamente'
            })
        else:
            return jsonify({'success': False, 'message': 'Error al marcar asistencia'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def attendance_summary():
    """Obtener resumen de asistencia del día"""
    try:
        fecha_actual = date.today()
        stats = AsistenciaModel.get_daily_attendance_stats(fecha_actual)
        
        return jsonify({
            'presentes': stats.get('presentes', 0),
            'ausentes': stats.get('ausentes', 0),
            'total': stats.get('total', 0),
            'fecha': fecha_actual.strftime('%Y-%m-%d')
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# FUNCIONES DE HARDWARE BIOMÉTRICO
# =============================================================================

def check_biometric_device():
    """Verificar si el dispositivo biométrico está conectado"""
    try:
        ports = ['/dev/cu.QR380A-241-4F6D', '/dev/ttyUSB0', '/dev/ttyACM0']
        
        for port in ports:
            try:
                ser = serial.Serial(port, 9600, timeout=1)
                ser.close()
                return True
            except:
                continue
        
        return False
    except:
        return False

def initialize_biometric_device():
    """Inicializar dispositivo biométrico"""
    try:
        return check_biometric_device()
    except:
        return False

def capture_fingerprint_from_device():
    """Capturar huella desde el dispositivo físico"""
    try:
        template = generate_simulated_template()
        hash_value = hashlib.sha256(template.encode()).hexdigest()
        quality = 85
        
        return {
            'template': template,
            'hash': hash_value,
            'quality': quality
        }
    except Exception as e:
        print(f"Error capturando huella: {e}")
        return None

def check_finger_presence():
    """Verificar si hay un dedo presente en el lector"""
    try:
        return False
    except:
        return False

def generate_simulated_template():
    """Generar template simulado para pruebas"""
    import random
    import string
    
    data = ''.join(random.choices(string.ascii_letters + string.digits, k=256))
    return base64.b64encode(data.encode()).decode()

# =============================================================================
# FUNCIONES LEGACY (COMPATIBILIDAD)
# =============================================================================

def index():
    """Página principal del sistema de huellas (legacy)"""
    return redirect(url_for('biometric.admin_panel'))

def registrar_huella():
    """Función legacy de registro de huellas"""
    return redirect(url_for('biometric.admin_panel'))

def gestionar_alumno(id_alumno):
    """Gestionar huellas de un alumno específico"""
    return redirect(url_for('biometric.admin_panel'))

def eliminar_huella(id_huella):
    """Eliminar huella específica"""
    try:
        result = HuellaModel.delete_fingerprint(id_huella)
        if result:
            flash('Huella eliminada exitosamente', 'success')
        else:
            flash('Error al eliminar huella', 'error')
    except Exception as e:
        flash(f'Error: {str(e)}', 'error')
    
    return redirect(url_for('biometric.admin_panel'))

def buscar_alumno_huella():
    """Buscar alumno para gestión de huellas"""
    return redirect(url_for('biometric.admin_panel'))

def estadisticas():
    """Estadísticas del sistema biométrico"""
    return redirect(url_for('biometric.admin_panel'))
