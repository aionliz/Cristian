# 🏫 Sistema de Asistencia Biométrica - Colegio AML

Sistema integral de control de asistencia escolar con tecnología biométrica (huellas dactilares), desarrollado en Flask y MySQL. Incluye gestión de usuarios, registro de asistencia en tiempo real, y panel administrativo completo con modo día/noche.

## 🚀 Características Principales

- **🔐 Autenticación biométrica** con lector DigitalPersona U.are.U 4500
- **👥 Gestión completa de usuarios** (administradores, profesores, alumnos, apoderados)
- **📊 Control de asistencia** en tiempo real con verificación biométrica
- **🎨 Interfaz moderna** con tema claro/oscuro y diseño responsive
- **📈 Dashboard administrativo** con estadísticas y reportes
- **🔧 Terminal biométrico** para profesores y administradores
- **🛡️ Sistema de permisos** por roles de usuario

## 🛠️ Tecnologías y Dependencias

### Backend
- **Flask 3.1.1** - Framework web principal
- **PyMySQL 1.1.1** - Conector MySQL para Python
- **Flask-Bcrypt 1.0.1** - Encriptación segura de contraseñas
- **PySerial 3.5** - Comunicación con dispositivos biométricos

### Hardware Biométrico
- **OpenCV 4.10.0** - Procesamiento de imágenes de huellas
- **NumPy 2.1.3** - Operaciones matemáticas para patrones biométricos
- **Pillow 11.0.0** - Manipulación y procesamiento de imágenes

### Frontend
- **Bootstrap 5.3.0** - Framework CSS responsive
- **Font Awesome 6.0.0** - Iconografía moderna
- **jQuery 3.6.0** - Interacciones dinámicas

### Base de Datos
- **MySQL 8.0+** - Sistema de gestión de base de datos

## 📋 Requisitos del Sistema

### Requisitos Mínimos
- **Python 3.8 o superior**
- **MySQL 8.0 o superior**
- **4 GB RAM mínimo** (8 GB recomendado)
- **2 GB espacio libre** en disco
- **Conexión a internet** para descargar dependencias

### Hardware Biométrico Soportado
- **DigitalPersona U.are.U 4500** - Lector óptico de huellas dactilares
- **Conexión USB 2.0 o superior**

### Sistemas Operativos Soportados
- **Windows 10/11** (x64)
- **macOS 12.0+** (Intel y Apple Silicon)
- **Ubuntu 20.04+** (opcional)

## 🔧 Instalación Paso a Paso

### 📥 PASO 1: Preparación del Sistema

#### En Windows:

1. **Instalar Python 3.8+**
   - Descargar desde: https://www.python.org/downloads/
   - ✅ **IMPORTANTE**: Marcar "Add Python to PATH" durante la instalación
   - Verificar instalación:
   ```cmd
   python --version
   pip --version
   ```

2. **Instalar MySQL 8.0+**
   - Descargar desde: https://dev.mysql.com/downloads/mysql/
   - Durante la instalación, recordar la **contraseña de root**
   - Verificar instalación:
   ```cmd
   mysql --version
   ```

3. **Instalar Git** (opcional pero recomendado)
   - Descargar desde: https://git-scm.com/download/win

#### En macOS:

1. **Instalar Python 3.8+**
   ```bash
   # Opción 1: Usando Homebrew (recomendado)
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   brew install python
   
   # Opción 2: Descargar desde python.org
   # https://www.python.org/downloads/macos/
   ```

2. **Instalar MySQL**
   ```bash
   # Opción 1: Usando Homebrew
   brew install mysql
   brew services start mysql
   
   # Opción 2: Descargar instalador desde
   # https://dev.mysql.com/downloads/mysql/
   ```

3. **Configurar MySQL** (primera vez)
   ```bash
   mysql_secure_installation
   ```

### 📂 PASO 2: Obtener el Código

#### Opción A: Clonar repositorio (si tienes Git)
```bash
git clone <URL_DEL_REPOSITORIO>
cd Colegio-AML
```

