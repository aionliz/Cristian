/**
 * Módulo para validaciones y utilidades de formularios
 * Proporciona validación en tiempo real y formateo automático
 */

const FormularioUtils = {
  // Validar nombre en tiempo real
  validarNombre: function (input) {
    if (!input) return;

    input.addEventListener("input", function () {
      const valor = this.value.trim();

      if (valor.length < 3) {
        this.classList.add("is-invalid");
        this.classList.remove("is-valid");
      } else if (valor.match(/^\d+$/)) {
        this.classList.add("is-invalid");
        this.classList.remove("is-valid");
      } else {
        this.classList.remove("is-invalid");
        this.classList.add("is-valid");
      }
    });
  },

  // Formatear nombre (primera letra en mayúscula)
  formatearNombre: function (input) {
    if (!input) return;

    input.addEventListener("blur", function () {
      const palabras = this.value.split(" ");
      const palabrasFormateadas = palabras.map(
        (palabra) =>
          palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
      );
      this.value = palabrasFormateadas.join(" ");
    });
  },

  // Auto-focus y selección de texto
  autoFocusYSeleccionar: function (input) {
    if (!input) return;

    input.focus();
    input.select();
  },

  // Validar email
  validarEmail: function (input) {
    if (!input) return;

    input.addEventListener("input", function () {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (this.value.trim() === "") {
        this.classList.remove("is-invalid", "is-valid");
      } else if (emailRegex.test(this.value)) {
        this.classList.remove("is-invalid");
        this.classList.add("is-valid");
      } else {
        this.classList.add("is-invalid");
        this.classList.remove("is-valid");
      }
    });
  },

  // Validar teléfono
  validarTelefono: function (input) {
    if (!input) return;

    input.addEventListener("input", function () {
      // Remover caracteres no numéricos excepto + y espacios
      this.value = this.value.replace(/[^\d+\s-]/g, "");

      const valor = this.value.trim();

      if (valor === "") {
        this.classList.remove("is-invalid", "is-valid");
      } else if (valor.length >= 8) {
        this.classList.remove("is-invalid");
        this.classList.add("is-valid");
      } else {
        this.classList.add("is-invalid");
        this.classList.remove("is-valid");
      }
    });
  },

  // Inicializar formulario de asignatura
  initFormularioAsignatura: function () {
    const nombreInput = document.getElementById("nombre");

    if (nombreInput) {
      this.autoFocusYSeleccionar(nombreInput);
      this.validarNombre(nombreInput);
      this.formatearNombre(nombreInput);
    }
  },

  // Inicializar formulario de alumno
  initFormularioAlumno: function () {
    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");
    const telefonoInput = document.getElementById("telefono");

    if (nombreInput) {
      this.validarNombre(nombreInput);
      this.formatearNombre(nombreInput);
    }

    if (emailInput) {
      this.validarEmail(emailInput);
    }

    if (telefonoInput) {
      this.validarTelefono(telefonoInput);
    }
  },

  // Inicializar formulario de profesor
  initFormularioProfesor: function () {
    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");
    const telefonoInput = document.getElementById("telefono");

    if (nombreInput) {
      this.validarNombre(nombreInput);
      this.formatearNombre(nombreInput);
    }

    if (emailInput) {
      this.validarEmail(emailInput);
    }

    if (telefonoInput) {
      this.validarTelefono(telefonoInput);
    }
  },
};

/**
 * Módulo para verificación de asignaciones
 */
const VerificacionAsignacion = {
  // Verificar si la asignación ya existe
  init: function () {
    const asignaturaSelect = document.getElementById("id_asignatura_fk");
    const cursoSelect = document.getElementById("id_curso_fk");

    if (asignaturaSelect && cursoSelect) {
      const verificar = () =>
        this.verificarAsignacion(asignaturaSelect.value, cursoSelect.value);

      asignaturaSelect.addEventListener("change", verificar);
      cursoSelect.addEventListener("change", verificar);
    }
  },

  // Verificar asignación en el servidor
  verificarAsignacion: function (asignaturaId, cursoId) {
    if (asignaturaId && cursoId) {
      fetch(
        `/asignaturas/verificar_asignacion?asignatura_id=${asignaturaId}&curso_id=${cursoId}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.existe) {
            alert("Esta asignación ya existe para el curso seleccionado");
          }
        })
        .catch((error) => {
          console.error("Error verificando asignación:", error);
        });
    }
  },
};

// Auto-inicializar según la página
document.addEventListener("DOMContentLoaded", function () {
  // Formularios de asignatura
  if (
    document.getElementById("nombre") &&
    window.location.pathname.includes("asignatura")
  ) {
    FormularioUtils.initFormularioAsignatura();
  }

  // Formularios de alumno
  if (
    document.getElementById("nombre") &&
    window.location.pathname.includes("alumno")
  ) {
    FormularioUtils.initFormularioAlumno();
  }

  // Formularios de profesor
  if (
    document.getElementById("nombre") &&
    window.location.pathname.includes("profesor")
  ) {
    FormularioUtils.initFormularioProfesor();
  }

  // Verificación de asignaciones
  if (
    document.getElementById("id_asignatura_fk") &&
    document.getElementById("id_curso_fk")
  ) {
    VerificacionAsignacion.init();
  }
});

// Exportar módulos
window.FormularioUtils = FormularioUtils;
window.VerificacionAsignacion = VerificacionAsignacion;
