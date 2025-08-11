from flask import render_template, request, redirect, url_for, session, flash, jsonify
from base.models.alumno_model import AlumnoModel
from base.models.curso_model import CursoModel
from base.models.user_model import UserModel
from base.models.asistencia_model import AsistenciaModel
from functools import wraps
import traceback


def admin_required(f):
    """Decorador para verificar que el usuario sea admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Debe iniciar sesión para acceder a esta página.', 'error')
            return redirect(url_for('auth.login'))

        if session.get('user_role') != 'admin':
            flash('No tiene permisos para acceder a esta página.', 'error')
            return redirect(url_for('asistencia.index'))

        return f(*args, **kwargs)
    return decorated_function


def gestionar_alumnos():
    """
    Vista principal para gestionar alumnos.
    Ahora funciona como página principal con AJAX para las operaciones.
    """
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))

    try:
        # Obtener todos los alumnos activos para mostrar en la tabla
        alumnos = AlumnoModel.get_all_with_course()
        alumnos_activos = [
            alumno for alumno in alumnos if hasattr(alumno, 'activo') and alumno.activo == 1]

        # Obtener cursos para el formulario
        cursos = CursoModel.get_all()

        return render_template('admin/gestionar_alumnos.html',
                               alumnos=alumnos_activos,
                               cursos=cursos)
    except Exception as e:
        print(f"Error en gestionar_alumnos: {str(e)}")
        flash(f'Error al cargar la página: {str(e)}', 'error')
        return redirect(url_for('asistencia.index'))


def agregar_alumno():
    """Agregar nuevo alumno - Ahora con página dedicada"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))

    if request.method == 'POST':
        try:
            datos = {
                'nombre': request.form.get('nombre'),
                'apellido_paterno': request.form.get('apellido'),
                'apellido_materno': request.form.get('apellido_materno', ''),
                'email': request.form.get('email'),
                'telefono': request.form.get('telefono'),
                'fecha_nacimiento': request.form.get('fecha_nacimiento') or None,
                'fecha_ingreso': request.form.get('fecha_ingreso') or None,
                'id_curso_fk': request.form.get('id_curso'),
                'direccion': request.form.get('direccion', ''),
                'activo': 1
            }

            resultado = AlumnoModel.create(datos)
            if resultado:
                flash('Alumno agregado correctamente', 'success')
                return redirect(url_for('admin.gestionar_alumnos'))
            else:
                flash('Error al agregar el alumno', 'error')

        except Exception as e:
            flash(f'Error: {str(e)}', 'error')

    # GET request - mostrar formulario
    try:
        cursos = CursoModel.get_all()
        return render_template('admin/agregar_alumno.html', cursos=cursos)
    except Exception as e:
        flash(f'Error al cargar cursos: {str(e)}', 'error')
        return redirect(url_for('admin.gestionar_alumnos'))


def editar_alumno(id):
    """Editar alumno existente - Ahora con página dedicada"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))

    if request.method == 'POST':
        try:
            datos = {
                'nombre': request.form.get('nombre'),
                'apellido_paterno': request.form.get('apellido'),
                'apellido_materno': request.form.get('apellido_materno', ''),
                'email': request.form.get('email'),
                'telefono': request.form.get('telefono'),
                'fecha_nacimiento': request.form.get('fecha_nacimiento') or None,
                'fecha_ingreso': request.form.get('fecha_ingreso') or None,
                'id_curso_fk': request.form.get('id_curso'),
                'direccion': request.form.get('direccion', ''),
                'activo': 1
            }

            resultado = AlumnoModel.update(id, datos)
            if resultado:
                flash('Alumno actualizado correctamente', 'success')
                return redirect(url_for('admin.gestionar_alumnos'))
            else:
                flash('Error al actualizar el alumno', 'error')

        except Exception as e:
            flash(f'Error: {str(e)}', 'error')

    # GET request - mostrar formulario
    try:
        alumno = AlumnoModel.get_by_id(id)
        if not alumno:
            flash('Alumno no encontrado.', 'error')
            return redirect(url_for('admin.gestionar_alumnos'))

        cursos = CursoModel.get_all()
        return render_template('admin/editar_alumno.html', alumno=alumno, cursos=cursos)
    except Exception as e:
        flash(f'Error al cargar alumno: {str(e)}', 'error')
        return redirect(url_for('admin.gestionar_alumnos'))


def eliminar_alumno(id):
    """Eliminar alumno (marcar como inactivo) - Ahora con confirmación"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))

    try:
        # Obtener información del alumno antes de eliminarlo
        alumno = AlumnoModel.get_by_id(id)
        if not alumno:
            flash('Alumno no encontrado.', 'error')
            return redirect(url_for('admin.gestionar_alumnos'))

        # Marcar como inactivo en lugar de eliminar completamente
        resultado = AlumnoModel.update(id, {'activo': 0})
        if resultado:
            flash(
                f'Alumno {alumno.nombre} {alumno.apellido_paterno} eliminado correctamente', 'success')
        else:
            flash('Error al eliminar el alumno', 'error')
    except Exception as e:
        flash(f'Error: {str(e)}', 'error')

    return redirect(url_for('admin.gestionar_alumnos'))


