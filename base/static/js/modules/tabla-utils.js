/**
 * Módulo para funcionalidades de búsqueda en tablas
 * Proporciona búsqueda en tiempo real y filtrado de resultados
 */

const BusquedaTabla = {
  // Configuración inicial
  config: {
    inputSelector: "#buscar-asignatura",
    limpiarSelector: "#limpiar-busqueda",
    contadorSelector: "#contador-resultados",
    tbodySelector: "#tbody-asignaturas",
    columnasABuscar: [0, 1], // Índices de las columnas a buscar (0=nombre, 1=descripción)
  },

  // Inicializar con configuración personalizada
  init: function (config = {}) {
    this.config = { ...this.config, ...config };
    this.bindEvents();
  },

  // Vincular eventos
  bindEvents: function () {
    const buscarInput = document.querySelector(this.config.inputSelector);
    const limpiarBtn = document.querySelector(this.config.limpiarSelector);

    if (buscarInput) {
      buscarInput.addEventListener("input", (e) =>
        this.buscarEnTabla(e.target.value)
      );
    }

    if (limpiarBtn) {
      limpiarBtn.addEventListener("click", () => this.limpiarBusqueda());
    }
  },

  // Función principal de búsqueda
  buscarEnTabla: function (termino) {
    const tbody = document.querySelector(this.config.tbodySelector);
    const limpiarBtn = document.querySelector(this.config.limpiarSelector);
    const contadorResultados = document.querySelector(
      this.config.contadorSelector
    );

    if (!tbody) return;

    const terminoLower = termino.toLowerCase();
    const filas = tbody.querySelectorAll("tr");
    let resultados = 0;

    filas.forEach((fila) => {
      let encontrado = false;

      // Buscar en las columnas especificadas
      this.config.columnasABuscar.forEach((indiceColumna) => {
        const celda = fila.querySelector(`td:nth-child(${indiceColumna + 1})`);
        if (celda && celda.textContent.toLowerCase().includes(terminoLower)) {
          encontrado = true;
        }
      });

      if (encontrado) {
        fila.style.display = "";
        resultados++;
      } else {
        fila.style.display = "none";
      }
    });

    // Actualizar UI de búsqueda
    this.actualizarUIBusqueda(
      termino,
      resultados,
      limpiarBtn,
      contadorResultados
    );
  },

  // Actualizar elementos de UI de búsqueda
  actualizarUIBusqueda: function (
    termino,
    resultados,
    limpiarBtn,
    contadorResultados
  ) {
    if (termino.length > 0) {
      if (limpiarBtn) limpiarBtn.style.display = "block";
      if (contadorResultados) {
        contadorResultados.style.display = "block";
        contadorResultados.textContent = `${resultados} resultado${
          resultados !== 1 ? "s" : ""
        }`;
      }
    } else {
      if (limpiarBtn) limpiarBtn.style.display = "none";
      if (contadorResultados) contadorResultados.style.display = "none";
    }
  },

  // Limpiar búsqueda
  limpiarBusqueda: function () {
    const buscarInput = document.querySelector(this.config.inputSelector);
    if (buscarInput) {
      buscarInput.value = "";
      buscarInput.dispatchEvent(new Event("input"));
      buscarInput.focus();
    }
  },
};

/**
 * Módulo para confirmaciones de eliminación
 */
const ConfirmacionEliminacion = {
  // Mostrar modal de confirmación
  confirmar: function (
    id,
    nombre,
    modalId = "modalEliminar",
    formId = "form-eliminar",
    nombreElementoId = "nombre-asignatura",
    actionUrl = "/asignaturas/eliminar/"
  ) {
    const nombreElemento = document.getElementById(nombreElementoId);
    const form = document.getElementById(formId);

    if (nombreElemento) nombreElemento.textContent = nombre;
    if (form) form.action = actionUrl + id;

    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
  },
};

// Funciones globales para compatibilidad
window.confirmarEliminacion = function (id, nombre) {
  ConfirmacionEliminacion.confirmar(id, nombre);
};

window.confirmarEliminacionAsignatura = function (id, nombre) {
  ConfirmacionEliminacion.confirmar(
    id,
    nombre,
    "modalEliminar",
    "form-eliminar",
    "nombre-asignatura",
    "/asignaturas/eliminar/"
  );
};

window.confirmarEliminacionAlumno = function (id, nombre) {
  ConfirmacionEliminacion.confirmar(
    id,
    nombre,
    "modalEliminar",
    "form-eliminar",
    "nombre-alumno",
    "/admin/eliminar-alumno/"
  );
};

window.confirmarEliminacionProfesor = function (id, nombre) {
  ConfirmacionEliminacion.confirmar(
    id,
    nombre,
    "modalEliminar",
    "form-eliminar",
    "nombre-profesor",
    "/profesor/eliminar/"
  );
};

window.confirmarEliminacionCurso = function (id, nombre) {
  ConfirmacionEliminacion.confirmar(
    id,
    nombre,
    "modalEliminar",
    "form-eliminar",
    "nombre-curso",
    "/admin/eliminar-curso/"
  );
};

// Auto-inicializar búsqueda para asignaturas cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  // Solo inicializar si estamos en una página con búsqueda de asignaturas
  if (document.querySelector("#buscar-asignatura")) {
    BusquedaTabla.init();
  }

  // Inicializar búsqueda para alumnos
  if (document.querySelector("#buscar-alumno")) {
    BusquedaTabla.init({
      inputSelector: "#buscar-alumno",
      limpiarSelector: "#limpiar-busqueda-alumno",
      contadorSelector: "#contador-resultados-alumno",
      tbodySelector: "#tbody-alumnos",
      columnasABuscar: [0, 1, 2], // nombre, email, teléfono
    });
  }

  // Inicializar búsqueda para profesores
  if (document.querySelector("#buscar-profesor")) {
    BusquedaTabla.init({
      inputSelector: "#buscar-profesor",
      limpiarSelector: "#limpiar-busqueda-profesor",
      contadorSelector: "#contador-resultados-profesor",
      tbodySelector: "#tbody-profesores",
      columnasABuscar: [0, 1, 2], // nombre, email, especialidad
    });
  }

  // Inicializar búsqueda para cursos
  if (document.querySelector("#buscar-curso")) {
    BusquedaTabla.init({
      inputSelector: "#buscar-curso",
      limpiarSelector: "#limpiar-busqueda-curso",
      contadorSelector: "#contador-resultados-curso",
      tbodySelector: "#tbody-cursos",
      columnasABuscar: [0, 1], // nombre, nivel
    });
  }
});

// Exportar módulos
window.BusquedaTabla = BusquedaTabla;
window.ConfirmacionEliminacion = ConfirmacionEliminacion;