#### Opción B: Descargar ZIP
1. Descargar el archivo ZIP del proyecto
2. Extraer en una carpeta (ej: `C:\Colegio-AML` o `~/Colegio-AML`)
3. Abrir terminal/command prompt en esa carpeta

### 🐍 PASO 3: Configurar Entorno Python

#### En Windows:
```cmd
# Navegar a la carpeta del proyecto
cd C:\ruta\a\Colegio-AML

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

#### En macOS/Linux:
```bash
# Navegar a la carpeta del proyecto
cd ~/ruta/a/Colegio-AML

# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 🗄️ PASO 4: Configurar Base de Datos

#### 1. Acceder a MySQL
```bash
# En Windows y macOS
mysql -u root -p
# Introducir la contraseña de root que configuraste
```

#### 2. Crear base de datos
```sql
CREATE DATABASE colegio_aml CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 3. Importar estructura (si existe archivo SQL)
```bash
# Si tienes un archivo database_setup.sql
mysql -u root -p colegio_aml < database_setup.sql

# Si no, la aplicación creará las tablas automáticamente
```

### ⚙️ PASO 5: Configurar la Aplicación

1. **Verificar configuración MySQL** en `base/config/mysqlconnection.py`:
   ```python
   # Asegúrate de que estos datos coincidan con tu instalación
   host = 'localhost'
   user = 'root'
   password = 'TU_CONTRASEÑA_DE_MYSQL'
   database = 'colegio_aml'
   ```

2. **Configurar puerto de la aplicación** en `app.py` (si es necesario):
   ```python
   # Al final del archivo, cambiar puerto si 5003 está ocupado
   app.run(debug=True, host='0.0.0.0', port=5003)
   ```

### 🚀 PASO 6: Ejecutar la Aplicación

#### En Windows:
```cmd
# Activar entorno virtual (si no está activo)
venv\Scripts\activate

# Ejecutar aplicación
python app.py
```

#### En macOS/Linux:
```bash
# Activar entorno virtual (si no está activo)
source venv/bin/activate