def gestionar_cursos():
    """Gestionar cursos"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))

    try:
        cursos = CursoModel.get_all()
        return render_template('admin/gestionar_cursos.html', cursos=cursos)
    except Exception as e:
        flash(f'Error al cargar cursos: {str(e)}', 'error')
        return redirect(url_for('asistencia.index'))


def detalle_curso(id):
    """Ver detalle de un curso"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))

    try:
        curso = CursoModel.get_by_id(id)
        alumnos = AlumnoModel.get_by_curso(id)
        return render_template('admin/detalle_curso.html', curso=curso, alumnos=alumnos)
    except Exception as e:
        flash(f'Error al cargar curso: {str(e)}', 'error')
        return redirect(url_for('admin.gestionar_cursos'))


def buscar_alumnos():
    """
    Búsqueda AJAX de alumnos con autocompletado mejorado.
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    if session.get('user_role') != 'admin':
        return jsonify({'success': False, 'message': 'Acceso denegado'}), 403

    try:
        query = request.args.get('q', '').strip()
        if not query or len(query) < 2:
            return jsonify([])

        alumnos = AlumnoModel.search_alumnos(query)

        # Formatear resultados para jQuery UI autocomplete
        results = []
        for alumno in alumnos:
            nombre_completo = f"{alumno.nombre} {alumno.apellido_paterno}"
            if alumno.apellido_materno:
                nombre_completo += f" {alumno.apellido_materno}"

            results.append({
                'id': alumno.id_alumno,
                'label': f"{nombre_completo}",
                'value': nombre_completo,
                'nombre': alumno.nombre,
                'apellido_paterno': alumno.apellido_paterno,
                'apellido_materno': alumno.apellido_materno or '',
                'email': alumno.email or '',
                'telefono': alumno.telefono or ''
            })

        return jsonify(results)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})


def obtener_datos_alumno(id):
    """
    Obtener datos de un alumno específico para edición.
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    if session.get('user_role') != 'admin':
        return jsonify({'success': False, 'message': 'Acceso denegado'}), 403

    try:
        alumno = AlumnoModel.get_by_id(id)
        if not alumno:
            return jsonify({'success': False, 'message': 'Alumno no encontrado'})

        return jsonify({
            'success': True,
            'alumno': {
                'id_alumno': alumno.id_alumno,
                'nombre': alumno.nombre,
                'apellido_paterno': alumno.apellido_paterno,
                'apellido_materno': alumno.apellido_materno,
                'email': alumno.email,
                'telefono': alumno.telefono,
                'fecha_nacimiento': alumno.fecha_nacimiento.isoformat() if alumno.fecha_nacimiento else '',
                'fecha_ingreso': alumno.fecha_ingreso.isoformat() if alumno.fecha_ingreso else '',
                'id_curso_fk': alumno.id_curso_fk,
                'direccion': alumno.direccion if hasattr(alumno, 'direccion') else ''
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})


def obtener_detalles_alumno(id):
    """
    Obtener detalles completos de un alumno.
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    if session.get('user_role') != 'admin':
        return jsonify({'success': False, 'message': 'Acceso denegado'}), 403

    try:
        alumno = AlumnoModel.get_by_id(id)
        if not alumno:
            return jsonify({'success': False, 'message': 'Alumno no encontrado'})

        return jsonify({
            'success': True,
            'alumno': {
                'id_alumno': alumno.id_alumno,
                'nombre': alumno.nombre,
                'apellido_paterno': alumno.apellido_paterno,
                'apellido_materno': alumno.apellido_materno,
                'email': alumno.email,
                'telefono': alumno.telefono,
                'fecha_nacimiento': alumno.fecha_nacimiento.strftime('%d/%m/%Y') if alumno.fecha_nacimiento else 'No especificada',
                'fecha_ingreso': alumno.fecha_ingreso.strftime('%d/%m/%Y') if alumno.fecha_ingreso else 'No especificada',
                'curso_nombre': alumno.curso_nombre if hasattr(alumno, 'curso_nombre') else 'No asignado',
                'direccion': alumno.direccion if hasattr(alumno, 'direccion') else 'No especificada'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})


def crear_alumno():
    """
    Crear un nuevo alumno.
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    if session.get('user_role') != 'admin':
        return jsonify({'success': False, 'message': 'Acceso denegado'}), 403

    try:
        # Validar datos requeridos
        datos_requeridos = ['nombre', 'apellido', 'id_curso']
        for campo in datos_requeridos:
            if not request.form.get(campo):
                return jsonify({'success': False, 'message': f'El campo {campo} es requerido'})

        # Crear el alumno
        resultado = AlumnoModel.create({
            'nombre': request.form.get('nombre'),
            'apellido_paterno': request.form.get('apellido'),
            'apellido_materno': request.form.get('apellido_materno', ''),
            'email': request.form.get('email', ''),
            'telefono': request.form.get('telefono', ''),
            'fecha_nacimiento': request.form.get('fecha_nacimiento') or None,
            'fecha_ingreso': request.form.get('fecha_ingreso') or None,
            'id_curso_fk': request.form.get('id_curso'),
            'direccion': request.form.get('direccion', ''),
            'activo': 1
        })

        if resultado:
            return jsonify({'success': True, 'message': 'Alumno creado correctamente'})
        else:
            return jsonify({'success': False, 'message': 'Error al crear el alumno'})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})


