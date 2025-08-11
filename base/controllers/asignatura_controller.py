# controllers/asignatura_controller.py

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from base.models.asignatura_model import AsignaturaModel
from base.models.asignacion_model import AsignacionModel
from base.models.curso_model import CursoModel
from base.models.profesor_model import ProfesorModel
from base.models.alumno_model import AlumnoModel

# Crear el blueprint
asignatura_bp = Blueprint('asignatura', __name__, url_prefix='/asignaturas')


@asignatura_bp.route('/')
def gestionar_asignaturas():
    """Página principal de gestión de asignaturas"""
    try:
        asignaturas = AsignaturaModel.get_with_stats()
        return render_template('admin/gestionar_asignaturas.html', asignaturas=asignaturas)
    except Exception as e:
        flash(f'Error al cargar las asignaturas: {str(e)}', 'error')
        return render_template('admin/gestionar_asignaturas.html', asignaturas=[])


@asignatura_bp.route('/agregar', methods=['GET', 'POST'])
def agregar_asignatura():
    """Agregar nueva asignatura"""
    if request.method == 'POST':
        # Validar formulario
        errores = AsignaturaModel.validate_form(request.form)

        # Verificar duplicados
        if AsignaturaModel.check_duplicate_name(request.form.get('nombre', '')):
            errores.append('Ya existe una asignatura con ese nombre.')

        if errores:
            for error in errores:
                flash(error, 'error')
            profesores = ProfesorModel.get_all()
            cursos = CursoModel.get_all()
            return render_template('admin/agregar_asignatura.html',
                                   profesores=profesores,
                                   cursos=cursos)

        try:
            # Preparar datos
            data = {
                'nombre': request.form['nombre'].strip(),
                'descripcion': request.form.get('descripcion', '').strip()
            }

            # Crear asignatura
            result = AsignaturaModel.create(data)

            if result:
                # Obtener el ID de la asignatura recién creada
                asignatura_id = result

                # Procesar asignaciones si se seleccionaron
                profesores_seleccionados = request.form.getlist(
                    'profesores_asignar[]')
                cursos_seleccionados = request.form.getlist('cursos_asignar[]')

                asignaciones_creadas = 0

                if profesores_seleccionados and cursos_seleccionados:
                    # Crear asignaciones para todas las combinaciones
                    for profesor_id in profesores_seleccionados:
                        for curso_id in cursos_seleccionados:
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

                mensaje = 'Asignatura creada exitosamente.'
                if asignaciones_creadas > 0:
                    mensaje += f' Se crearon {asignaciones_creadas} asignación(es).'

                flash(mensaje, 'success')
                return redirect(url_for('asignatura.gestionar_asignaturas'))
            else:
                flash('Error al crear la asignatura.', 'error')

        except Exception as e:
            flash(f'Error al crear la asignatura: {str(e)}', 'error')

    # GET - mostrar formulario
    profesores = ProfesorModel.get_all()
    cursos = CursoModel.get_all()
    return render_template('admin/agregar_asignatura.html',
                           profesores=profesores,
                           cursos=cursos)


@asignatura_bp.route('/editar/<int:id_asignatura>', methods=['GET', 'POST'])
def editar_asignatura(id_asignatura):
    """Editar asignatura existente"""
    asignatura = AsignaturaModel.get_by_id(id_asignatura)

    if not asignatura:
        flash('Asignatura no encontrada.', 'error')
        return redirect(url_for('asignatura.gestionar_asignaturas'))

    if request.method == 'POST':
        # Validar formulario
        errores = AsignaturaModel.validate_form(request.form)

        # Verificar duplicados (excluyendo la asignatura actual)
        if AsignaturaModel.check_duplicate_name(request.form.get('nombre', ''), id_asignatura):
            errores.append('Ya existe otra asignatura con ese nombre.')

        if errores:
            for error in errores:
                flash(error, 'error')
            return render_template('admin/editar_asignatura.html', asignatura=asignatura)

        try:
            # Preparar datos
            data = {
                'nombre': request.form['nombre'].strip(),
                'descripcion': request.form.get('descripcion', '').strip()
            }

            # Actualizar asignatura
            result = AsignaturaModel.update(id_asignatura, data)

            if result:
                flash('Asignatura actualizada exitosamente.', 'success')
                return redirect(url_for('asignatura.gestionar_asignaturas'))
            else:
                flash('Error al actualizar la asignatura.', 'error')

        except Exception as e:
            flash(f'Error al actualizar la asignatura: {str(e)}', 'error')

    return render_template('admin/editar_asignatura.html', asignatura=asignatura)


