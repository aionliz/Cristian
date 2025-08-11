/**
 * Módulo para gestión de asignaturas
 * Maneja validación de formularios y preview
 */

// Variables globales del módulo
let nombreInput, previewField;

/**
 * Inicialización del módulo de asignaturas
 */
function initAsignaturas() {
  console.log("📚 Módulo Asignaturas cargado");

  // Inicializar elementos del DOM
  nombreInput = document.getElementById("nombre");
  previewField = document.getElementById("preview-nombre");

  // Configurar validación del nombre
  if (nombreInput) {
    configurarValidacionNombre();
  }
}

/**
 * Configurar validación del campo nombre
 */
function configurarValidacionNombre() {
  // Generar código automáticamente mientras se escribe
  nombreInput.addEventListener("input", function () {
    const nombre = this.value.trim();
    const codigo = generarCodigoAsignatura(nombre);

    // Actualizar campo de código si existe
    const codigoField = document.getElementById("codigo");
    if (codigoField) {
      codigoField.value = codigo;
    }

    // Actualizar preview si existe
    if (previewField) {
      previewField.textContent = nombre || "Sin nombre";
    }

    // Validar nombre
    validarNombre(nombre);
  });

  // Validación al perder el foco
  nombreInput.addEventListener("blur", function () {
    const nombre = this.value.trim();
    validarNombreCompleto(nombre);
  });
}

/**
 * Generar código automático para la asignatura
 */
function generarCodigoAsignatura(nombre) {
  if (!nombre) return "";

  // Tomar las primeras letras de cada palabra
  const palabras = nombre.split(" ").filter((palabra) => palabra.length > 0);
  let codigo = "";

  for (let palabra of palabras) {
    // Tomar primera letra de cada palabra, máximo 3 caracteres
    if (codigo.length < 3) {
      codigo += palabra.charAt(0).toUpperCase();
    }
  }

  // Si el código es muy corto, completar con más caracteres
  if (codigo.length < 3 && palabras.length > 0) {
    const primeraPalabra = palabras[0].toUpperCase();
    codigo = primeraPalabra.substring(0, 3);
  }

  return codigo;
}

/**
 * Validar nombre de asignatura
 */
function validarNombre(nombre) {
  const feedback = document.getElementById("nombre-feedback");
  if (!feedback) return;

  if (nombre.length < 3) {
    mostrarError(
      nombreInput,
      feedback,
      "El nombre debe tener al menos 3 caracteres"
    );
    return false;
  }

  if (nombre.length > 100) {
    mostrarError(
      nombreInput,
      feedback,
      "El nombre no puede exceder 100 caracteres"
    );
    return false;
  }

  // Limpiar errores
  limpiarError(nombreInput, feedback);
  return true;
}

/**
 * Validación completa del nombre
 */
function validarNombreCompleto(nombre) {
  if (!validarNombre(nombre)) return false;

  // Aquí se podría agregar validación adicional como verificar duplicados
  // via AJAX si fuera necesario

  return true;
}

/**
 * Mostrar error en campo
 */
function mostrarError(campo, feedback, mensaje) {
  campo.classList.add("is-invalid");
  campo.classList.remove("is-valid");
  feedback.textContent = mensaje;
  feedback.className = "invalid-feedback d-block";
}

/**
 * Limpiar error en campo
 */
function limpiarError(campo, feedback) {
  campo.classList.remove("is-invalid");
  campo.classList.add("is-valid");
  feedback.textContent = "";
  feedback.className = "valid-feedback";
}

/**
 * Validar formulario completo antes del envío
 */
function validarFormulario() {
  const nombre = nombreInput?.value.trim() || "";

  if (!validarNombreCompleto(nombre)) {
    nombreInput?.focus();
    return false;
  }

  return true;
}

// Exportar funciones para uso global
window.AsignaturasModule = {
  init: initAsignaturas,
  validarFormulario: validarFormulario,
  generarCodigo: generarCodigoAsignatura,
};

// Auto-inicialización si el DOM está listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAsignaturas);
} else {
  initAsignaturas();
}
