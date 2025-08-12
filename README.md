# 🎓 Sistema de Asistencia Biométrica - Colegio AML

Sistema de control de asistencia con tecnología biométrica (huellas dactilares) desarrollado para el Colegio AML, específicamente para el curso 4° Medio B.

## 🚀 Características Principales

- **✋ Sistema Biométrico**: Registro de asistencia con huellas dactilares usando DigitalPersona U.are.U 4500
- **👨‍🏫 Gestión de Profesores**: Administración completa de profesores y asignaciones
- **👨‍🎓 Gestión de Alumnos**: Control de estudiantes del 4° Medio B
- **📊 Reportes de Asistencia**: Visualización y exportación de datos de asistencia
- **🔐 Sistema de Usuarios**: Admin, profesores y apoderados con roles específicos
- **📱 Interfaz Responsiva**: Diseño adaptable a dispositivos móviles
- **⚡ JavaScript Modular**: Código organizado en módulos reutilizables

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
    │   ├── mysqlconnection.py
    │   └── hardware_config.py
    ├── controllers/         # Controladores MVC
    │   ├── admin_controller.py
    │   ├── asistencia_controller.py
    │   └── ...
    ├── models/              # Modelos de datos
    │   ├── alumno_model.py
    │   ├── asistencia_model.py
    │   └── ...
    ├── static/              # Archivos estáticos
    │   ├── css/            # Estilos unificados
    │   ├── js/             # JavaScript modular
    │   │   ├── modules/    # Módulos JS organizados
    │   │   ├── module-loader.js
    │   │   └── unified-app.js
    │   └── img/            # Imágenes
    └── templates/           # Plantillas HTML (Jinja2)
        ├── base.html       # Template base
        ├── admin/          # Templates administrativos
        ├── asistencia/     # Templates de asistencia
        └── auth/           # Templates de autenticación
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
- **Contraseña**: `admin123`
- **Funciones**: Gestión completa del sistema

### 👨‍🏫 Profesores

- **Juan Pérez**: `juan.perez@colegio-aml.cl` / `profesor123`
- **María González**: `maria.gonzalez@colegio-aml.cl` / `profesor123`
- **Liza Molina**: `liza.molina@colegio-aml.cl` / `profesor123`
- **Carlos Rodríguez**: `carlos.rodriguez@colegio-aml.cl` / `profesor123`

### 👨‍👩‍👧‍👦 Apoderados

- Formato: `apoderado.[apellido]@colegio-aml.cl` / `password123`

## 📊 Funcionalidades por Rol

### 🔧 Administrador

- ✅ Gestión de usuarios y permisos
- ✅ Configuración del hardware biométrico
- ✅ Reportes y estadísticas completas
- ✅ Gestión de cursos y asignaciones
- ✅ Administración de profesores y alumnos

### 👨‍🏫 Profesores

- ✅ Toma de asistencia con huella dactilar
- ✅ Toma de asistencia manual
- ✅ Visualización de asistencia por asignatura
- ✅ Generación de reportes de su curso
- ✅ Gestión de justificaciones

### 👨‍👩‍👧‍👦 Apoderados

- ✅ Visualización de asistencia de su pupilo
- ✅ Historial de asistencia
- ✅ Notificaciones de inasistencias

## 🔧 Arquitectura JavaScript Modular

### Sistema de Módulos

El sistema utiliza un **cargador de módulos dinámico** que carga automáticamente el JavaScript necesario según la ruta actual:

#### Módulos Principales:

- **`asistencia-rapida.js`**: Manejo de asistencia rápida desde listados
- **`reportes.js`**: Generación de reportes con gráficos Chart.js
- **`tabla-utils.js`**: Utilidades para búsqueda y manejo de tablas
- **`formulario-utils.js`**: Validaciones y utilidades de formularios
- **`curso-utils.js`**: Funcionalidades específicas de cursos
- **`asistencia-por-curso.js`**: Manejo de asistencia por curso
- **`detalle-asignatura.js`**: Funcionalidades de detalle de asignatura

#### Carga Automática:

```javascript
// El module-loader.js mapea rutas a módulos automáticamente
routes: {
  "/asistencia/reporte-mensual": ["reportes"],
  "/asistencia/por-curso": ["asistencia-rapida", "asistencia-por-curso"],
  "/admin/alumnos-curso-asignatura": ["admin", "asistencia-rapida"]
}
```

### Beneficios de la Arquitectura:

