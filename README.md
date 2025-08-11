# 🎓 Sistema de Asistencia Biométrica - Colegio AML

Sistema de control de asistencia con tecnología biométrica (huellas dactilares) desarrollado para el Colegio AML, específicamente para el curso 4° Medio B.

## 🚀 Características Principales

- **✋ Sistema Biométrico**: Registro de asistencia con huellas dactilares usando DigitalPersona U.are.U 4500
- **👨‍🏫 Gestión de Profesores**: Administración completa de profesores y asignaciones
- **👨‍🎓 Gestión de Alumnos**: Control de estudiantes del 4° Medio B
- **📊 Reportes de Asistencia**: Visualización y exportación de datos de asistencia
- **🔐 Sistema de Usuarios**: Admin, profesores y apoderados con roles específicos
- **📱 Interfaz Responsiva**: Diseño adaptable a dispositivos móviles

## 🛠️ Tecnologías Utilizadas

- **Backend**: Python 3.12 + Flask
- **Base de Datos**: MySQL 8.0
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
- **Hardware**: DigitalPersona U.are.U 4500 (sensor de huellas dactilares)
- **Autenticación**: Flask-Session con encriptación scrypt

## 📁 Estructura del Proyecto

```
Cristian/
├── app.py                    # Aplicación principal Flask
├── database_unified.sql      # Script unificado de base de datos
├── requirements.txt          # Dependencias Python
├── .gitignore               # Archivos ignorados por Git
├── env-todo/                # Entorno virtual Python
└── base/                    # Módulos de la aplicación
    ├── config/              # Configuración de DB y hardware
    ├── controllers/         # Controladores MVC
    ├── models/              # Modelos de datos
    ├── static/              # Archivos estáticos (CSS, JS, img)
    └── templates/           # Plantillas HTML (Jinja2)
```

## ⚙️ Instalación y Configuración

### 1. Prerrequisitos
- Python 3.12+
- MySQL 8.0+
- DigitalPersona U.are.U 4500 (opcional para pruebas)

### 2. Clonar el Repositorio
```bash
git clone https://github.com/aionliz/Cristian.git
cd Cristian
```

### 3. Configurar Entorno Virtual
```bash
# Activar entorno virtual incluido
source env-todo/bin/activate  # Linux/macOS
# o
env-todo\Scripts\activate     # Windows
```

### 4. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 5. Configurar Base de Datos
```bash
# Crear base de datos MySQL
mysql -u root -p < database_unified.sql
```

### 6. Ejecutar la Aplicación
```bash
python app.py
```

La aplicación estará disponible en: `http://localhost:5003`

## 👥 Usuarios por Defecto

### 🔑 Administrador
- **Email**: `admin@colegio-aml.cl`
- **Contraseña**: `password123`
- **Funciones**: Gestión completa del sistema

### 👨‍🏫 Profesores
- **Juan Pérez**: `juan.perez@colegio-aml.cl` / `password123`
- **María González**: `maria.gonzalez@colegio-aml.cl` / `password123`
- **Liza Molina**: `liza.molina@colegio-aml.cl` / `password123`
- **Carlos Rodríguez**: `carlos.rodriguez@colegio-aml.cl` / `password123`

### 👨‍👩‍👧‍👦 Apoderados
- Formato: `apoderado.[apellido]@colegio-aml.cl` / `password123`

## 📊 Funcionalidades por Rol

### 🔧 Administrador
- ✅ Gestión de usuarios y permisos
- ✅ Configuración del hardware biométrico
- ✅ Reportes y estadísticas completas
- ✅ Gestión de cursos y asignaciones

### 👨‍🏫 Profesores
- ✅ Toma de asistencia con huella dactilar
- ✅ Visualización de asistencia por asignatura
- ✅ Generación de reportes de su curso
- ✅ Gestión de justificaciones

### 👨‍👩‍👧‍👦 Apoderados
- ✅ Visualización de asistencia de su pupilo
- ✅ Historial de asistencia
- ✅ Notificaciones de inasistencias

## 🛡️ Seguridad

- **Autenticación**: Sistema de login con contraseñas encriptadas (scrypt)
- **Autorización**: Control de acceso basado en roles
- **Datos Biométricos**: Almacenamiento seguro de templates de huellas
- **Sesiones**: Gestión segura de sesiones de usuario

## 🚧 Estado del Proyecto

✅ **Completado**:
- Estructura de base de datos unificada
- Sistema de autenticación y autorización
- Interfaces de usuario responsivas
- Gestión de asistencia manual
- Módulos JavaScript organizados

🔄 **En Desarrollo**:
- Integración completa con hardware biométrico
- Sistema de notificaciones automáticas
- Módulo de reportes avanzados

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

**Colegio AML** - Sistema de Asistencia Biométrica
- **Desarrollador**: Liza Molina Venegas
- **Email**: liza.molina@colegio-aml.cl
- **Proyecto**: [https://github.com/aionliz/Cristian](https://github.com/aionliz/Cristian)

---

⭐ **¡Si este proyecto te es útil, no olvides darle una estrella!** ⭐
