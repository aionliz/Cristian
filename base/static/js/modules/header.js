/**
 * Módulo para funcionalidades del header
 * Incluye fecha/hora en tiempo real y navegación activa
 */

const HeaderModule = {
  // Actualizar fecha y hora en tiempo real
  actualizarFechaHora: function () {
    const ahora = new Date();
    const opciones = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/Santiago",
    };

    const fechaHora = ahora.toLocaleDateString("es-CL", opciones);
    const elemento = document.getElementById("current-datetime");
    if (elemento) {
      elemento.textContent = fechaHora;
    }
  },

  // Marcar elemento activo en la navegación
  marcarNavegacionActiva: function () {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    navLinks.forEach((link) => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      }
    });
  },

  // Inicializar módulo
  init: function () {
    // Actualizar fecha/hora si el elemento existe
    if (document.getElementById("current-datetime")) {
      this.actualizarFechaHora();
      setInterval(() => this.actualizarFechaHora(), 1000);
    }

    // Marcar navegación activa
    this.marcarNavegacionActiva();
  },
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  HeaderModule.init();
});

// Exportar para uso global
window.HeaderModule = HeaderModule;
