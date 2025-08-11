/**
 * Módulo para funcionalidades de edición de asistencia
 * Incluye lógica condicional para hora de llegada
 */

const AsistenciaEditModule = {
  // Alternar disponibilidad del campo hora de llegada
  toggleHoraLlegada: function () {
    const estadoSelect = document.getElementById("estado");
    const horaLlegadaInput = document.getElementById("hora_llegada");

    if (!estadoSelect || !horaLlegadaInput) {
      return;
    }

    const estado = estadoSelect.value;

    if (estado === "presente" || estado === "tardanza") {
      horaLlegadaInput.removeAttribute("disabled");
      horaLlegadaInput.setAttribute("required", true);
      horaLlegadaInput.parentElement.classList.remove("d-none");
    } else {
      horaLlegadaInput.setAttribute("disabled", true);
      horaLlegadaInput.removeAttribute("required");
      horaLlegadaInput.value = "";
      horaLlegadaInput.parentElement.classList.add("d-none");
    }
  },

  // Validar formulario antes del envío
  validateForm: function (event) {
    const estado = document.getElementById("estado").value;
    const horaLlegada = document.getElementById("hora_llegada").value;

    if ((estado === "presente" || estado === "tardanza") && !horaLlegada) {
      event.preventDefault();
      this.showError(
        "La hora de llegada es obligatoria para estudiantes presentes o con tardanza"
      );
      return false;
    }

    return true;
  },

  // Mostrar error
  showError: function (message) {
    const alert = document.createElement("div");
    alert.className = "alert alert-danger alert-dismissible fade show";
    alert.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    const container = document.querySelector(".container");
    if (container) {
      container.insertBefore(alert, container.firstChild);

      setTimeout(() => {
        alert.remove();
      }, 5000);
    }
  },

  // Inicializar módulo
  init: function () {
    const estadoSelect = document.getElementById("estado");
    const form = document.querySelector("form");

    if (estadoSelect) {
      // Ejecutar al cargar la página
      this.toggleHoraLlegada();

      // Ejecutar cuando cambie el estado
      estadoSelect.addEventListener("change", () => this.toggleHoraLlegada());
    }

    if (form) {
      form.addEventListener("submit", (e) => this.validateForm(e));
    }
  },
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  AsistenciaEditModule.init();
});

// Exportar para uso global
window.AsistenciaEditModule = AsistenciaEditModule;
