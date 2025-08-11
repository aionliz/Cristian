# controllers/curso_controller.py

from flask import render_template, request, redirect, url_for, flash, session, jsonify
from base.models.curso_model import CursoModel
from base.models.alumno_model import AlumnoModel
from base.models.user_model import UserModel
from base.models.asignatura_model import AsignaturaModel
from base.models.profesor_model import ProfesorModel
from base.models.asignacion_model import AsignacionModel
from datetime import datetime, date
import json


def gestionar_cursos():
    """
    Página para gestionar cursos (CRUD).
    Solo accesible para administradores.
    """
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))

    # Obtener todos los cursos
    cursos = CursoModel.get_all()
    niveles = CursoModel.get_niveles_disponibles()
    letras = CursoModel.get_letras_disponibles()

    return render_template('admin/gestionar_cursos.html',
                           cursos=cursos,
                           niveles=niveles,
                           letras=letras)


def agregar_curso():
    """Agregar nuevo curso - Página dedicada con HTML"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))

    if request.method == 'POST':
        try:
            # Manejar checkbox de activo
            activo = 1 if request.form.get('activo') == 'on' else 0

            datos = {
                'nivel': request.form.get('nivel'),
                'letra': request.form.get('letra'),
                'descripcion': request.form.get('descripcion', ''),
                'activo': activo
            }

            # Validaciones básicas
            if not all([datos['nivel'], datos['letra']]):
                flash('Nivel y letra son obligatorios.', 'error')
                asignaturas = AsignaturaModel.get_all()
                profesores = ProfesorModel.get_all()
                return render_template('admin/agregar_curso.html',
                                       asignaturas=asignaturas,
                                       profesores=profesores)

            resultado = CursoModel.create(datos)
            if resultado:
                # Obtener el ID del curso recién creado
                curso_id = resultado

                # Procesar asignaciones si se seleccionaron
                asignaturas_seleccionadas = request.form.getlist(
                    'asignaturas_asignar[]')
                profesores_seleccionados = request.form.getlist(
                    'profesores_asignar[]')

                asignaciones_creadas = 0

                if asignaturas_seleccionadas and profesores_seleccionados:
                    # Crear asignaciones para todas las combinaciones
                    for asignatura_id in asignaturas_seleccionadas:
                        for profesor_id in profesores_seleccionados:
                            try:
                                asignacion_data = {
                                    'id_profesor': profesor_id,
                                    'id_asignatura': asignatura_id,
                                    'id_curso': curso_id,
                                    'activo': 1
                                }
                                asignacion = AsignacionModel(asignacion_data)
                                if AsignacionModel.create(asignacion):
                                    asignaciones_creadas += 1
                            except Exception as e:
                                print(f"Error al crear asignación: {e}")

                mensaje = 'Curso creado exitosamente.'
                if asignaciones_creadas > 0:
                    mensaje += f' Se crearon {asignaciones_creadas} asignación(es).'

                flash(mensaje, 'success')
                return redirect(url_for('admin.gestionar_cursos'))
            else:
                flash('Error al crear el curso', 'error')

        except Exception as e:
            flash(f'Error: {str(e)}', 'error')

    # GET request - mostrar formulario
    asignaturas = AsignaturaModel.get_all()
    profesores = ProfesorModel.get_all()
    return render_template('admin/agregar_curso.html',
                           asignaturas=asignaturas,
                           profesores=profesores)


def crear_curso():
    """
    Crear un nuevo curso - API (mantener para compatibilidad).
    """
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return jsonify({'success': False, 'message': 'No autorizado'}), 403

    if request.method == 'POST':
        data = {
            'nivel': request.form.get('nivel'),
            'letra': request.form.get('letra'),
            'descripcion': request.form.get('descripcion', ''),
            'activo': True
        }

        # Validaciones básicas
        if not all([data['nivel'], data['letra']]):
            return jsonify({'success': False, 'message': 'Nivel y letra son obligatorios'})

        # Validar datos
        if not CursoModel.validar_curso(data):
            return jsonify({'success': False, 'message': 'Datos de curso inválidos'})

        try:
            # Crear el curso
            resultado = CursoModel.create(data)
            if resultado:
                return jsonify({'success': True, 'message': 'Curso creado exitosamente'})
            else:
                return jsonify({'success': False, 'message': 'Error al crear el curso'})
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error: {str(e)}'})

    return jsonify({'success': False, 'message': 'Método no permitido'})


def editar_curso(id_curso):
    """Editar curso existente - Página dedicada con HTML"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))

    if request.method == 'POST':
        try:
            # Manejar checkbox de activo
            activo = 1 if request.form.get('activo') == 'on' else 0

            datos = {
                'nivel': request.form.get('nivel'),
                'letra': request.form.get('letra'),
                'descripcion': request.form.get('descripcion', ''),
                'activo': activo
            }

            # Validaciones básicas
            if not all([datos['nivel'], datos['letra']]):
                flash('Nivel y letra son obligatorios.', 'error')
                curso = CursoModel.get_by_id(id_curso)
                return render_template('admin/editar_curso.html', curso=curso)

            resultado = CursoModel.update(id_curso, datos)
            if resultado:
                flash('Curso actualizado exitosamente', 'success')
                return redirect(url_for('admin.gestionar_cursos'))
            else:
                flash('Error al actualizar el curso', 'error')

        except Exception as e:
            flash(f'Error: {str(e)}', 'error')

    # GET request - mostrar formulario
    try:
        curso = CursoModel.get_by_id(id_curso)
        if not curso:
            flash('Curso no encontrado.', 'error')
            return redirect(url_for('admin.gestionar_cursos'))

        return render_template('admin/editar_curso.html', curso=curso)

    except Exception as e:
        flash(f'Error al cargar curso: {str(e)}', 'error')
        return redirect(url_for('admin.gestionar_cursos'))


