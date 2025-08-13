from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from base.models.profesor_model import ProfesorModel
from base.models.asignatura_model import AsignaturaModel
from base.models.curso_model import CursoModel
from base.models.asignacion_model import AsignacionModel

# Crear el blueprint para profesores
profesor_bp = Blueprint('profesor', __name__)


@profesor_bp.route('/test-dropdowns')
def test_dropdowns():
    """Página de prueba para depurar dropdowns"""
    from base.models.asignatura_model import AsignaturaModel
    from base.models.curso_model import CursoModel

    asignaturas = AsignaturaModel.get_all()
    cursos = CursoModel.get_all()

    print("=== TEST DROPDOWNS ROUTE ===")
    print(f"Asignaturas: {len(asignaturas)}")
    for asig in asignaturas:
        print(f"  - {asig.id_asignatura}: {asig.nombre}")

    print(f"Cursos: {len(cursos)}")
    for curso in cursos:
        print(
            f"  - {curso.id_curso}: '{curso.nombre}' -> '{curso.nombre_completo}'")

    return render_template('test_dropdowns.html',
                           asignaturas=asignaturas,
                           cursos=cursos)


@profesor_bp.route('/gestionar')
def gestionar_profesores():
    """Página principal de gestión de profesores"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))

    try:
        print("🎓 DEBUG - Iniciando gestionar_profesores")

        # Obtener profesores con detalles
        profesores = ProfesorModel.get_all_with_details()
        print(
            f"🎓 DEBUG - Profesores obtenidos: {len(profesores) if profesores else 0}")

        if profesores:
            for i, prof in enumerate(profesores):
                print(f"  Profesor {i+1}: {prof}")

        # Calcular estadísticas simples
        total_profesores = len(profesores) if profesores else 0
        total_activos = total_profesores  # Ya que get_all_with_details solo trae activos
        total_con_asignaciones = 0

        if profesores:
            total_con_asignaciones = sum(
                1 for prof in profesores if prof.get('total_asignaciones', 0) > 0)

        total_sin_asignaciones = total_profesores - total_con_asignaciones

        print(
            f"🎓 DEBUG - Estadísticas: Total={total_profesores}, Activos={total_activos}, Con asignaciones={total_con_asignaciones}")

        return render_template('admin/gestionar_profesores.html',
                               profesores=profesores,
                               total_profesores=total_profesores,
                               total_activos=total_activos,
                               total_con_asignaciones=total_con_asignaciones,
                               total_sin_asignaciones=total_sin_asignaciones)

    except Exception as e:
        print(f"❌ ERROR en gestionar_profesores: {str(e)}")
        flash(f'Error al cargar los profesores: {str(e)}', 'error')
        return render_template('admin/gestionar_profesores.html',
                               profesores=[],
                               total_profesores=0,
                               total_activos=0,
                               total_con_asignaciones=0,
                               total_sin_asignaciones=0)


@profesor_bp.route('/profesores/agregar', methods=['GET', 'POST'])
def agregar_profesor():
    """Agregar nuevo profesor"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))

    if request.method == 'POST':
        # Validar formulario
        errores = ProfesorModel.validate_form(request.form)
        if errores:
            for error in errores:
                flash(error, 'error')
        else:
            try:
                # Crear profesor
                data = {
                    'nombre': request.form['nombre'].strip(),
                    'apellido': request.form['apellido'].strip(),
                    'email': request.form['email'].strip(),
                    'especialidad': request.form.get('especialidad', '').strip(),
                    'id_asignatura_fk': request.form.get('id_asignatura_fk') or None,
                    'activo': 1
                }

                profesor = ProfesorModel(data)
                result = ProfesorModel.create(profesor)

                if result:
                    # Obtener el ID del profesor recién creado
                    profesor_id = result

                    flash(
                        'Profesor agregado exitosamente. Ahora puedes asignarle asignaturas y cursos desde la gestión de asignaciones.', 'success')
                    return redirect(url_for('profesor.gestionar_profesores'))
                else:
                    flash('Error al agregar el profesor.', 'error')
            except Exception as e:
                flash(f'Error al crear el profesor: {str(e)}', 'error')

    # GET request - mostrar formulario
    try:
        print("🎓 DEBUG - Cargando formulario agregar profesor")
        # Solo para el dropdown de especialidad
        asignaturas = AsignaturaModel.get_all()

        return render_template('admin/agregar_profesor.html',
                               asignaturas=asignaturas)
    except Exception as e:
        print(f"❌ ERROR al cargar datos: {str(e)}")
        flash(f'Error al cargar datos: {str(e)}', 'error')
        return redirect(url_for('profesor.gestionar_profesores'))


