/**
 * Módulo para gestión de profesores
 * Maneja formularios, preview, validaciones y funcionalidades específicas
 */

// Variables globales del módulo
let form, preview, previewCard;

/**
 * Inicialización del módulo de profesores
 */
function initProfesores() {
  console.log("👨‍🏫 Módulo Profesores cargado");

  // Inicializar elementos del DOM
  form = document.querySelector("form");
  preview = document.getElementById("preview");
  previewCard = document.getElementById("preview-card");

  // Configurar funcionalidades específicas
  setupValidacionEmail();
  setupConfirmacionDesactivacion();

  // Configurar preview en tiempo real
  if (form && preview) {
    configurarPreview();
  }

  // Configurar validación de email
  configurarValidacionEmail();

  // Configurar modal de desactivación
  configurarModalDesactivacion();
}

/**
 * Configurar preview en tiempo real del formulario
 */
function configurarPreview() {
  const campos = [
    "nombre",
    "apellido",
    "email",
    "especialidad",
    "id_asignatura_fk",
    "activo",
  ];

  campos.forEach((campo) => {
    const elemento = document.getElementById(campo);
    if (elemento) {
      elemento.addEventListener("input", actualizarPreview);
      elemento.addEventListener("change", actualizarPreview);
    }
  });

  // Actualizar preview inicial
  actualizarPreview();
}

/**
 * Actualizar el preview del profesor
 */
function actualizarPreview() {
  if (!preview) return;

  // Obtener valores de los campos
  const nombre = document.getElementById("nombre")?.value || "";
  const apellido = document.getElementById("apellido")?.value || "";
  const email = document.getElementById("email")?.value || "";
  const especialidad = document.getElementById("especialidad")?.value || "";
  const asignaturaSelect = document.getElementById("id_asignatura_fk");
  const activo = document.getElementById("activo")?.value;

  // Actualizar nombre completo
  const nombreCompleto = `${nombre} ${apellido}`.trim();
  const previewNombre = document.getElementById("preview-nombre");
  if (previewNombre) {
    previewNombre.textContent = nombreCompleto || "-";
  }

  // Actualizar email
  const previewEmail = document.getElementById("preview-email");
  if (previewEmail) {
    previewEmail.textContent = email || "-";
  }

  // Actualizar especialidad
  const previewEspecialidad = document.getElementById("preview-especialidad");
  if (previewEspecialidad) {
    previewEspecialidad.textContent = especialidad || "Sin especialidad";
  }

  // Actualizar asignatura
  const previewAsignatura = document.getElementById("preview-asignatura");
  if (previewAsignatura && asignaturaSelect) {
    const asignaturaText =
      asignaturaSelect.options[asignaturaSelect.selectedIndex]?.text || "";
    previewAsignatura.textContent =
      asignaturaText === "Seleccionar asignatura..."
        ? "Sin asignatura"
        : asignaturaText;
  }

  // Actualizar estado
  const estadoBadge = document.getElementById("preview-estado");
  if (estadoBadge) {
    if (activo === "1") {
      estadoBadge.textContent = "Activo";
      estadoBadge.className = "badge bg-success";
    } else {
      estadoBadge.textContent = "Inactivo";
      estadoBadge.className = "badge bg-danger";
    }
  }

  // Mostrar/ocultar preview
  if (previewCard) {
    const tieneContenido = nombreCompleto || email || especialidad;
    previewCard.style.display = tieneContenido ? "block" : "none";
  }
}

/**
 * Configurar validación de email
 */
function configurarValidacionEmail() {
  const emailField = document.getElementById("email");
  if (!emailField) return;

  emailField.addEventListener("blur", function () {
    const email = this.value.trim();
    validarEmail(email);
  });
}

/**
 * Validar formato de email
 */