def eliminar_curso(id_curso):
    """Eliminar curso - Redirección con confirmación"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para realizar esta acción.', 'error')
        return redirect(url_for('asistencia.index'))

    try:
        # Obtener el curso antes de eliminarlo para mostrar mensaje
        curso = CursoModel.get_by_id(id_curso)
        if not curso:
            flash('Curso no encontrado.', 'error')
            return redirect(url_for('admin.gestionar_cursos'))

        # Eliminar el curso
        resultado = CursoModel.delete(id_curso)
        if resultado and resultado.get('success', False):
            flash(f'Curso {curso.nombre} eliminado exitosamente', 'success')
        else:
            mensaje = resultado.get(
                'message', 'Error al eliminar el curso') if resultado else 'Error al eliminar el curso'
            flash(mensaje, 'error')

    except Exception as e:
        flash(f'Error: {str(e)}', 'error')

    return redirect(url_for('admin.gestionar_cursos'))


def buscar_cursos():
    """
    Buscar cursos por nombre o descripción.
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 403

    query = request.args.get('q', '').strip()
    if len(query) < 1:
        return jsonify([])

    try:
        # Buscar cursos
        cursos = CursoModel.search(query)
        results = []

        for curso in cursos:
            results.append({
                'id': curso.id_curso,
                'nombre': curso.nombre,
                'nivel': curso.nivel,
                'letra': curso.letra,
                'descripcion': curso.descripcion,
                'total_alumnos': getattr(curso, 'total_alumnos', 0)
            })

        return jsonify(results)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})


def detalle_curso(id_curso):
    """
    Muestra el detalle de un curso específico con sus alumnos.
    """
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    # Obtener información del curso
    curso = CursoModel.get_by_id(id_curso)
    if not curso:
        flash('Curso no encontrado.', 'error')
        return redirect(url_for('admin.gestionar_cursos'))

    # Obtener alumnos del curso
    alumnos = AlumnoModel.get_by_curso(id_curso)

    return render_template('admin/detalle_curso.html',
                           curso=curso,
                           alumnos=alumnos)


def get_cursos_api():
    """
    API para obtener todos los cursos (para selects y autocomplete).
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 403

    try:
        cursos = CursoModel.get_all()
        results = []

        for curso in cursos:
            results.append({
                'id_curso': curso.id_curso,
                'nombre': curso.nombre,
                'nivel': curso.nivel,
                'letra': curso.letra,
                'descripcion': curso.descripcion,
                'total_alumnos': getattr(curso, 'total_alumnos', 0)
            })

        return jsonify({'success': True, 'cursos': results})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