@profesor_bp.route('/profesores/editar/<int:id_profesor>', methods=['GET', 'POST'])
def editar_profesor(id_profesor):
    """Editar profesor existente"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))

    try:
        profesor = ProfesorModel.get_by_id(id_profesor)
        if not profesor:
            flash('Profesor no encontrado.', 'error')
            return redirect(url_for('profesor.gestionar_profesores'))

        if request.method == 'POST':
            # Validar formulario
            errores = ProfesorModel.validate_form(request.form)
            if errores:
                for error in errores:
                    flash(error, 'error')
            else:
                try:
                    # Actualizar profesor
                    data = {
                        'nombre': request.form['nombre'].strip(),
                        'apellido': request.form['apellido'].strip(),
                        'email': request.form['email'].strip(),
                        'especialidad': request.form.get('especialidad', '').strip(),
                        'id_asignatura_fk': request.form.get('id_asignatura_fk') or None,
                        'activo': int(request.form.get('activo', 1))
                    }

                    result = ProfesorModel.update(id_profesor, data)

                    if result is not False:
                        # Procesar nuevas asignaciones si se seleccionaron
                        asignaturas_nuevas = request.form.getlist(
                            'asignaturas_agregar[]')
                        cursos_nuevos = request.form.getlist(
                            'cursos_agregar[]')

                        asignaciones_creadas = 0

                        if asignaturas_nuevas and cursos_nuevos:
                            # Crear asignaciones para todas las combinaciones
                            for asignatura_id in asignaturas_nuevas:
                                for curso_id in cursos_nuevos:
                                    try:
                                        # Verificar si la asignación ya existe
                                        existing = AsignacionModel.get_by_profesor_asignatura_curso(
                                            id_profesor, asignatura_id, curso_id
                                        )

                                        if not existing:
                                            asignacion_data = {
                                                'id_profesor': id_profesor,
                                                'id_asignatura': asignatura_id,
                                                'id_curso': curso_id,
                                                'activo': 1
                                            }
                                            asignacion = AsignacionModel(
                                                asignacion_data)
                                            if AsignacionModel.create(asignacion):
                                                asignaciones_creadas += 1
                                    except Exception as e:
                                        print(
                                            f"Error al crear asignación: {e}")

                        mensaje = 'Profesor actualizado exitosamente.'
                        if asignaciones_creadas > 0:
                            mensaje += f' Se agregaron {asignaciones_creadas} nueva(s) asignación(es).'

                        flash(mensaje, 'success')
                        return redirect(url_for('profesor.gestionar_profesores'))
                    else:
                        flash('Error al actualizar el profesor.', 'error')
                except Exception as e:
                    flash(
                        f'Error al actualizar el profesor: {str(e)}', 'error')

        # GET request - mostrar formulario
        asignaturas = AsignaturaModel.get_all()
        cursos = CursoModel.get_all()

        # DEBUG: Imprimir información sobre los cursos
        print(f"🎓 DEBUG - Cursos para editar profesor:")
        for curso in cursos:
            print(
                f"   - ID: {curso.id_curso}, Nombre: {curso.nombre}, Nombre completo: {curso.nombre_completo}")

        return render_template('admin/editar_profesor.html',
                               profesor=profesor,
                               asignaturas=asignaturas,
                               cursos=cursos,
                               errors={})

    except Exception as e:
        flash(f'Error al cargar el profesor: {str(e)}', 'error')
        return redirect(url_for('profesor.gestionar_profesores'))


@profesor_bp.route('/profesores/detalle/<int:id_profesor>')
def detalle_profesor(id_profesor):
    """Ver detalle de profesor con sus asignaciones"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    try:
        profesor = ProfesorModel.get_by_id(id_profesor)
        if not profesor:
            flash('Profesor no encontrado.', 'error')
            return redirect(url_for('profesor.gestionar_profesores'))

        # Obtener asignaciones del profesor
        asignaciones = ProfesorModel.get_asignaciones(id_profesor)

        # Obtener estadísticas
        stats = ProfesorModel.get_stats_by_profesor(id_profesor)

        return render_template('admin/detalle_profesor.html',
                               profesor=profesor,
                               asignaciones=asignaciones,
                               stats=stats)
    except Exception as e:
        flash(f'Error al cargar el detalle del profesor: {str(e)}', 'error')
        return redirect(url_for('profesor.gestionar_profesores'))


