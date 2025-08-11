#!/usr/bin/env python3

from base.config.mysqlconnection import connectToMySQL
import sys
import os

# Agregar el directorio del proyecto al path
sys.path.append('/Users/lizamolinavenegas/Desktop/Cristian')

# Importar la configuración de base de datos


def check_columns():
    """Revisar las columnas disponibles"""

    print("🔍 Revisando columnas disponibles...")

    try:
        db = connectToMySQL("colegio_AML")

        # Usar SHOW COLUMNS
        print("\n👥 Columnas de la tabla 'alumnos':")
        result = db.query_db("SHOW COLUMNS FROM alumnos")
        if result:
            for column in result:
                print(f"  - {column}")

        # Probar consulta simple de alumnos
        print("\n📋 Datos de muestra de alumnos:")
        result = db.query_db("SELECT * FROM alumnos LIMIT 2")
        if result:
            # Mostrar las claves del primer registro para ver las columnas
            print(f"  Columnas disponibles: {list(result[0].keys())}")
            for alumno in result:
                print(f"  - {alumno}")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    check_columns()