function validarEmail(email) {
  const emailField = document.getElementById("email");
  if (!emailField) return;

  // Limpiar feedback anterior
  const feedbackExistente =
    emailField.parentNode.querySelector(".invalid-feedback");
  if (feedbackExistente) {
    feedbackExistente.remove();
  }

  if (email && !esEmailValido(email)) {
    emailField.classList.add("is-invalid");
    emailField.classList.remove("is-valid");

    const feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    feedback.textContent = "Por favor, ingresa un email válido";
    emailField.parentNode.appendChild(feedback);

    return false;
  } else if (email) {
    emailField.classList.remove("is-invalid");
    emailField.classList.add("is-valid");
    return true;
  }

  return true;
}

/**
 * Verificar si un email es válido
 */
function esEmailValido(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Configurar modal de desactivación
 */
function configurarModalDesactivacion() {
  // Esta función se ejecuta cuando se hace clic en el botón de desactivar
  window.mostrarModalDesactivar = function () {
    const modal = new bootstrap.Modal(
      document.getElementById("desactivarModal")
    );
    modal.show();
  };
}

/**
 * Validar formulario completo antes del envío
 */
function validarFormularioProfesor() {
  let esValido = true;

  // Validar nombre
  const nombre = document.getElementById("nombre")?.value.trim();
  if (!nombre) {
    mostrarErrorCampo("nombre", "El nombre es obligatorio");
    esValido = false;
  }

  // Validar apellido
  const apellido = document.getElementById("apellido")?.value.trim();
  if (!apellido) {
    mostrarErrorCampo("apellido", "El apellido es obligatorio");
    esValido = false;
  }

  // Validar email
  const email = document.getElementById("email")?.value.trim();
  if (!email) {
    mostrarErrorCampo("email", "El email es obligatorio");
    esValido = false;
  } else if (!esEmailValido(email)) {
    mostrarErrorCampo("email", "El formato del email no es válido");
    esValido = false;
  }

  return esValido;
}

/**
 * Mostrar error en campo específico
 */
function mostrarErrorCampo(campoId, mensaje) {
  const campo = document.getElementById(campoId);
  if (!campo) return;

  campo.classList.add("is-invalid");

  // Crear o actualizar feedback
  let feedback = campo.parentNode.querySelector(".invalid-feedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    campo.parentNode.appendChild(feedback);
  }
  feedback.textContent = mensaje;
}

// Exportar funciones para uso global
window.ProfesoresModule = {
  init: initProfesores,
  actualizarPreview: actualizarPreview,
  validarFormulario: validarFormularioProfesor,
  mostrarModalDesactivar: function () {
    const modal = new bootstrap.Modal(
      document.getElementById("desactivarModal")
    );
    modal.show();
  },
};

/**
 * Configurar validación de email en tiempo real
 */
function setupValidacionEmail() {
  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.addEventListener("blur", function () {
      const email = this.value;
      if (email && !email.includes("@")) {
        this.classList.add("is-invalid");
        if (
          !this.nextElementSibling ||
          !this.nextElementSibling.classList.contains("invalid-feedback")
        ) {
          const feedback = document.createElement("div");
          feedback.className = "invalid-feedback";
          feedback.textContent = "El email debe tener un formato válido";
          this.insertAdjacentElement("afterend", feedback);
        }
      } else {
        this.classList.remove("is-invalid");
        const feedback = this.nextElementSibling;
        if (feedback && feedback.classList.contains("invalid-feedback")) {
          feedback.remove();
        }
      }
    });
  }
}

/**
 * Configurar confirmación de desactivación
 */
function setupConfirmacionDesactivacion() {
  // La función global ya está disponible a través del objeto ProfesorModule
}

/**
 * Función global para confirmar desactivación (compatibilidad con onclick)
 */
window.confirmarDesactivacion = function () {
  new bootstrap.Modal(document.getElementById("desactivarModal")).show();
};

// Auto-inicialización si el DOM está listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    initProfesores();

    // Debug info
    setTimeout(function () {
      console.log(
        "🔍 Template cargado - funciones de debug disponibles: profesorFormDebug(), profesorFormUpdate()"
      );
    }, 500);
  });
} else {
  initProfesores();

  // Debug info
  setTimeout(function () {
    console.log(
      "🔍 Template cargado - funciones de debug disponibles: profesorFormDebug(), profesorFormUpdate()"
    );
  }, 500);
}