def actualizar_alumno(id):
    """
    Actualizar un alumno existente.
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    if session.get('user_role') != 'admin':
        return jsonify({'success': False, 'message': 'Acceso denegado'}), 403

    try:
        # Validar que el alumno existe
        alumno = AlumnoModel.get_by_id(id)
        if not alumno:
            return jsonify({'success': False, 'message': 'Alumno no encontrado'})

        # Validar datos requeridos
        datos_requeridos = ['nombre', 'apellido', 'id_curso']
        for campo in datos_requeridos:
            if not request.form.get(campo):
                return jsonify({'success': False, 'message': f'El campo {campo} es requerido'})

        # Actualizar el alumno
        datos_actualizacion = {
            'nombre': request.form.get('nombre'),
            'apellido_paterno': request.form.get('apellido'),
            'apellido_materno': request.form.get('apellido_materno', ''),
            'email': request.form.get('email', ''),
            'telefono': request.form.get('telefono', ''),
            'fecha_nacimiento': request.form.get('fecha_nacimiento') or None,
            'fecha_ingreso': request.form.get('fecha_ingreso') or None,
            'id_curso_fk': request.form.get('id_curso'),
            'direccion': request.form.get('direccion', '')
        }

        resultado = AlumnoModel.update(id, datos_actualizacion)

        if resultado:
            return jsonify({'success': True, 'message': 'Alumno actualizado correctamente'})
        else:
            return jsonify({'success': False, 'message': 'Error al actualizar el alumno'})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})


def eliminar_alumno_ajax(id):
    """
    Eliminar un alumno (marcar como inactivo).
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    if session.get('user_role') != 'admin':
        return jsonify({'success': False, 'message': 'Acceso denegado'}), 403

    try:
        # Validar que el alumno existe
        alumno = AlumnoModel.get_by_id(id)
        if not alumno:
            return jsonify({'success': False, 'message': 'Alumno no encontrado'})

        # Marcar como inactivo en lugar de eliminar completamente
        resultado = AlumnoModel.update(id, {'activo': 0})

        if resultado:
            return jsonify({'success': True, 'message': 'Alumno eliminado correctamente'})
        else:
            return jsonify({'success': False, 'message': 'Error al eliminar el alumno'})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
