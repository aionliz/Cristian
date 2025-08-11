/**
 * Módulo para gestión de asignaciones
 * Maneja filtros, búsquedas y operaciones CRUD de asignaciones
 */

// Variables globales del módulo
let filtroAsignatura, filtroCurso, buscarProfesor, tabla, tbody;

/**
 * Inicialización del módulo de asignaciones
 */
function initAsignaciones() {
  console.log("🎯 Módulo Asignaciones cargado");

  // Inicializar elementos del DOM
  filtroAsignatura = document.getElementById("filtro-asignatura");
  filtroCurso = document.getElementById("filtro-curso");
  buscarProfesor = document.getElementById("buscar-profesor");
  tabla = document.getElementById("tabla-asignaciones");
  tbody = document.getElementById("tbody-asignaciones");

  // Configurar event listeners
  if (filtroAsignatura) {
    filtroAsignatura.addEventListener("change", filtrarAsignaciones);
  }

  if (filtroCurso) {
    filtroCurso.addEventListener("change", filtrarAsignaciones);
  }

  if (buscarProfesor) {
    buscarProfesor.addEventListener("input", filtrarAsignaciones);
  }

  // Configurar filtro de cursos si existe
  const cursoFilter = document.getElementById("cursoFilter");
  if (cursoFilter) {
    cursoFilter.addEventListener("change", filtrarPorCurso);
  }

  // Configurar botón filtrar curso
  const btnFiltrarCurso = document.querySelector(".btn-filtrar-curso");
  if (btnFiltrarCurso) {
    btnFiltrarCurso.addEventListener("click", filtrarCurso);
  }

  // Configurar botones de acción con data attributes
  configurarBotonesAccion();
}

/**
 * Configurar botones de acción con data attributes
 */
function configurarBotonesAccion() {
  document.addEventListener("click", function (e) {
    const button = e.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    switch (action) {
      case "ver-detalle":
        verDetalleAsignacion(id);
        break;
      case "editar":
        editarAsignacion(id);
        break;
      case "eliminar":
        // Para gestionar_asignaciones necesitamos datos adicionales
        if (button.dataset.asignatura) {
          confirmarEliminacion(
            id,
            button.dataset.asignatura,
            button.dataset.curso,
            button.dataset.profesor
          );
        } else {
          eliminarAsignacion(id);
        }
        break;
    }
  });
}

/**
 * Ver detalle de asignación
 */
function verDetalleAsignacion(id) {
  // Implementar vista de detalle
  console.log("Ver detalle asignación:", id);
}

/**
 * Editar asignación
 */
function editarAsignacion(id) {
  // Implementar edición
  console.log("Editar asignación:", id);
  window.location.href = `/asignaturas/editar_asignacion/${id}`;
}

/**
 * Eliminar asignación
 */
function eliminarAsignacion(id) {
  if (confirm("¿Está seguro de que desea eliminar esta asignación?")) {
    fetch(`/asignaturas/eliminar_asignacion_ajax/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          location.reload();
        } else {
          alert("Error al eliminar la asignación");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error al eliminar la asignación");
      });
  }
}

/**
 * Filtrar asignaciones según los criterios seleccionados
 */
function filtrarAsignaciones() {
  if (!tbody) return;

  const asignaturaSeleccionada = filtroAsignatura?.value || "";
  const cursoSeleccionado = filtroCurso?.value || "";
  const textoBusqueda = buscarProfesor?.value.toLowerCase() || "";

  const filas = tbody.querySelectorAll("tr");
  let filasVisibles = 0;

  filas.forEach((fila) => {
    const asignatura = fila.dataset.asignatura || "";
    const curso = fila.dataset.curso || "";
    const profesor = fila.textContent.toLowerCase();

    const coincideAsignatura =
      !asignaturaSeleccionada || asignatura === asignaturaSeleccionada;
    const coincideCurso = !cursoSeleccionado || curso === cursoSeleccionado;
    const coincideProfesor = !textoBusqueda || profesor.includes(textoBusqueda);

    if (coincideAsignatura && coincideCurso && coincideProfesor) {
      fila.style.display = "";
      filasVisibles++;
    } else {
      fila.style.display = "none";
    }
  });

  // Mostrar mensaje si no hay resultados
  const mensajeVacio = document.getElementById("mensaje-vacio");
  if (mensajeVacio) {
    mensajeVacio.style.display = filasVisibles === 0 ? "block" : "none";
  }
}

/**
 * Filtrar por curso específico (para página de asignaciones por curso)
 */
function filtrarPorCurso() {
  const cursoFilter = document.getElementById("cursoFilter");
  if (!cursoFilter) return;

  const cursoId = cursoFilter.value;
  if (cursoId) {
    window.location.href = `/asignaturas/asignaciones_por_curso?id_curso=${cursoId}`;
  } else {
    window.location.href = "/asignaturas/asignaciones_por_curso";
  }
}

/**
 * Configurar modal de eliminación de asignación
 */
function configurarEliminarAsignacion(id, asignatura, curso, profesor) {
  document.getElementById("asignatura-nombre").textContent = asignatura;
  document.getElementById("curso-nombre").textContent = curso;
  document.getElementById("profesor-nombre").textContent = profesor;
  document.getElementById("form-eliminar").action =
    "/asignaciones/eliminar/" + id;

  const modal = new bootstrap.Modal(document.getElementById("modalEliminar"));
  modal.show();
}

/**
 * Función legacy para compatibilidad (gestionar_asignaciones.html)
 */
function confirmarEliminacion(id, asignatura, curso, profesor) {
  configurarEliminarAsignacion(id, asignatura, curso, profesor);
}

// Función para filtrar curso (desde botón)
function filtrarCurso() {
  // Buscar el select de curso y aplicar filtro
  const cursoSelect =
    document.getElementById("curso") ||
    document.querySelector('select[name="curso"]');
  if (cursoSelect && cursoSelect.value) {
    if (typeof filtrarPorCurso === "function") {
      filtrarPorCurso(cursoSelect.value);
    } else {
      // Fallback: recargar página con filtro
      const form = cursoSelect.closest("form");
      if (form) {
        form.submit();
      }
    }
  } else {
    console.warn("No se encontró curso seleccionado para filtrar");
  }
}

// Exportar funciones para uso global
window.AsignacionesModule = {
  init: initAsignaciones,
  filtrar: filtrarAsignaciones,
  filtrarPorCurso: filtrarPorCurso,
  filtrarCurso: filtrarCurso,
  configurarEliminar: configurarEliminarAsignacion,
};

// Auto-inicialización si el DOM está listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAsignaciones);
} else {
  initAsignaciones();
}
