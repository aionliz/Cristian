/**
 * Módulo para funcionalidades de detalle de asignatura
 * Manejo de eliminación de asignaciones y confirmaciones
 */

const DetalleAsignatura = {
  // Inicializar el módulo
  init: function () {
    this.bindEvents();
  },

  // Vincular eventos
  bindEvents: function () {
    // Delegación de eventos para eliminar asignaciones
    document.addEventListener("click", (e) => {
      if (e.target.closest(".btn-eliminar-asignacion")) {
        const btn = e.target.closest(".btn-eliminar-asignacion");
        const asignacionId = btn.dataset.id;
        this.eliminarAsignacion(asignacionId);
      }
    });
  },

  // Confirmar eliminación de asignatura principal
  confirmarEliminacion: function () {
    const modal = new bootstrap.Modal(document.getElementById("modalEliminar"));
    modal.show();
  },

  // Eliminar asignación específica
  eliminarAsignacion: function (idAsignacion) {
    if (confirm("¿Estás seguro de que deseas eliminar esta asignación?")) {
      fetch(`/eliminar_asignacion_ajax/${idAsignacion}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Recargar la página para mostrar los cambios
            location.reload();
          } else {
            alert(
              "Error al eliminar la asignación: " +
                (data.message || "Error desconocido")
            );
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error al eliminar la asignación");
        });
    }
  },

  // Mostrar notificación
  mostrarNotificacion: function (mensaje, tipo = "info") {
    const alertClass =
      tipo === "success"
        ? "alert-success"
        : tipo === "error"
        ? "alert-danger"
        : "alert-info";

    const alertHtml = `
      <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;

    const container = document.querySelector(".container");
    if (container) {
      container.insertAdjacentHTML("afterbegin", alertHtml);

      // Auto-remover después de 5 segundos
      setTimeout(() => {
        const alert = container.querySelector(".alert");
        if (alert) {
          alert.remove();
        }
      }, 5000);
    }
  },
};

// Funciones globales para compatibilidad con onclick en HTML
window.confirmarEliminacion = function () {
  DetalleAsignatura.confirmarEliminacion();
};

window.eliminarAsignacion = function (idAsignacion) {
  DetalleAsignatura.eliminarAsignacion(idAsignacion);
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  DetalleAsignatura.init();
});

// Exportar módulo
window.DetalleAsignatura = DetalleAsignatura;
