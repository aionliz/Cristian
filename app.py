# app.py
from base.controllers import curso_controller
from flask import Flask, render_template, session, redirect, url_for, request, flash, Blueprint
from base.config.mysqlconnection import connectToMySQL
from base.models.user_model import UserModel
from base.controllers import asistencia_controller, huella_controller, admin_controller
from base.controllers.asignatura_controller import asignatura_bp
from base.controllers.profesor_controller import profesor_bp
from base.controllers.debug_controller import debug_bp

# =========================================================
# Crear la instancia de la aplicación Flask
# =========================================================
app = Flask(__name__,
            template_folder='base/templates',
            static_folder='base/static')

# =========================================================
# Cargar la configuración directamente en app.config
# =========================================================
app.config['SECRET_KEY'] = 'Una_Cadena_Super_Secreta_Y_Compleja_Para_Produccion_Nunca_La_Dejes_Asi'
app.debug = True  # O False para producción

# =========================================================
# Blueprints y Rutas
# =========================================================

# Blueprint para autenticación
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        # Simulación de autenticación
        if email == 'admin@colegio-aml.cl' and password == 'admin123':
            session['user_id'] = 46
            session['user_email'] = email
            session['user_role'] = 'admin'
            flash('Inicio de sesión exitoso', 'success')
            return redirect(url_for('asistencia.index'))
        elif email == 'juan.perez@colegio-aml.cl' and password == 'profesor123':
            session['user_id'] = 47
            session['user_email'] = email
            session['user_role'] = 'profesor'
            flash('Inicio de sesión exitoso', 'success')
            return redirect(url_for('asistencia.index'))
        else:
            flash('Email o contraseña incorrectos', 'error')

    return render_template('auth/login.html')


@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('Sesión cerrada exitosamente', 'info')
    return redirect(url_for('index'))


