/**
 * Módulo universal para manejo de eventos onclick comunes
 * Reemplaza eventos inline onclick con manejadores modernos
 */

const EventHandlers = {
  // Inicializar manejadores de eventos universales
  init: function () {
    this.bindUniversalEvents();
  },

  // Vincular eventos universales usando delegación
  bindUniversalEvents: function () {
    document.addEventListener("click", (e) => {
      // Manejadores de confirmación
      if (e.target.closest("[data-confirm]")) {
        return this.handleConfirmAction(e);
      }

      // Botones de desactivación/activación
      if (e.target.closest(".btn-confirmar-desactivacion")) {
        return this.confirmarDesactivacion(e);
      }

      // Botones de eliminación
      if (e.target.closest(".btn-confirmar-eliminacion")) {
        return this.confirmarEliminacion(e);
      }

      // Auto-submit de formularios
      if (e.target.closest(".auto-submit-form")) {
        return this.autoSubmitForm(e);
      }

      // Alerts simples
      if (e.target.closest("[data-alert]")) {
        return this.showAlert(e);
      }
    });
  },

  // Manejar acciones que requieren confirmación
  handleConfirmAction: function (e) {
    const element = e.target.closest("[data-confirm]");
    const message = element.dataset.confirm;

    if (!confirm(message)) {
      e.preventDefault();
      return false;
    }

    return true;
  },

  // Confirmar desactivación (profesores, etc.)
  confirmarDesactivacion: function (e) {
    const element = e.target.closest(".btn-confirmar-desactivacion");

    if (window.confirmarDesactivacion) {
      e.preventDefault();
      window.confirmarDesactivacion();
    } else {
      // Fallback básico
      const confirmed = confirm("¿Está seguro que desea realizar esta acción?");
      if (!confirmed) {
        e.preventDefault();
      }
    }
  },

  // Confirmar eliminación
  confirmarEliminacion: function (e) {
    const element = e.target.closest(".btn-confirmar-eliminacion");
    const itemId = element.dataset.id;
    const itemName = element.dataset.name;

    if (window.confirmarEliminacion) {
      e.preventDefault();
      if (itemId && itemName) {
        window.confirmarEliminacion(itemId, itemName);
      } else {
        window.confirmarEliminacion();
      }
    } else {
      // Fallback básico
      const confirmed = confirm(
        `¿Está seguro que desea eliminar ${itemName || "este elemento"}?`
      );
      if (!confirmed) {
        e.preventDefault();
      }
    }
  },

  // Auto-submit de formularios
  autoSubmitForm: function (e) {
    const form = e.target.closest("form");
    if (form) {
      form.submit();
    }
  },

  // Mostrar alerts simples
  showAlert: function (e) {
    const element = e.target.closest("[data-alert]");
    const message = element.dataset.alert;

    e.preventDefault();
    alert(message);
  },

  // Funciones auxiliares para casos específicos
  editarEstudiante: function (id) {
    if (window.editarEstudiante) {
      window.editarEstudiante(id);
    } else {
      console.warn("Función editarEstudiante no disponible");
    }
  },

  eliminarAsignacion: function (id) {
    if (window.eliminarAsignacion) {
      window.eliminarAsignacion(id);
    } else {
      console.warn("Función eliminarAsignacion no disponible");
    }
  },
};

// Auto-inicializar
document.addEventListener("DOMContentLoaded", function () {
  EventHandlers.init();
});

// Exportar para uso global
window.EventHandlers = EventHandlers;
