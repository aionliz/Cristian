#!/usr/bin/env python3

from base.config.mysqlconnection import connectToMySQL
import sys
import os

# Agregar el directorio del proyecto al path
sys.path.append('/Users/lizamolinavenegas/Desktop/Cristian')

# Importar la configuración de base de datos


def check_table_structure():
    """Revisar la estructura de las tablas principales"""

    print("🔍 Revisando estructura de tablas...")

    try:
        db = connectToMySQL("colegio_AML")

        # Revisar estructura de la tabla alumnos
        print("\n👥 Estructura de la tabla 'alumnos':")
        result = db.query_db("DESCRIBE alumnos")
        if result:
            for column in result:
                print(
                    f"  - {column['Field']}: {column['Type']} ({column['Null']}, {column['Key']})")

        # Revisar algunos datos de muestra
        print("\n📋 Muestra de datos de alumnos:")
        result = db.query_db("SELECT * FROM alumnos LIMIT 3")
        if result:
            for alumno in result:
                print(
                    f"  - ID: {alumno['id_alumno']}, Nombre: {alumno['nombre']} {alumno['apellido_paterno']}")

        # Revisar estructura de la tabla asistencias
        print("\n📊 Estructura de la tabla 'asistencias':")
        result = db.query_db("DESCRIBE asistencias")
        if result:
            for column in result:
                print(
                    f"  - {column['Field']}: {column['Type']} ({column['Null']}, {column['Key']})")

        # Revisar estructura de la tabla cursos
        print("\n🏫 Estructura de la tabla 'cursos':")
        result = db.query_db("DESCRIBE cursos")
        if result:
            for column in result:
                print(
                    f"  - {column['Field']}: {column['Type']} ({column['Null']}, {column['Key']})")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    check_table_structure()