- **✅ Separación de responsabilidades**: HTML solo estructura, JS organizado por funcionalidad
- **✅ Reutilización de código**: Módulos compartidos entre múltiples páginas
- **✅ Carga dinámica**: Solo se carga el JavaScript necesario para cada página
- **✅ Mejor debugging**: Código en archivos separados, más fácil de mantener
- **✅ Organización modular**: Cada módulo tiene una responsabilidad específica

## 🛡️ Seguridad

- **Autenticación**: Sistema de login con contraseñas encriptadas (scrypt)
- **Autorización**: Control de acceso basado en roles
- **Datos Biométricos**: Almacenamiento seguro de templates de huellas
- **Sesiones**: Gestión segura de sesiones de usuario
- **CSRF Protection**: Protección contra ataques de falsificación de peticiones

## 🎨 Interfaz de Usuario

### Sistema de Temas

- **Tema Claro**: Colores pasteles para mejor visibilidad
- **Tema Oscuro**: Modo nocturno con partículas animadas
- **Alternancia**: Toggle automático entre temas

### Componentes UI

- **Bootstrap 5**: Framework CSS responsivo
- **Font Awesome**: Iconografía consistente
- **Chart.js**: Gráficos interactivos en reportes
- **Modal Windows**: Ventanas emergentes para acciones rápidas

## 🚧 Estado del Proyecto

### ✅ **Completado**:

- Estructura de base de datos unificada
- Sistema de autenticación y autorización
- Interfaces de usuario responsivas
- Gestión de asistencia manual y biométrica
- Módulos JavaScript organizados y optimizados
- Sistema de reportes con gráficos
- Gestión completa de admin (profesores, alumnos, cursos)
- Estética unificada con márgenes consistentes

### 🔄 **En Desarrollo**:

- Integración completa con hardware biométrico
- Sistema de notificaciones automáticas
- Módulo de reportes avanzados
- API REST para aplicaciones móviles

### 📋 **Próximas Funcionalidades**:

- Exportación de reportes a Excel
- Notificaciones push a apoderados
- Aplicación móvil complementaria
- Integración con sistemas académicos

## 🔗 Estructura de Base de Datos

### Tablas Principales:

- **`usuarios`**: Sistema de autenticación
- **`alumnos`**: Información de estudiantes
- **`profesores`**: Datos de profesores
- **`cursos`**: Gestión de cursos
- **`asignaturas`**: Materias del currículum
- **`asignaciones`**: Relación profesor-asignatura-curso
- **`asistencias`**: Registros de asistencia
- **`huellas_dactilares`**: Templates biométricos

### Relaciones:

- Usuarios pueden ser profesores o apoderados
- Profesores tienen asignaciones en cursos específicos
- Alumnos pertenecen a cursos y tienen apoderados
- Asistencias se registran por alumno, fecha y asignación

## � Responsive Design

El sistema está optimizado para:

- **🖥️ Desktop**: Interfaz completa con todas las funcionalidades
- **📱 Tablets**: Layout adaptado con navegación optimizada
- **📱 Mobile**: Interfaz simplificada para acceso rápido

## 🔧 Configuración Avanzada

### Variables de Entorno:

```bash
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=colegio_AML

# Hardware biométrico
FINGERPRINT_ENABLED=true
DEVICE_MODEL=DigitalPersona_U4500

# Aplicación
FLASK_ENV=development
SECRET_KEY=your_secret_key
```

### Configuración de Hardware:

```python
# base/config/hardware_config.py
HARDWARE_CONFIG = {
    'fingerprint_reader': {
        'enabled': True,
        'device': 'DigitalPersona U.are.U 4500',
        'timeout': 30,
        'quality_threshold': 50
    }
}
```

## �📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

**Colegio AML** - Sistema de Asistencia Biométrica

- **Desarrollador**: Liza Molina Venegas
- **Email**: liza.molina@colegio-aml.cl
- **Proyecto**: [https://github.com/aionliz/Cristian](https://github.com/aionliz/Cristian)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📈 Changelog

### v2.0.0 (Actual)

- ✅ Sistema JavaScript modular implementado
- ✅ Estética unificada con márgenes consistentes
- ✅ Sistema de login corregido y funcional
- ✅ Base de datos poblada con usuarios de prueba
- ✅ Eliminación de archivos temporales y de test

### v1.0.0 (Inicial)

- ✅ Estructura básica del sistema
- ✅ Integración biométrica inicial
- ✅ Sistema de autenticación básico

---

⭐ **¡Si este proyecto te es útil, no olvides darle una estrella!** ⭐

🎓 **Desarrollado con ❤️ para la educación chilena** 🇨🇱