@asignatura_bp.route('/eliminar/<int:id_asignatura>', methods=['POST'])
def eliminar_asignatura(id_asignatura):
    """Eliminar asignatura"""
    try:
        asignatura = AsignaturaModel.get_by_id(id_asignatura)

        if not asignatura:
            flash('Asignatura no encontrada.', 'error')
            return redirect(url_for('asignatura.gestionar_asignaturas'))

        # Intentar eliminar
        result = AsignaturaModel.delete(id_asignatura)

        if result:
            flash(
                f'Asignatura "{asignatura.nombre}" eliminada exitosamente.', 'success')
        else:
            flash('Error al eliminar la asignatura.', 'error')

    except Exception as e:
        flash(f'Error al eliminar la asignatura: {str(e)}', 'error')

    return redirect(url_for('asignatura.gestionar_asignaturas'))


@asignatura_bp.route('/detalle/<int:id_asignatura>')
def detalle_asignatura(id_asignatura):
    """Ver detalle de asignatura con asignaciones"""
    try:
        asignatura = AsignaturaModel.get_by_id(id_asignatura)

        if not asignatura:
            flash('Asignatura no encontrada.', 'error')
            return redirect(url_for('asignatura.gestionar_asignaturas'))

        # Obtener asignaciones de esta asignatura
        asignaciones = AsignacionModel.get_by_asignatura(id_asignatura)

        # Obtener estadísticas
        stats = AsignacionModel.get_stats_by_asignatura(id_asignatura)

        return render_template('admin/detalle_asignatura.html',
                               asignatura=asignatura,
                               asignaciones=asignaciones,
                               stats=stats,
                               total_cursos=stats.get(
                                   'total_cursos', 0) if stats else 0,
                               total_profesores=stats.get(
                                   'total_profesores', 0) if stats else 0,
                               total_asignaciones=stats.get('total_asignaciones', 0) if stats else 0)

    except Exception as e:
        flash(
            f'Error al cargar el detalle de la asignatura: {str(e)}', 'error')
        return redirect(url_for('asignatura.gestionar_asignaturas'))

# API endpoints para obtener datos dinámicamente


@asignatura_bp.route('/api/asignaturas')
def api_asignaturas():
    """API para obtener lista de asignaturas"""
    try:
        asignaturas = AsignaturaModel.get_all()
        return jsonify([{
            'id_asignatura': a.id_asignatura,
            'nombre': a.nombre,
            'descripcion': a.descripcion
        } for a in asignaturas])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# === RUTAS PARA ASIGNACIONES ===


@asignatura_bp.route('/gestionar_asignaciones')
def gestionar_asignaciones():
    """Página principal de gestión de asignaciones"""
    try:
        asignaciones = AsignacionModel.get_all()
        asignaturas = AsignaturaModel.get_all()
        cursos = CursoModel.get_all()
        profesores = ProfesorModel.get_all()

        return render_template('admin/gestionar_asignaciones.html',
                               asignaciones=asignaciones,
                               asignaturas=asignaturas,
                               cursos=cursos,
                               profesores=profesores)
    except Exception as e:
        flash(f'Error al cargar las asignaciones: {str(e)}', 'error')
        return render_template('admin/gestionar_asignaciones.html',
                               asignaciones=[],
                               asignaturas=[],
                               cursos=[],
                               profesores=[])


