/**
 * Módulo para funcionalidades de login/autenticación
 * Incluye validación y auto-focus
 */

const LoginModule = {
  // Validar email
  isValidEmail: function (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Mostrar error
  showError: function (message) {
    // Crear alerta de Bootstrap
    const alert = document.createElement("div");
    alert.className = "alert alert-danger alert-dismissible fade show";
    alert.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    // Insertar al inicio del formulario
    const form = document.querySelector("form");
    if (form) {
      form.insertBefore(alert, form.firstChild);

      // Auto-dismiss después de 5 segundos
      setTimeout(() => {
        alert.remove();
      }, 5000);
    }
  },

  // Validar formulario
  validateForm: function (event) {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!this.isValidEmail(email)) {
      event.preventDefault();
      this.showError("Por favor ingrese un email válido");
      return false;
    }

    if (password.length < 6) {
      event.preventDefault();
      this.showError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    return true;
  },

  // Inicializar módulo
  init: function () {
    // Auto-focus en el campo email
    const emailField = document.getElementById("email");
    if (emailField) {
      emailField.focus();
    }

    // Validación del formulario
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", (e) => this.validateForm(e));
    }
  },
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  LoginModule.init();
});

// Exportar para uso global
window.LoginModule = LoginModule;