@profesor_bp.route('/profesores/eliminar/<int:id_profesor>', methods=['POST'])
def eliminar_profesor(id_profesor):
    """Eliminar profesor (desactivar)"""
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))

    if session.get('user_role') != 'admin':
        flash('No tiene permisos para realizar esta acción.', 'error')
        return redirect(url_for('profesor.gestionar_profesores'))

    try:
        profesor = ProfesorModel.get_by_id(id_profesor)
        if not profesor:
            flash('Profesor no encontrado.', 'error')
            return redirect(url_for('profesor.gestionar_profesores'))

        # Verificar si tiene asignaciones activas
        asignaciones = ProfesorModel.get_asignaciones(id_profesor)
        if asignaciones:
            flash(
                'No se puede eliminar el profesor porque tiene asignaciones activas.', 'error')
        else:
            result = ProfesorModel.delete(id_profesor)
            if result:
                flash('Profesor eliminado exitosamente.', 'success')
            else:
                flash('Error al eliminar el profesor.', 'error')
    except Exception as e:
        flash(f'Error al eliminar el profesor: {str(e)}', 'error')

    return redirect(url_for('profesor.gestionar_profesores'))


# === API ENDPOINTS ===

@profesor_bp.route('/api/profesores')
def api_profesores():
    """API para obtener lista de profesores"""
    try:
        profesores = ProfesorModel.get_all()
        profesores_list = []
        for profesor in profesores:
            profesores_list.append({
                'id_profesor': profesor.id_profesor,
                'nombre': profesor.nombre,
                'apellido': profesor.apellido,
                'nombre_completo': profesor.nombre_completo,
                'email': profesor.email,
                'especialidad': profesor.especialidad,
                'activo': profesor.activo
            })
        return jsonify(profesores_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@profesor_bp.route('/api/profesores/<int:id_profesor>')
def api_profesor_detalle(id_profesor):
    """API para obtener detalles de un profesor"""
    try:
        profesor = ProfesorModel.get_by_id(id_profesor)
        if not profesor:
            return jsonify({'error': 'Profesor no encontrado'}), 404

        return jsonify({
            'id_profesor': profesor.id_profesor,
            'nombre': profesor.nombre,
            'apellido': profesor.apellido,
            'nombre_completo': profesor.nombre_completo,
            'email': profesor.email,
            'especialidad': profesor.especialidad,
            'id_asignatura_fk': profesor.id_asignatura_fk,
            'activo': profesor.activo
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@profesor_bp.route('/profesores/toggle_activo/<int:id_profesor>', methods=['POST'])
def toggle_activo_profesor(id_profesor):
    """Cambiar estado activo/inactivo del profesor"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    if session.get('user_role') != 'admin':
        return jsonify({'success': False, 'message': 'Sin permisos'}), 403

    try:
        profesor = ProfesorModel.get_by_id(id_profesor)
        if not profesor:
            return jsonify({'success': False, 'message': 'Profesor no encontrado'})

        nuevo_estado = 0 if profesor.activo else 1
        result = ProfesorModel.update(id_profesor, {'activo': nuevo_estado})

        if result:
            estado_texto = 'activado' if nuevo_estado else 'desactivado'
            return jsonify({
                'success': True,
                'message': f'Profesor {estado_texto} exitosamente',
                'nuevo_estado': nuevo_estado
            })
        else:
            return jsonify({'success': False, 'message': 'Error al cambiar estado'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
