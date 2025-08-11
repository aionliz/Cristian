/**
 * Módulo para funcionalidades de asistencia por curso
 * Maneja la delegación de eventos y integración con asistencia rápida
 */

const AsistenciaPorCurso = {
  // Inicializar el módulo
  init: function () {
    this.bindEvents();
  },

  // Vincular eventos usando delegación
  bindEvents: function () {
    // Delegación de eventos para botones de asistencia
    document.addEventListener("click", (e) => {
      const button = e.target.closest(
        'button[data-action="marcar-asistencia"]'
      );
      if (button) {
        this.manejarClickAsistencia(button);
        return;
      }

      // Botón marcar todos
      if (e.target.closest(".btn-marcar-todos")) {
        this.mostrarModalMarcarTodos();
        return;
      }

      // Botón guardar asistencia rápida
      if (e.target.closest(".btn-guardar-asistencia-rapida")) {
        this.guardarAsistenciaRapida();
        return;
      }
    });

    // Auto-submit para formularios
    document.addEventListener("change", (e) => {
      if (e.target.classList.contains("auto-submit")) {
        const form = e.target.closest("form");
        if (form) {
          form.submit();
        }
      }
    });
  },

  // Manejar click en botón de asistencia
  manejarClickAsistencia: function (button) {
    const alumnoId = button.dataset.alumnoId;
    const alumnoNombre = button.dataset.alumnoNombre;

    if (window.marcarAsistenciaRapida) {
      window.marcarAsistenciaRapida(alumnoId, alumnoNombre);
    } else {
      console.error("Función marcarAsistenciaRapida no disponible");
    }
  },

  // Mostrar modal para marcar todos
  mostrarModalMarcarTodos: function () {
    if (window.mostrarModalMarcarTodos) {
      window.mostrarModalMarcarTodos();
    } else {
      // Fallback: mostrar modal básico
      const modal = document.getElementById("modalMarcarTodos");
      if (modal) {
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
      }
    }
  },

  // Guardar asistencia rápida
  guardarAsistenciaRapida: function () {
    if (window.guardarAsistenciaRapida) {
      window.guardarAsistenciaRapida();
    } else if (
      window.AsistenciaRapida &&
      window.AsistenciaRapida.guardarAsistenciaRapida
    ) {
      window.AsistenciaRapida.guardarAsistenciaRapida();
    } else {
      console.error("Función guardarAsistenciaRapida no disponible");
    }
  },
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  AsistenciaPorCurso.init();
});

// Exportar módulo
window.AsistenciaPorCurso = AsistenciaPorCurso;
