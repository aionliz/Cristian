# controllers/admin_controller.py

from flask import render_template, request, redirect, url_for, flash, session, jsonify
from base.models.alumno_model import AlumnoModel
from base.models.user_model import UserModel
from datetime import datetime, date
import json

def gestionar_alumnos():
    """
    Página para gestionar alumnos (CRUD).
    Solo accesible para administradores.
    """
    if 'user_id' not in session:
        flash('Debe iniciar sesión para acceder a esta página.', 'error')
        return redirect(url_for('auth.login'))
    
    if session.get('user_role') != 'admin':
        flash('No tiene permisos para acceder a esta página.', 'error')
        return redirect(url_for('asistencia.index'))
    
    # Obtener todos los alumnos
    alumnos = AlumnoModel.get_all()
    
    return render_template('admin/gestionar_alumnos.html', alumnos=alumnos)

def crear_alumno():
    """
    Crear un nuevo alumno.
    """
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return jsonify({'success': False, 'message': 'No autorizado'}), 403
    
    if request.method == 'POST':
        data = {
            'rut': request.form.get('rut'),
            'nombre': request.form.get('nombre'),
            'apellido': request.form.get('apellido'),
            'email': request.form.get('email'),
            'telefono': request.form.get('telefono'),
            'fecha_nacimiento': request.form.get('fecha_nacimiento'),
            'direccion': request.form.get('direccion'),
            'id_curso': request.form.get('id_curso'),
            'fecha_ingreso': request.form.get('fecha_ingreso') or date.today().strftime('%Y-%m-%d')
        }
        
        # Validaciones básicas
        if not all([data['rut'], data['nombre'], data['apellido'], data['id_curso']]):
            return jsonify({'success': False, 'message': 'Campos obligatorios faltantes'})
        
        try:
            # Crear el alumno
            resultado = AlumnoModel.create(data)
            if resultado:
                return jsonify({'success': True, 'message': 'Alumno creado exitosamente'})
            else:
                return jsonify({'success': False, 'message': 'Error al crear el alumno'})
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    
    return jsonify({'success': False, 'message': 'Método no permitido'})

def editar_alumno(id_alumno):
    """
    Editar un alumno existente.
    """
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return jsonify({'success': False, 'message': 'No autorizado'}), 403
    
    if request.method == 'POST':
        data = {
            'id_alumno': id_alumno,
            'rut': request.form.get('rut'),
            'nombre': request.form.get('nombre'),
            'apellido': request.form.get('apellido'),
            'email': request.form.get('email'),
            'telefono': request.form.get('telefono'),
            'fecha_nacimiento': request.form.get('fecha_nacimiento'),
            'direccion': request.form.get('direccion'),
            'id_curso': request.form.get('id_curso')
        }
        
        try:
            # Actualizar el alumno
            resultado = AlumnoModel.update(data)
            if resultado:
                return jsonify({'success': True, 'message': 'Alumno actualizado exitosamente'})
            else:
                return jsonify({'success': False, 'message': 'Error al actualizar el alumno'})
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    
    # GET - Obtener datos del alumno
    alumno = AlumnoModel.get_by_id({'id_alumno': id_alumno})
    if alumno:
        return jsonify({
            'success': True,
            'alumno': {
                'id_alumno': alumno.id_alumno,
                'rut': alumno.rut,
                'nombre': alumno.nombre,
                'apellido': alumno.apellido,
                'email': alumno.email,
                'telefono': alumno.telefono,
                'fecha_nacimiento': alumno.fecha_nacimiento.strftime('%Y-%m-%d') if alumno.fecha_nacimiento else '',
                'direccion': alumno.direccion,
                'id_curso': alumno.id_curso,
                'fecha_ingreso': alumno.fecha_ingreso.strftime('%Y-%m-%d') if alumno.fecha_ingreso else ''
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Alumno no encontrado'})

def eliminar_alumno(id_alumno):
    """
    Eliminar un alumno.
    """
    if 'user_id' not in session or session.get('user_role') != 'admin':
        return jsonify({'success': False, 'message': 'No autorizado'}), 403
    
    try:
        # Eliminar el alumno
        resultado = AlumnoModel.delete({'id_alumno': id_alumno})
        if resultado:
            return jsonify({'success': True, 'message': 'Alumno eliminado exitosamente'})
        else:
            return jsonify({'success': False, 'message': 'Error al eliminar el alumno'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

def buscar_alumnos():
    """
    Buscar alumnos por nombre, apellido o RUT.
    """
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 403
    
    query = request.args.get('q', '').strip()
    if len(query) < 2:
        return jsonify([])
    
    try:
        # Buscar alumnos
        alumnos = AlumnoModel.search(query)
        results = []
        
        for alumno in alumnos:
            results.append({
                'id': alumno.id_alumno,
                'rut': alumno.rut,
                'nombre': alumno.nombre,
                'apellido': alumno.apellido,
                'nombre_completo': f"{alumno.nombre} {alumno.apellido}",
                'curso': alumno.curso_nombre if hasattr(alumno, 'curso_nombre') else 'Sin curso'
            })
        
        return jsonify(results)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
