# 🏫 Sistema de Gestión Escolar AML
## 📚 Sistema Integral de Asistencia Biométrica y Gestión de Estudiantes

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1.1-green.svg)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-purple.svg)](https://getbootstrap.com)

Un sistema moderno y completo para la gestión escolar que incluye registro de estudiantes, sistema de asistencia biométrica mediante huellas dactilares, y panel administrativo con tema oscuro/claro.

---

## 🎯 **Características Principales**

### 🔐 **Sistema de Autenticación**
- Login y registro de usuarios
- Gestión de sesiones seguras
- Roles de administrador y profesor

### 👥 **Gestión de Estudiantes**
- Registro completo de estudiantes
- Búsqueda y filtrado avanzado
- Perfiles detallados con información académica

### 🔒 **Sistema Biométrico**
- **Panel de Administración**: Registro de huellas dactilares de estudiantes
- **Terminal de Asistencia**: Verificación biométrica para marcar asistencia
- Soporte para lectores DigitalPersona U.are.U 4500
- Estados de registro (Registrado/Pendiente)

### 🎨 **Interfaz Moderna**
- Tema claro/oscuro automático
- Diseño responsivo con Bootstrap 5.3
- Colores personalizados: gris pastel (modo claro) y blanco celeste (modo oscuro)
- Navegación intuitiva y accesible

---

## 🛠️ **Requisitos del Sistema**

### **Software Requerido**
- **Python**: 3.8 o superior
- **MySQL**: 8.0 o superior
- **Sistema Operativo**: Windows 10/11, macOS 10.15+, o Linux Ubuntu 18.04+

### **Hardware Opcional**
- **Lector de Huellas**: DigitalPersona U.are.U 4500 (para funcionalidad biométrica completa)

---

## 🚀 **Instalación Paso a Paso**

### **1. Preparación del Entorno**

#### **En Windows**
```bash
# Abrir PowerShell como administrador
# Verificar Python
python --version

# Si no tienes Python, descarga desde: https://python.org
# Asegúrate de marcar "Add Python to PATH" durante la instalación
```

#### **En macOS**
```bash
# Abrir Terminal
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Python
brew install python

# Verificar instalación
python3 --version
```

#### **En Linux (Ubuntu/Debian)**
```bash
# Actualizar sistema
sudo apt update
sudo apt upgrade -y

# Instalar Python y dependencias
sudo apt install python3 python3-pip python3-venv python3-dev -y

# Verificar instalación
python3 --version
```

### **2. Descargar el Proyecto**

```bash
# Opción 1: Clonar con Git
git clone https://github.com/tu-usuario/Colegio-AML.git
cd Colegio-AML

# Opción 2: Descargar ZIP
# Descargar desde GitHub y extraer
# Navegar a la carpeta extraída
```

### **3. Configurar Entorno Virtual**

#### **Windows**
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
venv\Scripts\activate

# Verificar activación (debe aparecer (venv) al inicio de la línea)
```

#### **macOS/Linux**
```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Verificar activación (debe aparecer (venv) al inicio de la línea)
```

### **4. Instalar Dependencias**

```bash
# Actualizar pip
pip install --upgrade pip

# Instalar dependencias del proyecto
pip install -r requirements.txt

# Si requirements.txt no existe, instalar manualmente:
pip install Flask==3.1.1 Flask-Session pymysql bcrypt python-dotenv
```

### **5. Configurar Base de Datos MySQL**

#### **Instalar MySQL**

**Windows:**
1. Descargar MySQL Installer desde: https://dev.mysql.com/downloads/installer/
2. Ejecutar e instalar MySQL Server 8.0+
3. Configurar contraseña root durante la instalación

**macOS:**
```bash
# Con Homebrew
brew install mysql

# Iniciar MySQL
brew services start mysql

# Configurar seguridad
mysql_secure_installation
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install mysql-server -y

# Iniciar servicio
sudo systemctl start mysql
sudo systemctl enable mysql

# Configurar seguridad
sudo mysql_secure_installation
```

#### **Crear Base de Datos**

```sql
# Conectar a MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE colegio_aml;

# Crear usuario (opcional pero recomendado)
CREATE USER 'aml_user'@'localhost' IDENTIFIED BY 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON colegio_aml.* TO 'aml_user'@'localhost';
FLUSH PRIVILEGES;

# Salir
EXIT;
```

### **6. Configurar Variables de Entorno**

Crear archivo `.env` en la raíz del proyecto:

```bash
# Windows
echo. > .env

# macOS/Linux
touch .env
```

Editar `.env` con tu editor favorito y agregar:

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=aml_user
DB_PASSWORD=tu_contraseña_segura
DB_NAME=colegio_aml

# Configuración de Flask
SECRET_KEY=tu_clave_secreta_muy_segura_aqui
FLASK_ENV=development
FLASK_DEBUG=True

# Puerto de la aplicación
PORT=5003

# Configuración Biométrica (opcional)
BIOMETRIC_DEVICE=/dev/cu.QR380A-241-4F6D
```

### **7. Inicializar Base de Datos**

Las tablas se crean automáticamente cuando ejecutas la aplicación por primera vez. Si necesitas crearlas manualmente:

```sql
-- Conectar a MySQL y usar la base de datos
mysql -u aml_user -p
USE colegio_aml;

-- Crear tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'profesor') DEFAULT 'profesor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de alumnos
CREATE TABLE alumnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    curso VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_nacimiento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de huellas dactilares
CREATE TABLE huellas_dactilares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT NOT NULL,
    template_data TEXT NOT NULL,
    hash_data VARCHAR(255),
    quality_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

-- Crear tabla de asistencias
CREATE TABLE asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada TIME,
    hora_salida TIME,
    presente BOOLEAN DEFAULT FALSE,
    metodo_verificacion ENUM('manual', 'biometrico') DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_alumno_fecha (alumno_id, fecha)
);
```

---

## 🎮 **Ejecutar la Aplicación**

### **Inicio Rápido**

```bash
# 1. Activar entorno virtual
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# 2. Ejecutar aplicación
python app.py

# 3. Abrir navegador en:
# http://127.0.0.1:5003
```

### **Verificar Funcionamiento**

1. **Página Principal**: http://127.0.0.1:5003
2. **Login**: http://127.0.0.1:5003/auth/login
3. **Panel Biométrico**: http://127.0.0.1:5003/biometric/admin
4. **Terminal de Asistencia**: http://127.0.0.1:5003/biometric/terminal

---

## 🔧 **Configuración Avanzada**

### **Configurar Lector Biométrico**

#### **Windows**
1. Instalar drivers DigitalPersona desde el sitio oficial
2. Conectar lector USB
3. Verificar en Administrador de Dispositivos
4. Actualizar `BIOMETRIC_DEVICE` en `.env` con el puerto COM

#### **macOS**
```bash
# Verificar dispositivos USB
system_profiler SPUSBDataType

# Encontrar el puerto del lector
ls /dev/cu.*

# Actualizar .env con el puerto correcto
```

#### **Linux**
```bash
# Instalar libusb
sudo apt install libusb-1.0-0-dev

# Verificar dispositivos
lsusb

# Dar permisos al dispositivo
sudo chmod 666 /dev/ttyUSB*
```

---

## 📊 **Estructura del Proyecto**

```
Colegio-AML/
├── 📁 base/
│   ├── 📁 config/
│   │   └── mysqlconnection.py      # Configuración de BD
│   ├── 📁 controllers/
│   │   ├── auth_controller.py      # Autenticación
│   │   ├── main_controller.py      # Página principal
│   │   ├── student_controller.py   # Gestión estudiantes
│   │   └── huella_controller.py    # Sistema biométrico
│   ├── 📁 models/
│   │   ├── user_model.py          # Modelo usuarios
│   │   ├── alumno_model.py        # Modelo estudiantes
│   │   └── asistencia_model.py    # Modelo asistencia
│   ├── 📁 static/
│   │   ├── 📁 css/
│   │   │   ├── style.css          # Estilos principales
│   │   │   ├── dark-theme-enhanced.css
│   │   │   └── text-contrast-fix.css
│   │   ├── 📁 js/
│   │   │   └── script.js          # JavaScript
│   │   └── 📁 img/
│   │       └── logo.png           # Logo del colegio
│   └── 📁 templates/
│       ├── base.html              # Template base
│       ├── 📁 auth/               # Templates autenticación
│       ├── 📁 students/           # Templates estudiantes
│       └── 📁 fingerprint/        # Templates biométrico
├── app.py                         # Aplicación principal
├── requirements.txt               # Dependencias Python
├── .env                          # Variables de entorno
└── README.md                     # Este archivo
```

---

## 🎨 **Uso del Sistema**

### **1. Primer Uso - Crear Administrador**

Ejecutar la aplicación y registrar el primer usuario como administrador:

1. Ir a http://127.0.0.1:5003/auth/register
2. Registrar usuario con email de administrador
3. El primer usuario registrado tendrá rol de administrador automáticamente

### **2. Navegación Principal**

- **🏠 Inicio**: Página principal con estadísticas
- **👥 Estudiantes**: Gestión completa de alumnos
- **🔒 Biométrico**: Sistema de huellas dactilares
- **📊 Asistencia**: Registro y consulta de asistencia
- **⚙️ Configuración**: Ajustes del sistema

### **3. Sistema Biométrico**

#### **Para Administradores:**
1. Ir a **Panel Biométrico** (`/biometric/admin`)
2. Buscar estudiante en la lista
3. Hacer clic en "Registrar Huella"
4. Seguir instrucciones en pantalla
5. Verificar estado "Registrado"

#### **Para Profesores:**
1. Ir a **Terminal de Asistencia** (`/biometric/terminal`)
2. Verificar estado del dispositivo
3. Solicitar a estudiantes colocar dedo
4. Confirmar asistencia automática

---

## 🐛 **Solución de Problemas**

### **Error: "No module named 'pymysql'"**
```bash
pip install pymysql
```

### **Error de Conexión MySQL**
```bash
# Verificar que MySQL esté ejecutándose
# Windows:
net start mysql

# macOS:
brew services start mysql

# Linux:
sudo systemctl start mysql
```

### **Error: "Port 5003 already in use"**
```bash
# Cambiar puerto en .env
PORT=5004

# O terminar proceso existente:
# Windows:
netstat -ano | findstr :5003
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5003 | xargs kill -9
```

### **Lector Biométrico No Detectado**
1. Verificar conexión USB
2. Instalar drivers oficiales
3. Revisar permisos de dispositivo
4. Actualizar puerto en `.env`

### **Tema Oscuro/Claro No Funciona**
1. Verificar que `text-contrast-fix.css` esté cargado
2. Limpiar caché del navegador (Ctrl+F5)
3. Revisar consola de desarrollador (F12)

---

## 🔒 **Seguridad**

### **Mejores Prácticas**
- Cambiar `SECRET_KEY` por una clave única y segura
- Usar contraseñas fuertes para MySQL
- No subir archivo `.env` a repositorios públicos
- Activar firewall para puerto 5003 en producción
- Usar HTTPS en entornos de producción

### **Backup de Base de Datos**
```bash
# Crear backup
mysqldump -u aml_user -p colegio_aml > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u aml_user -p colegio_aml < backup_20240119.sql
```

---

## 📱 **Características Responsive**

El sistema está optimizado para:
- **🖥️ Desktop**: Pantallas grandes (1920x1080+)
- **💻 Laptop**: Pantallas medianas (1366x768+)
- **📱 Tablet**: iPad y tablets Android
- **📱 Mobile**: Smartphones iOS y Android

---

## 🤝 **Contribución**

### **Reportar Bugs**
1. Crear issue en GitHub con:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Sistema operativo y versión
   - Logs de error

### **Solicitar Features**
1. Abrir discussion en GitHub
2. Describir funcionalidad deseada
3. Justificar utilidad
4. Proponer implementación

---

## 📝 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 📞 **Soporte**

- **📧 Email**: soporte@colegio-aml.com
- **🐛 Issues**: [GitHub Issues](https://github.com/tu-usuario/Colegio-AML/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/tu-usuario/Colegio-AML/discussions)
- **📖 Wiki**: [Documentación Completa](https://github.com/tu-usuario/Colegio-AML/wiki)

---

## 🙏 **Agradecimientos**

- **Flask Team** por el excelente framework web
- **Bootstrap Team** por los componentes UI
- **DigitalPersona** por la tecnología biométrica
- **MySQL Team** por la base de datos robusta

---

## 📋 **Changelog**

### **v1.0.0** (2025-01-19)
- ✅ Sistema de autenticación completo
- ✅ Gestión de estudiantes
- ✅ Sistema biométrico funcional
- ✅ Tema oscuro/claro
- ✅ Diseño responsive
- ✅ Panel administrativo
- ✅ Terminal de asistencia

---

**🚀 ¡Listo para usar! Si sigues estos pasos, tendrás el sistema funcionando en cualquier sistema operativo.**

*Última actualización: 19 de Enero, 2025*

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