@asignatura_bp.route('/asignaciones/agregar', methods=['GET', 'POST'])
def agregar_asignacion():
    """Agregar nueva asignación"""
    if request.method == 'POST':
        # Validar formulario
        errores = AsignacionModel.validate_form(request.form)

        # Verificar si ya existe la asignación
        if not errores:
            existe = AsignacionModel.exists_asignacion(
                request.form['id_asignatura_fk'],
                request.form['id_curso_fk']
            )
            if existe:
                errores.append('Ya existe una asignación con esos parámetros.')

        if errores:
            for error in errores:
                flash(error, 'error')
            asignaturas = AsignaturaModel.get_all()
            cursos = CursoModel.get_all()
            profesores = ProfesorModel.get_all()
            return render_template('admin/agregar_asignacion.html',
                                   asignaturas=asignaturas,
                                   cursos=cursos,
                                   profesores=profesores)

        try:
            # Preparar datos
            data = {
                'id_asignatura_fk': request.form['id_asignatura_fk'],
                'id_curso_fk': request.form['id_curso_fk'],
                'id_profesor_fk': request.form['id_profesor_fk'],
                'activo': 1
            }

            # Crear objeto asignación
            asignacion = AsignacionModel(data)

            # Crear asignación
            result = AsignacionModel.create(asignacion)

            if result:
                flash('Asignación creada exitosamente.', 'success')
                return redirect(url_for('asignatura.gestionar_asignaciones'))
            else:
                flash('Error al crear la asignación.', 'error')

        except Exception as e:
            flash(f'Error al crear la asignación: {str(e)}', 'error')

    # GET request
    try:
        asignaturas = AsignaturaModel.get_all()
        cursos = CursoModel.get_all()
        profesores = ProfesorModel.get_all()
        return render_template('admin/agregar_asignacion.html',
                               asignaturas=asignaturas,
                               cursos=cursos,
                               profesores=profesores)
    except Exception as e:
        flash(f'Error al cargar datos: {str(e)}', 'error')
        return redirect(url_for('asignatura.gestionar_asignaciones'))


@asignatura_bp.route('/asignaciones/eliminar/<int:id_asignacion>', methods=['POST'])
def eliminar_asignacion(id_asignacion):
    """Eliminar asignación"""
    try:
        asignacion = AsignacionModel.get_by_id(id_asignacion)

        if not asignacion:
            flash('Asignación no encontrada.', 'error')
            return redirect(url_for('asignatura.gestionar_asignaciones'))

        # Eliminar asignación
        result = AsignacionModel.delete(id_asignacion)

        if result:
            flash('Asignación eliminada exitosamente.', 'success')
        else:
            flash('Error al eliminar la asignación.', 'error')

    except Exception as e:
        flash(f'Error al eliminar la asignación: {str(e)}', 'error')

    return redirect(url_for('asignatura.gestionar_asignaciones'))


@asignatura_bp.route('/asignaciones_por_curso')
def asignaciones_por_curso():
    try:
        # Aceptar tanto 'curso_id' como 'id_curso' para flexibilidad
        curso_id = request.args.get('curso_id') or request.args.get('id_curso')
        curso_seleccionado = None
        asignaciones_por_curso = []
        total_alumnos = 0
        total_asignaturas = 0

        if curso_id:
            curso_seleccionado = CursoModel.get_by_id(curso_id)
            if curso_seleccionado:
                # Obtener asignaciones del curso
                asignaciones = AsignacionModel.get_by_curso(curso_id)
                # Obtener alumnos del curso
                alumnos = AlumnoModel.get_by_curso(curso_id)

                asignaciones_por_curso = [{
                    'curso': curso_seleccionado,
                    'asignaciones': asignaciones,
                    'alumnos': alumnos,
                    'total_alumnos': len(alumnos)
                }]
                total_alumnos = len(alumnos)
                total_asignaturas = len(asignaciones)
        else:
            # Mostrar todos los cursos con sus asignaciones
            cursos = CursoModel.get_all()
            for curso in cursos:
                asignaciones = AsignacionModel.get_by_curso(curso.id_curso)
                alumnos = AlumnoModel.get_by_curso(curso.id_curso)
                asignaciones_por_curso.append({
                    'curso': curso,
                    'asignaciones': asignaciones,
                    'alumnos': alumnos,
                    'total_alumnos': len(alumnos)
                })

        cursos = CursoModel.get_all()
        return render_template('admin/asignaciones_por_curso.html',
                               asignaciones_por_curso=asignaciones_por_curso,
                               cursos=cursos,
                               curso_seleccionado=curso_seleccionado,
                               total_alumnos=total_alumnos,
                               total_asignaturas=total_asignaturas)
    except Exception as e:
        print(f"Error en asignaciones_por_curso: {e}")
        flash('Error al cargar las asignaciones por curso', 'error')
        return redirect('/asignaturas')