# Ejecutar aplicación
python app.py
```

#### ✅ Verificar que funciona:
- Abrir navegador web
- Ir a: **http://127.0.0.1:5003**
- Deberías ver la página de login

## 🌐 Acceso al Sistema

### URLs Principales
- **Página principal**: http://127.0.0.1:5003
- **Login**: http://127.0.0.1:5003/auth/login
- **Registro**: http://127.0.0.1:5003/auth/register
- **Panel biométrico**: http://127.0.0.1:5003/biometric/admin
- **Terminal profesor**: http://127.0.0.1:5003/biometric/terminal

### 👤 Usuarios por Defecto
| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| Administrador | admin@colegio.cl | admin123 | Acceso completo al sistema |
| Profesor | profesor@colegio.cl | profesor123 | Gestión de asistencia |

## 📁 Estructura del Proyecto

```
Colegio-AML/
├── app.py                      # 🚀 Aplicación principal Flask
├── requirements.txt            # 📦 Dependencias Python
├── README.md                   # 📖 Este archivo
├── base/                       # 📂 Módulos principales
│   ├── config/                 # ⚙️ Configuración
│   │   └── mysqlconnection.py  # 🔗 Conexión a base de datos
│   ├── models/                 # 🗃️ Modelos de datos
│   │   ├── user_model.py       # 👤 Modelo de usuarios
│   │   ├── alumno_model.py     # 🎓 Modelo de alumnos
│   │   ├── huella_model.py     # 👆 Modelo de huellas
│   │   └── asistencia_model.py # 📊 Modelo de asistencia
│   ├── controllers/            # 🎮 Controladores
│   │   ├── auth_controller.py  # 🔐 Autenticación
│   │   ├── main_controller.py  # 🏠 Página principal
│   │   ├── student_controller.py # 🎓 Gestión estudiantes
│   │   └── huella_controller.py # 👆 Sistema biométrico
│   ├── static/                 # 🎨 Archivos estáticos
│   │   ├── css/               # 🎨 Estilos CSS
│   │   │   ├── style.css      # 🎨 Estilos principales
│   │   │   ├── dark-theme-enhanced.css # 🌙 Tema oscuro
│   │   │   └── text-contrast-fix.css # 🔧 Correcciones de color
│   │   ├── js/                # ⚡ JavaScript
│   │   │   └── script.js      # ⚡ Scripts principales
│   │   └── img/               # 🖼️ Imágenes
│   │       └── logo.png       # 🏫 Logo del colegio
│   └── templates/             # 📄 Plantillas HTML
│       ├── base.html          # 📄 Plantilla base
│       ├── auth/              # 🔐 Templates de autenticación
│       │   ├── login.html     # 🔑 Página de login
│       │   └── register.html  # 📝 Página de registro
│       ├── fingerprint/       # 👆 Templates biométricos
│       │   ├── admin_panel.html # 🔧 Panel administración
│       │   └── terminal.html  # 💻 Terminal biométrico
│       ├── students/          # 🎓 Templates de estudiantes
│       │   ├── student_list.html # 📋 Lista estudiantes
│       │   └── student_detail.html # 👤 Detalle estudiante
│       └── includes/          # 📎 Componentes reutilizables
│           ├── header.html    # 📋 Encabezado
│           └── footer.html    # 📋 Pie de página
└── venv/                      # 🐍 Entorno virtual (generado automáticamente)
```

## 🔧 Configuración de Hardware Biométrico

### Para DigitalPersona U.are.U 4500:

#### En Windows:
1. **Conectar el dispositivo** por USB
2. **Instalar drivers oficiales** desde el sitio de DigitalPersona
3. **Verificar en Administrador de dispositivos** que aparece correctamente
4. **Ejecutar prueba**:
   ```cmd
   python test_hardware.py
   ```

#### En macOS:
1. **Conectar el dispositivo** por USB
2. **Permitir acceso** en Configuración del Sistema > Seguridad y Privacidad
3. **Verificar puerto serie**:
   ```bash
   ls /dev/cu.*
   # Buscar algo como: /dev/cu.QR380A-241-4F6D
   ```
4. **Ejecutar prueba**:
   ```bash
   python test_hardware.py
   ```

## 🔧 Solución de Problemas Comunes

### ❌ Error: "ModuleNotFoundError"
```bash
# Asegúrate de que el entorno virtual está activado
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Reinstalar dependencias
pip install -r requirements.txt
```

### ❌ Error: "Access denied for user 'root'@'localhost'"
```bash
# Verificar contraseña de MySQL
mysql -u root -p

# Si olvidaste la contraseña, resetearla:
# Windows: mysqld --skip-grant-tables
# macOS: brew services stop mysql && mysqld_safe --skip-grant-tables
```

### ❌ Error: "Port 5003 already in use"
1. **Cambiar puerto** en `app.py`:
   ```python
   app.run(debug=True, host='0.0.0.0', port=5004)  # Cambiar a otro puerto
   ```
2. **O liberar el puerto**:
   ```bash
   # Windows:
   netstat -ano | findstr :5003
   taskkill /PID <numero_proceso> /F
   
   # macOS:
   lsof -ti:5003 | xargs kill -9
   ```

### ❌ Error: Lector biométrico no detectado
1. **Verificar conexión USB**
2. **Reinstalar drivers** del dispositivo
3. **Verificar permisos** del sistema
4. **Probar en otro puerto USB**

### ❌ Error: Texto no visible (colores)
- El sistema tiene corrección automática de contraste
- Cambiar entre modo claro/oscuro con el botón en la navegación
- Los colores se ajustan automáticamente

## 🎯 Funcionalidades del Sistema

### 👥 Gestión de Usuarios
- ✅ **Registro y login** con validación de email
- ✅ **Roles diferenciados**: Admin, Profesor, Alumno, Apoderado
- ✅ **Perfiles personalizados** con información completa
- ✅ **Seguridad con BCrypt** para contraseñas

### 🔒 Sistema Biométrico
- ✅ **Registro de huellas** con validación de calidad
- ✅ **Verificación biométrica** en tiempo real
- ✅ **Panel administrativo** para gestión masiva
- ✅ **Terminal para profesores** con interfaz simplificada
- ✅ **Soporte multi-dedo** por alumno

### 📊 Control de Asistencia
- ✅ **Marca de presente** con huella dactilar
- ✅ **Registro automático** de fecha y hora
- ✅ **Estadísticas en tiempo real**
- ✅ **Historial completo** por alumno y fecha

### 🎨 Interfaz de Usuario
- ✅ **Diseño responsive** para móvil y desktop
- ✅ **Modo claro/oscuro** automático
- ✅ **Navegación intuitiva** con breadcrumbs
- ✅ **Colores personalizados**: Gris pastel (claro) y Celeste (oscuro)

## 🧪 Comandos de Prueba

### Verificar instalación completa:
```bash
# Activar entorno
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Probar conexión a base de datos
python -c "from base.config.mysqlconnection import connectToMySQL; print('DB OK' if connectToMySQL('colegio_aml') else 'DB Error')"

