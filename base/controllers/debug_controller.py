from flask import Blueprint, render_template, jsonify
from base.models.asignatura_model import AsignaturaModel
from base.models.curso_model import CursoModel

debug_bp = Blueprint('debug', __name__)


@debug_bp.route('/debug/dropdowns')
def debug_dropdowns():
    """Página de debug para probar los dropdowns sin autenticación"""
    try:
        asignaturas = AsignaturaModel.get_all()
        cursos = CursoModel.get_all()

        print("=== DEBUG DROPDOWNS ===")
        print(f"Asignaturas encontradas: {len(asignaturas)}")
        for asig in asignaturas:
            print(f"  - ID: {asig.id_asignatura}, Nombre: {asig.nombre}")

        print(f"Cursos encontrados: {len(cursos)}")
        for curso in cursos:
            print(
                f"  - ID: {curso.id_curso}, Nombre: {curso.nombre}, Nombre completo: {curso.nombre_completo}")

        return render_template('debug/dropdowns.html',
                               asignaturas=asignaturas,
                               cursos=cursos)
    except Exception as e:
        print(f"Error en debug_dropdowns: {e}")
        return jsonify({'error': str(e)}), 500
