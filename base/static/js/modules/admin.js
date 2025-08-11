/**
 * Módulo para funcionalidades de administración
 * Incluye confirmaciones de eliminación, modales y validaciones
 */

function initAdmin() {
  console.log("🔧 Módulo Admin cargado");

  // Configurar event listeners para data attributes
  configurarBotonesAdmin();
}

/**
 * Configurar botones administrativos con data attributes
 */
function configurarBotonesAdmin() {
  document.addEventListener("click", function (e) {
    const button = e.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    switch (action) {
      case "desactivar":
        const nombre = button.dataset.nombre;
        AdminModule.confirmarEliminacion(id, nombre);
        break;
      case "eliminar":
        const nombreAlumno = button.dataset.nombre;
        AdminModule.confirmarEliminacionAlumno(id, nombreAlumno);
        break;
    }
  });
}

const AdminModule = {
  // Confirmar eliminación de profesor
  confirmarEliminacionProfesor: function (idProfesor, nombreProfesor) {
    const nombreElement = document.getElementById("nombreProfesor");
    const form = document.getElementById("eliminarForm");

    if (nombreElement) {
      nombreElement.textContent = nombreProfesor;
    }

    if (form) {
      // Actualizar la URL del formulario
      const baseUrl = form.action.replace(/\/\d+$/, "");
      form.action = `${baseUrl}/${idProfesor}`;
    }

    // Mostrar modal
    const modal = document.getElementById("eliminarModal");
    if (modal) {
      new bootstrap.Modal(modal).show();
    }
  },

  // Confirmar eliminación de alumno
  confirmarEliminacionAlumno: function (idAlumno, nombreAlumno) {
    const nombreElement = document.getElementById("nombreAlumno");
    const form = document.getElementById("eliminarFormAlumno");

    if (nombreElement) {
      nombreElement.textContent = nombreAlumno;
    }

    if (form) {
      const baseUrl = form.action.replace(/\/\d+$/, "");
      form.action = `${baseUrl}/${idAlumno}`;
    }

    const modal = document.getElementById("eliminarModalAlumno");
    if (modal) {
      new bootstrap.Modal(modal).show();
    }
  },

  // Confirmar eliminación de curso
  confirmarEliminacionCurso: function (idCurso, nombreCurso) {
    const nombreElement = document.getElementById("nombreCurso");
    const form = document.getElementById("eliminarFormCurso");

    if (nombreElement) {
      nombreElement.textContent = nombreCurso;
    }

    if (form) {
      const baseUrl = form.action.replace(/\/\d+$/, "");
      form.action = `${baseUrl}/${idCurso}`;
    }

    const modal = document.getElementById("eliminarModalCurso");
    if (modal) {
      new bootstrap.Modal(modal).show();
    }
  },

  // Confirmar eliminación de asignatura
  confirmarEliminacionAsignatura: function (idAsignatura, nombreAsignatura) {
    const nombreElement = document.getElementById("nombreAsignatura");
    const form = document.getElementById("eliminarFormAsignatura");

    if (nombreElement) {
      nombreElement.textContent = nombreAsignatura;
    }

    if (form) {
      const baseUrl = form.action.replace(/\/\d+$/, "");
      form.action = `${baseUrl}/${idAsignatura}`;
    }

    const modal = document.getElementById("eliminarModalAsignatura");
    if (modal) {
      new bootstrap.Modal(modal).show();
    }
  },

  // Validar formulario genérico
  validateForm: function (formSelector, rules) {
    const form = document.querySelector(formSelector);
    if (!form) return true;

    let isValid = true;
    const errors = [];

    rules.forEach((rule) => {
      const field = form.querySelector(rule.selector);
      if (!field) return;

      const value = field.value.trim();

      if (rule.required && !value) {
        isValid = false;
        errors.push(`${rule.name} es obligatorio`);
        field.classList.add("is-invalid");
      } else if (rule.minLength && value.length < rule.minLength) {
        isValid = false;
        errors.push(
          `${rule.name} debe tener al menos ${rule.minLength} caracteres`
        );
        field.classList.add("is-invalid");
      } else if (rule.email && value && !this.isValidEmail(value)) {
        isValid = false;
        errors.push(`${rule.name} debe ser un email válido`);
        field.classList.add("is-invalid");
      } else {
        field.classList.remove("is-invalid");
      }
    });

    if (!isValid) {
      this.showErrors(errors);
    }

    return isValid;
  },

  // Validar email
  isValidEmail: function (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Mostrar errores
  showErrors: function (errors) {
    const errorHtml = errors.map((error) => `<li>${error}</li>`).join("");
    const alert = document.createElement("div");
    alert.className = "alert alert-danger alert-dismissible fade show";
    alert.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Por favor corrige los siguientes errores:</strong>
            <ul class="mb-0 mt-2">${errorHtml}</ul>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    const container = document.querySelector(".container");
    if (container) {
      container.insertBefore(alert, container.firstChild);

      setTimeout(() => {
        alert.remove();
      }, 8000);
    }
  },

  // Limpiar validaciones
  clearValidation: function (formSelector) {
    const form = document.querySelector(formSelector);
    if (form) {
      const invalidFields = form.querySelectorAll(".is-invalid");
      invalidFields.forEach((field) => field.classList.remove("is-invalid"));
    }
  },

  // Inicializar módulo
  init: function () {
    console.log("AdminModule inicializado");

    // Configurar eventos de formularios si existen
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      form.addEventListener("input", (e) => {
        if (e.target.classList.contains("is-invalid")) {
          e.target.classList.remove("is-invalid");
        }
      });
    });
  },
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  initAdmin();
  AdminModule.init();
});

// Exportar para uso global
window.AdminModule = AdminModule;

// Funciones globales para compatibilidad con plantillas existentes
window.confirmarEliminacion = AdminModule.confirmarEliminacion;
window.confirmarEliminacionProfesor = AdminModule.confirmarEliminacion;
window.confirmarEliminacionAlumno = AdminModule.confirmarEliminacionAlumno;
window.confirmarEliminacionCurso = AdminModule.confirmarEliminacionCurso;
window.confirmarEliminacionAsignatura =
  AdminModule.confirmarEliminacionAsignatura;