# Probar hardware biométrico (si está conectado)
python test_hardware.py

# Ejecutar aplicación
python app.py
```

### Verificar funcionalidades web:
1. **Login**: http://127.0.0.1:5003/auth/login
2. **Registro**: http://127.0.0.1:5003/auth/register
3. **Lista estudiantes**: http://127.0.0.1:5003/students
4. **Panel biométrico**: http://127.0.0.1:5003/biometric/admin
5. **Terminal profesor**: http://127.0.0.1:5003/biometric/terminal

## 🚀 Puesta en Producción

### Para uso en red local:

1. **Cambiar host en app.py**:
   ```python
   app.run(debug=False, host='0.0.0.0', port=5003)
   ```

2. **Configurar firewall**:
   - **Windows**: Permitir puerto 5003 en Windows Defender
   - **macOS**: Ir a Sistema > Seguridad > Firewall

3. **Acceder desde otros dispositivos**:
   - Usar la IP del servidor: `http://192.168.1.XXX:5003`

### Para uso permanente:

1. **Usar supervisor o systemd** para mantener la aplicación corriendo
2. **Configurar nginx** como proxy reverso
3. **Usar HTTPS** con certificados SSL
4. **Backup automático** de la base de datos

## 📞 Soporte y Contacto

### 📧 Información de Contacto
- **Desarrollador**: Sistema Biométrico Colegio AML
- **Email**: soporte@colegioaml.cl
- **Versión**: 1.0.0
- **Última actualización**: Julio 2025

### 🐛 Reportar Problemas
1. **Describe el problema** detalladamente
2. **Incluye capturas de pantalla** si es posible
3. **Menciona tu sistema operativo** y versión
4. **Incluye logs de error** de la consola

### 📚 Documentación Adicional
- **Manual de usuario**: Ver carpeta `/docs/` (si existe)
- **API Documentation**: Disponible en `/api/docs` cuando la app esté corriendo

## 📄 Información del Proyecto

### 🏷️ Versión Actual: v1.0.0

#### ✅ Funcionalidades Implementadas:
- Sistema de autenticación completo
- Panel administrativo biométrico
- Terminal para profesores
- Gestión de estudiantes
- Control de asistencia con huellas
- Interfaz responsive con temas
- Base de datos MySQL optimizada

#### 🔄 Próximas Funcionalidades:
- API REST para integración externa
- Aplicación móvil nativa
- Reportes PDF automáticos
- Integración con sistemas existentes del colegio
- Backup automático en la nube

### 📋 Tecnologías y Estándares:
- **Patrón MVC** con Flask Blueprints
- **Seguridad**: BCrypt, validación de inputs, CSRF protection
- **Performance**: Consultas optimizadas, caching de sesiones
- **Usabilidad**: Responsive design, accesibilidad web
- **Escalabilidad**: Arquitectura modular, base de datos normalizada

---

**© 2025 Colegio AML - Sistema de Asistencia Biométrica**  
*Desarrollado con ❤️ para la educación moderna*