@auth_bp.route('/perfil')
def perfil():
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    return render_template('auth/perfil.html')


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Aquí iría la lógica de registro
        flash('Registro exitoso. Puedes iniciar sesión ahora.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('auth/register.html')


# Blueprint para asistencia
asistencia_bp = Blueprint('asistencia', __name__, url_prefix='/asistencia')

# Registrar rutas de asistencia
asistencia_bp.add_url_rule('/', 'index', asistencia_controller.index)
asistencia_bp.add_url_rule('/marcar', 'marcar_asistencia',
                           asistencia_controller.marcar_asistencia, methods=['GET', 'POST'])
asistencia_bp.add_url_rule(
    '/curso', 'listar_por_curso', asistencia_controller.listar_por_curso)
asistencia_bp.add_url_rule('/curso/marcar', 'marcar_curso_completo',
                           asistencia_controller.marcar_curso_completo, methods=['POST'])
asistencia_bp.add_url_rule('/alumno/<int:id_alumno>',
                           'detalle_alumno', asistencia_controller.detalle_alumno)
asistencia_bp.add_url_rule('/editar/<int:id_asistencia>', 'editar_asistencia',
                           asistencia_controller.editar_asistencia, methods=['GET', 'POST'])
asistencia_bp.add_url_rule('/eliminar/<int:id_asistencia>', 'eliminar_asistencia',
                           asistencia_controller.eliminar_asistencia, methods=['DELETE'])
asistencia_bp.add_url_rule(
    '/buscar_alumno', 'buscar_alumno', asistencia_controller.buscar_alumno)
asistencia_bp.add_url_rule(
    '/reportes', 'reporte_mensual', asistencia_controller.reporte_mensual)
asistencia_bp.add_url_rule(
    '/reporte-mensual', 'reporte_mensual_alt', asistencia_controller.reporte_mensual)
asistencia_bp.add_url_rule(
    '/reportes/exportar-pdf', 'exportar_reporte_pdf', asistencia_controller.exportar_reporte_pdf)
asistencia_bp.add_url_rule('/detectar-dispositivos', 'detectar_dispositivos',
                           asistencia_controller.detectar_dispositivos)
asistencia_bp.add_url_rule(
    '/debug-sesion', 'debug_sesion', asistencia_controller.debug_sesion)
asistencia_bp.add_url_rule('/controlar-luces', 'controlar_luces_lector',
                           asistencia_controller.controlar_luces_lector)

# Blueprint para huellas dactilares (legacy)
huellas_bp = Blueprint('huellas', __name__, url_prefix='/huellas')

# Registrar rutas de huellas legacy (redirigen al nuevo sistema)
huellas_bp.add_url_rule('/', 'index', huella_controller.index)
huellas_bp.add_url_rule('/registrar', 'registrar_huella',
                        huella_controller.registrar_huella, methods=['GET', 'POST'])
huellas_bp.add_url_rule('/terminal', 'terminal_asistencia',
                        huella_controller.terminal_asistencia)
huellas_bp.add_url_rule('/gestionar/<int:id_alumno>',
                        'gestionar_alumno', huella_controller.gestionar_alumno)
huellas_bp.add_url_rule('/eliminar/<int:id_huella>', 'eliminar_huella',
                        huella_controller.eliminar_huella, methods=['DELETE'])
huellas_bp.add_url_rule('/buscar_alumno', 'buscar_alumno_huella',
                        huella_controller.buscar_alumno_huella)
huellas_bp.add_url_rule('/estadisticas', 'estadisticas',
                        huella_controller.estadisticas)

# Blueprint para sistema biométrico
biometric_bp = Blueprint('biometric', __name__, url_prefix='/biometric')

# Registrar rutas biométricas
biometric_bp.add_url_rule('/admin', 'admin_panel',
                          huella_controller.admin_panel)
biometric_bp.add_url_rule(
    '/terminal', 'terminal_asistencia', huella_controller.terminal_asistencia)
biometric_bp.add_url_rule('/init_device', 'init_device',
                          huella_controller.init_device, methods=['POST'])
biometric_bp.add_url_rule('/capture', 'capturar_huella',
                          huella_controller.capturar_huella, methods=['POST'])
biometric_bp.add_url_rule('/register', 'register_fingerprint',
                          huella_controller.register_fingerprint, methods=['POST'])
biometric_bp.add_url_rule('/verify', 'verificar_huella',
                          huella_controller.verificar_huella, methods=['POST'])
biometric_bp.add_url_rule('/device_status', 'device_status',
                          huella_controller.device_status, methods=['GET'])
biometric_bp.add_url_rule('/check_finger', 'check_finger',
                          huella_controller.check_finger, methods=['POST'])
biometric_bp.add_url_rule('/mark_attendance', 'mark_attendance',
                          huella_controller.mark_attendance, methods=['POST'])
biometric_bp.add_url_rule('/attendance_summary', 'attendance_summary',
                          huella_controller.attendance_summary, methods=['GET'])

# Blueprint para fingerprint (endpoints de verificación)
fingerprint_bp = Blueprint('fingerprint', __name__, url_prefix='/fingerprint')
fingerprint_bp.add_url_rule('/verify-status', 'verify_status',
                            huella_controller.verify_status, methods=['POST'])

# Blueprint para administración
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

# Importar controlador de cursos

# Registrar rutas de administración - ALUMNOS
admin_bp.add_url_rule('/gestionar-alumnos', 'gestionar_alumnos',
                      admin_controller.gestionar_alumnos)
admin_bp.add_url_rule('/agregar-alumno', 'agregar_alumno',
                      admin_controller.agregar_alumno, methods=['GET', 'POST'])
admin_bp.add_url_rule('/editar-alumno/<int:id>', 'editar_alumno',
                      admin_controller.editar_alumno, methods=['GET', 'POST'])
admin_bp.add_url_rule('/eliminar-alumno/<int:id>', 'eliminar_alumno',
                      admin_controller.eliminar_alumno, methods=['GET'])
admin_bp.add_url_rule('/alumnos/buscar', 'buscar_alumnos',
                      admin_controller.buscar_alumnos)

# Nuevas rutas para AJAX
admin_bp.add_url_rule('/alumnos/<int:id>/datos', 'obtener_datos_alumno',
                      admin_controller.obtener_datos_alumno)
admin_bp.add_url_rule('/alumnos/<int:id>/detalles', 'obtener_detalles_alumno',
                      admin_controller.obtener_detalles_alumno)
admin_bp.add_url_rule('/alumnos/<int:id>/actualizar', 'actualizar_alumno',
                      admin_controller.actualizar_alumno, methods=['POST'])
admin_bp.add_url_rule('/alumnos/<int:id>/eliminar', 'eliminar_alumno_ajax',
                      admin_controller.eliminar_alumno_ajax, methods=['POST'])

# Registrar rutas de administración - CURSOS
admin_bp.add_url_rule('/cursos', 'gestionar_cursos',
                      curso_controller.gestionar_cursos)
admin_bp.add_url_rule('/cursos/agregar', 'agregar_curso',
                      curso_controller.agregar_curso, methods=['GET', 'POST'])
admin_bp.add_url_rule('/cursos/crear', 'crear_curso',
                      curso_controller.crear_curso, methods=['POST'])
admin_bp.add_url_rule('/cursos/<int:id_curso>/editar', 'editar_curso',
                      curso_controller.editar_curso, methods=['GET', 'POST'])
admin_bp.add_url_rule('/cursos/<int:id_curso>/eliminar', 'eliminar_curso',
                      curso_controller.eliminar_curso, methods=['POST'])
admin_bp.add_url_rule('/cursos/<int:id_curso>/detalle',
                      'detalle_curso', curso_controller.detalle_curso)
admin_bp.add_url_rule('/cursos/buscar', 'buscar_cursos',
                      curso_controller.buscar_cursos)
admin_bp.add_url_rule('/api/cursos', 'get_cursos_api',
                      curso_controller.get_cursos_api)

# Blueprint para huellas de profesores
# huellas_profesor_bp = Blueprint('huellas_profesor', __name__, url_prefix='/huellas-profesor')

# Registrar rutas de huellas de profesores
# huellas_profesor_bp.add_url_rule('/registrar', 'registrar', huella_profesor_controller.registrar_huella_profesor, methods=['GET'])
# huellas_profesor_bp.add_url_rule('/procesar-registro', 'procesar_registro', huella_profesor_controller.procesar_registro_huella_profesor, methods=['POST'])
# huellas_profesor_bp.add_url_rule('/listar', 'listar', huella_profesor_controller.listar_huellas_profesor)
# huellas_profesor_bp.add_url_rule('/eliminar', 'eliminar', huella_profesor_controller.eliminar_huella_profesor, methods=['POST'])
# huellas_profesor_bp.add_url_rule('/verificar', 'verificar', huella_profesor_controller.verificar_huella_profesor, methods=['POST'])
# huellas_profesor_bp.add_url_rule('/verificar_dispositivo', 'verificar_dispositivo', huella_profesor_controller.verificar_dispositivo, methods=['POST'])

# Registrar los blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(asistencia_bp)
app.register_blueprint(huellas_bp)
app.register_blueprint(biometric_bp)
app.register_blueprint(fingerprint_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(asignatura_bp)
app.register_blueprint(profesor_bp)
app.register_blueprint(debug_bp)
# app.register_blueprint(huellas_profesor_bp)


@app.route('/')
def index():
    """Página principal que redirige al sistema de asistencia"""
    if 'user_id' in session:
        return redirect(url_for('asistencia.index'))
    return redirect(url_for('auth.login'))


@app.route('/favicon.ico')
def favicon():
    return app.send_static_file('img/favicon.ico')


# =========================================================
# Filtros personalizados para templates
# =========================================================

@app.template_filter('format_time')
def format_time_filter(value):
    """Convierte timedelta a formato HH:MM"""
    if value is None:
        return ''

    # Si ya es un string, devolverlo tal como está
    if isinstance(value, str):
        return value

    # Si es un timedelta, convertirlo a formato HH:MM
    if hasattr(value, 'total_seconds'):
        total_seconds = int(value.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        return f"{hours:02d}:{minutes:02d}"

    # Si es un objeto time/datetime, usar strftime
    if hasattr(value, 'strftime'):
        return value.strftime('%H:%M')

    return str(value)


# =========================================================
# Ejecutar la aplicación
# =========================================================
if __name__ == "__main__":
    print("🏫 Sistema de Asistencia - Colegio AML")
    print("🌐 Iniciando servidor Flask...")
    print("📍 URL: http://127.0.0.1:5003")
    app.run(debug=True, port=5003)