@asignatura_bp.route('/verificar_asignacion')
def verificar_asignacion():
    try:
        asignatura_id = request.args.get('asignatura_id')
        curso_id = request.args.get('curso_id')

        existe = AsignacionModel.exists_asignacion(asignatura_id, curso_id)
        return jsonify({'existe': existe})
    except Exception as e:
        return jsonify({'error': str(e)})


@asignatura_bp.route('/eliminar_asignacion_ajax/<int:id>', methods=['DELETE'])
def eliminar_asignacion_ajax(id):
    try:
        success = AsignacionModel.delete(id)
        if success:
            return jsonify({'success': True, 'message': 'Asignación eliminada correctamente'})
        else:
            return jsonify({'success': False, 'message': 'Error al eliminar la asignación'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})


@asignatura_bp.route('/asignatura/<int:id_asignatura>/curso/<int:id_curso>/alumnos')
def ver_alumnos_curso_asignatura(id_asignatura, id_curso):
    """Ver alumnos de un curso específico para una asignatura"""
    try:
        # Verificar que la asignación existe
        asignacion_info = AsignacionModel.get_asignatura_curso_info(
            id_asignatura, id_curso)
        if not asignacion_info:
            flash('No se encontró la asignación entre la asignatura y el curso.', 'error')
            return redirect(url_for('asignatura.gestionar_asignaturas'))

        # Obtener alumnos del curso para esta asignatura
        alumnos = AsignacionModel.get_alumnos_by_curso_asignatura(
            id_curso, id_asignatura)

        # Obtener información adicional
        asignatura = AsignaturaModel.get_by_id(id_asignatura)
        curso = CursoModel.get_by_id(id_curso)

        return render_template('admin/alumnos_curso_asignatura.html',
                               asignacion_info=asignacion_info,
                               alumnos=alumnos,
                               asignatura=asignatura,
                               curso=curso)

    except Exception as e:
        flash(f'Error al cargar los alumnos: {str(e)}', 'error')
        return redirect(url_for('asignatura.gestionar_asignaturas'))


@asignatura_bp.route('/asignaciones/detalle/<int:id_asignacion>')
def detalle_asignacion(id_asignacion):
    """Ver detalle de una asignación específica"""
    try:
        # Obtener la asignación específica
        asignacion = AsignacionModel.get_by_id(id_asignacion)

        if not asignacion:
            flash('Asignación no encontrada.', 'error')
            return redirect(url_for('asignatura.gestionar_asignaciones'))

        # Obtener información adicional
        asignatura = AsignaturaModel.get_by_id(asignacion.id_asignatura)
        curso = CursoModel.get_by_id(asignacion.id_curso)
        profesor = ProfesorModel.get_by_id(asignacion.id_profesor)

        # Obtener alumnos del curso para esta asignatura
        alumnos = AsignacionModel.get_alumnos_by_curso_asignatura(
            asignacion.id_curso, asignacion.id_asignatura)

        return render_template('admin/detalle_asignacion.html',
                               asignacion=asignacion,
                               asignatura=asignatura,
                               curso=curso,
                               profesor=profesor,
                               alumnos=alumnos)

    except Exception as e:
        flash(
            f'Error al cargar el detalle de la asignación: {str(e)}', 'error')
        return redirect(url_for('asignatura.gestionar_asignaciones'))
