/**
 * Loader de módulos JavaScript
 * Este archivo se encarga de cargar los módulos específicos según la página actual
 */

const ModuleLoader = {
  // Mapeo de rutas a módulos
  routes: {
    "/auth/login": ["auth"],
    "/asistencia/editar": ["asistencia-edit"],
    "/asistencia/marcar": [], // unified-app.js ya maneja esto
    "/asistencia/curso": ["asistencia-rapida", "asistencia-por-curso"], // Para asistencia rápida
    "/asistencia/reporte-mensual": ["reportes"], // Para reportes con gráficos
    "/asistencia/por-curso": ["asistencia-rapida", "asistencia-por-curso"], // Para asistencia por curso
    "/admin/": ["admin", "tabla-utils"],
    "/admin/gestionar-profesores": ["admin", "profesores", "tabla-utils"],
    "/admin/gestionar-alumnos": ["admin", "tabla-utils"],
    "/admin/gestionar-cursos": ["admin", "tabla-utils"],
    "/admin/gestionar-asignaturas": ["admin", "tabla-utils"],
    "/admin/agregar-profesor": [
      "admin",
      "profesores",
      "formulario-utils",
      "profesor-utils",
    ],
    "/admin/detalle-profesor": ["admin", "profesores"],
    "/admin/editar-profesor": [
      "admin",
      "profesores",
      "formulario-utils",
      "profesor-utils",
    ],
    "/admin/agregar-alumno": ["admin", "formulario-utils"],
    "/admin/editar-alumno": ["admin", "formulario-utils"],
    "/admin/agregar-curso": ["admin", "formulario-utils", "curso-utils"],
    "/admin/editar-curso": ["admin", "formulario-utils", "curso-utils"],
    "/admin/agregar-asignatura": ["admin", "asignaturas", "formulario-utils"],
    "/admin/editar-asignatura": ["admin", "asignaturas", "formulario-utils"],
    "/admin/detalle-asignatura": ["admin", "detalle-asignatura"],
    "/admin/gestionar-asignaciones": [
      "admin",
      "asignaciones",
      "formulario-utils",
    ],
    "/admin/agregar-asignacion": ["admin", "asignaciones", "formulario-utils"],
    "/admin/asignaciones-por-curso": ["admin", "asignaciones"],
    "/admin/alumnos-curso-asignatura": ["admin", "asistencia-rapida"],
    "/asignaturas/": ["asignaciones", "tabla-utils"],
    "/asignaturas/asignaciones": ["asignaciones", "tabla-utils"],
    "/asignaturas/gestionar_asignaciones": ["asignaciones", "tabla-utils"],
    "/asignaturas/asignaciones_por_curso": ["asignaciones"],
    "/test/": ["debug"],
    "/test/dropdowns": ["debug"],
    "/debug/": ["debug"],
    "/debug/dropdowns": ["debug"],
  },

  // Cargar módulo dinámicamente
  loadModule: function (moduleName) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `/static/js/modules/${moduleName}.js`;
      script.onload = () => {
        console.log(`✅ Módulo ${moduleName} cargado`);
        resolve();
      };
      script.onerror = () => {
        console.error(`❌ Error cargando módulo ${moduleName}`);
        reject();
      };
      document.head.appendChild(script);
    });
  },

  // Cargar módulos para la página actual
  loadModulesForCurrentPage: function () {
    const currentPath = window.location.pathname;
    console.log(`🔍 Cargando módulos para: ${currentPath}`);

    // Buscar coincidencia exacta o parcial
    let modules = [];

    // Coincidencia exacta
    if (this.routes[currentPath]) {
      modules = this.routes[currentPath];
    } else {
      // Coincidencia parcial (para rutas dinámicas)
      for (const route in this.routes) {
        if (currentPath.startsWith(route)) {
          modules = this.routes[route];
          break;
        }
      }
    }

    // Cargar módulos encontrados junto con event-handlers universal
    const allModules = ["event-handlers", ...modules];

    if (allModules.length > 1) {
      // Más que solo event-handlers
      console.log(`📦 Cargando módulos: ${allModules.join(", ")}`);
      Promise.all(allModules.map((module) => this.loadModule(module)))
        .then(() => console.log("✅ Todos los módulos cargados"))
        .catch(() => console.error("❌ Error cargando algunos módulos"));
    } else {
      // Solo cargar event-handlers
      this.loadModule("event-handlers");
      console.log("ℹ️ Solo módulos base cargados para esta página");
    }
  },

  // Inicializar
  init: function () {
    // El header siempre se carga
    this.loadModule("header").then(() => {
      // Después cargar módulos específicos de la página
      this.loadModulesForCurrentPage();
    });
  },
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  ModuleLoader.init();
});

// Exportar para uso global
window.ModuleLoader = ModuleLoader;
