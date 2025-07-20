# 🏫 Sistema de Asistencia - Colegio AML

Sistema integral de control de asistencia con tecnología biométrica (huellas dactilares) desarrollado en Flask y MySQL.

## 🚀 Características Principales

- **🔐 Autenticación biométrica** con lector DigitalPersona U.are.U 4500
- **👥 Gestión de usuarios** (administradores, profesores, alumnos)
- **📊 Registro de asistencia** en tiempo real
- **🔧 Control de hardware** con comandos LED para lector biométrico
- **📱 Interfaz responsive** con modo oscuro
- **🌐 Dashboard administrativo** para seguimiento de asistencia

## 🛠️ Tecnologías Utilizadas

### Backend
- **Flask 3.1.1** - Framework web principal
- **PyMySQL 1.1.1** - Conector de base de datos MySQL
- **Flask-Bcrypt 1.0.1** - Encriptación de contraseñas

### Hardware Biométrico
- **OpenCV 4.10.0** - Procesamiento de imágenes de huellas
- **PySerial 3.5** - Comunicación serie con DigitalPersona
- **PyUSB 1.3.1** - Comunicación USB directa
- **NumPy 2.1.3** - Procesamiento matemático de patrones biométricos
- **Pillow 11.0.0** - Manipulación de imágenes

### Frontend
- **Bootstrap 5.3.0** - Framework CSS con tema personalizado
- **Font Awesome 6.0.0** - Iconografía
- **jQuery 3.6.0** - Interacciones JavaScript

### Base de Datos
- **MySQL 8.0+** - Sistema de gestión de base de datos

## 📋 Requisitos del Sistema

### Requisitos Mínimos
- **Python 3.8+**
- **MySQL 8.0+**
- **macOS 12.0+** (para DigitalPersona U.are.U 4500)
- **4 GB RAM**
- **2 GB espacio en disco**

### Hardware Biométrico Soportado
- **DigitalPersona U.are.U 4500** - Lector óptico de huellas dactilares
- **Conexión USB** para comunicación con el dispositivo
- **Puerto serie**: `/dev/cu.QR380A-241-4F6D` (macOS)

## 🔧 Instalación

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd Colegio-AML
```

### 2. Configuración Automática
```bash
# Ejecutar script de configuración inicial
./setup.sh
```

### 3. Configuración Manual (Alternativa)
```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 4. Configurar Base de Datos
```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE colegio_aml;"

# Importar estructura y datos
mysql -u root -p colegio_aml < database_setup_sip.sql
```

### 5. Ejecutar Aplicación
```bash
# Activar entorno virtual
source activate.sh

# Ejecutar servidor
python app.py
```

## 🌐 Acceso al Sistema

### URLs Principales
- **Aplicación principal**: http://127.0.0.1:5001
- **Login**: http://127.0.0.1:5001/auth/login
- **Sistema de huellas**: http://127.0.0.1:5001/huellas
- **Terminal biométrico**: http://127.0.0.1:5001/huellas/terminal

### Usuarios de Prueba
| Rol | Email | Contraseña | Permisos |
|-----|-------|------------|----------|
| Administrador | admin@colegio.cl | admin123 | Completos |
| Profesor | profesor@colegio.cl | profesor123 | Gestión alumnos |

## 📁 Estructura del Proyecto

```
Colegio-AML/
├── app.py                      # Aplicación principal Flask
├── requirements.txt            # Dependencias Python
├── setup.sh                   # Script de configuración
├── activate.sh                # Script de activación
├── database_setup_sip.sql     # Estructura de base de datos
├── test_hardware.py           # Pruebas de hardware biométrico
├── base/                      # Módulos principales
│   ├── config/               # Configuración
│   │   ├── mysqlconnection.py
│   │   └── hardware_config.py
│   ├── models/               # Modelos de datos
│   │   ├── user_model.py
│   │   ├── alumno_model.py
│   │   └── huella_model.py
│   ├── controllers/          # Controladores
│   │   ├── auth_controller.py
│   │   ├── student_controller.py
│   │   └── huella_controller.py
│   ├── hardware/             # Integración hardware
│   │   └── fingerprint_reader.py
│   ├── static/               # Archivos estáticos
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   └── main.js
│   │   └── img/
│   └── templates/            # Plantillas HTML
│       ├── base.html
│       ├── auth/
│       ├── huellas/
│       └── includes/
└── venv/                     # Entorno virtual (generado)
```

## 🔧 Configuración de Hardware

### Lectores ZKTeco
1. **Conectar** el dispositivo por USB
2. **Instalar drivers** del fabricante
3. **Verificar conexión**: `python test_hardware.py`
4. **Seleccionar** opción 1 (ZKTeco) en el sistema

### Cámaras OpenCV
1. **Conectar** cámara web USB
2. **Permitir acceso** a la cámara en configuración del sistema
3. **Probar conexión**: `python test_hardware.py`
4. **Seleccionar** opción 2 (OpenCV) en el sistema

## 📊 Funcionalidades del Sistema

### 👤 Gestión de Usuarios
- Registro y autenticación
- Roles diferenciados (admin, profesor, alumno, apoderado)
- Perfiles personalizados

### 🔒 Sistema Biométrico
- Registro de huellas dactilares
- Verificación biométrica
- Control de calidad automático
- Soporte multi-dedo

### 📈 Estadísticas y Reportes
- Cobertura biométrica en tiempo real
- Estadísticas de calidad de huellas
- Reportes de asistencia
- Dashboards interactivos

### 🎯 Terminal Biométrico
- Interfaz tipo terminal para administradores
- Registro masivo de huellas
- Monitoreo en tiempo real
- Logs detallados

## 🧪 Pruebas

### Probar Hardware Biométrico
```bash
# Activar entorno virtual
source venv/bin/activate

# Ejecutar pruebas de hardware
python test_hardware.py
```

### Probar Base de Datos
```bash
# Verificar conexión a MySQL
mysql -u root -p colegio_aml -e "SHOW TABLES;"
```

## 🔧 Solución de Problemas

### Error: Puerto en uso
```bash
# Cambiar puerto en app.py línea final
app.run(debug=True, host='0.0.0.0', port=5002)
```

### Error: Lector biométrico no detectado
- Verificar conexión USB
- Instalar drivers del fabricante
- Revisar permisos de dispositivo
- Probar con `python test_hardware.py`

### Error: Permisos de cámara en macOS
- Ir a Configuración → Seguridad → Cámara
- Permitir acceso a la aplicación Terminal/Python

## 📞 Soporte

### Contacto
- **Desarrollador**: Sistema Colegio AML
- **Email**: soporte@colegioaml.cl
- **Documentación**: Ver archivos en `/docs/`

### Reportar Problemas
1. Describir el problema detalladamente
2. Incluir logs de error
3. Especificar hardware utilizado
4. Mencionar versión del sistema operativo

## 📄 Licencia

Este proyecto está desarrollado específicamente para el Colegio AML.

## 🔄 Actualizaciones

### Versión Actual: v1.0.0
- ✅ Sistema biométrico completo
- ✅ Integración hardware real
- ✅ Interface web responsive
- ✅ Base de datos optimizada

### Próximas Funcionalidades
- 🔄 API REST para integración externa
- 🔄 Aplicación móvil nativa
- 🔄 Reportes PDF automáticos
- 🔄 Sincronización en la nube

---

**© 2025 Colegio AML - Sistema de Asistencia Biométrica**
