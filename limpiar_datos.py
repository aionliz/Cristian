#!/usr/bin/env python3

from base.config.mysqlconnection import connectToMySQL
import sys
import os

# Agregar el directorio del proyecto al path
sys.path.append('/Users/lizamolinavenegas/Desktop/Cristian')

# Importar la configuración de base de datos


def limpiar_datos_ejemplo():
    """Limpiar datos de ejemplo del reporte"""

    print("🧹 Limpiando datos de ejemplo...")

    try:
        db = connectToMySQL("colegio_AML")

        # Verificar datos actuales
        print("\n📊 Estado actual de las tablas:")

        # Contar asistencias
        result = db.query_db("SELECT COUNT(*) as count FROM asistencias")
        asistencias_count = result[0]['count'] if result else 0
        print(f"  - Asistencias: {asistencias_count} registros")

        # Contar alumnos
        result = db.query_db(
            "SELECT COUNT(*) as count FROM alumnos WHERE activo = 1")
        alumnos_count = result[0]['count'] if result else 0
        print(f"  - Alumnos activos: {alumnos_count} registros")

        # Contar cursos
        result = db.query_db("SELECT COUNT(*) as count FROM cursos")
        cursos_count = result[0]['count'] if result else 0
        print(f"  - Cursos: {cursos_count} registros")

        # Preguntar si el usuario quiere limpiar los datos de asistencia de ejemplo
        print(
            f"\n❓ ¿Desea eliminar los {asistencias_count} registros de asistencia de ejemplo?")
        print("   Esto limpiará todos los reportes pero mantendrá los alumnos y cursos.")

        respuesta = input("   Escriba 'SI' para confirmar: ")

        if respuesta.upper() == 'SI':
            # Eliminar registros de asistencia
            result = db.query_db("DELETE FROM asistencias")
            print("✅ Registros de asistencia eliminados")

            # Verificar limpieza
            result = db.query_db("SELECT COUNT(*) as count FROM asistencias")
            new_count = result[0]['count'] if result else 0
            print(f"📊 Asistencias restantes: {new_count}")

            print(
                "\n🎉 ¡Datos de ejemplo limpiados! Los reportes ahora mostrarán datos reales únicamente.")
        else:
            print("❌ Operación cancelada. Los datos se mantienen.")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    limpiar_datos_ejemplo()
