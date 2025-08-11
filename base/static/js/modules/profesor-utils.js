/**
 * Módulo para funcionalidades específicas de profesores
 * Manejo de formularios y asignaciones de profesores
 */

const ProfesorUtils = {
  // Variables del módulo
  asignaturasSelect: null,
  cursosSelect: null,
  asignaturasStatus: null,
  cursosStatus: null,

  // Inicializar módulo
  init: function () {
    console.log("🎓 Inicializando módulo de formulario de profesor");
    this.setupElements();
  },

  // Configurar elementos
  setupElements: function () {
    console.log("📝 Configurando elementos del formulario");

    this.asignaturasSelect = document.getElementById("asignaturas_agregar");
    this.cursosSelect = document.getElementById("cursos_agregar");
    this.asignaturasStatus = document.getElementById("asignaturas-status");
    this.cursosStatus = document.getElementById("cursos-status");

    if (this.asignaturasSelect && this.cursosSelect) {
      this.setupEventListeners();
      this.updateStatus();
      console.log("✅ Formulario de profesor configurado correctamente");
    } else {
      console.log("⚠️ No se encontraron los elementos de asignaciones");
    }
  },

  // Configurar event listeners
  setupEventListeners: function () {
    console.log("🔧 Configurando event listeners");

    // Event listeners para asignaturas
    if (this.asignaturasSelect) {
      this.asignaturasSelect.addEventListener("change", (e) => {
        console.log("📚 Cambio en asignaturas");
        e.stopPropagation();
        this.updateStatus();
      });

      this.asignaturasSelect.addEventListener("focus", () => {
        console.log("📚 Focus en asignaturas");
      });
    }

    // Event listeners para cursos
    if (this.cursosSelect) {
      this.cursosSelect.addEventListener("change", (e) => {
        console.log("🎓 Cambio en cursos");
        e.stopPropagation();
        this.updateStatus();
      });

      this.cursosSelect.addEventListener("focus", () => {
        console.log("🎓 Focus en cursos");
      });
    }
  },

  // Actualizar estado de las selecciones
  updateStatus: function () {
    console.log("🔄 Actualizando estado de selecciones");
    this.updateAsignaturasStatus();
    this.updateCursosStatus();
  },

  // Actualizar estado de asignaturas
  updateAsignaturasStatus: function () {
    if (!this.asignaturasSelect || !this.asignaturasStatus) return;

    const selected = Array.from(this.asignaturasSelect.selectedOptions);
    console.log(
      `📚 Asignaturas seleccionadas: ${selected.length}`,
      selected.map((opt) => opt.text)
    );

    if (selected.length > 0) {
      const nombres = selected.map((opt) => opt.text);
      this.asignaturasStatus.innerHTML = `
        <small class="text-success">
          <i class="fas fa-check-circle"></i> 
          <strong>Seleccionadas (${selected.length}):</strong> ${nombres.join(
        ", "
      )}
        </small>
      `;
    } else {
      this.asignaturasStatus.innerHTML =
        '<small class="text-muted">Ninguna asignatura seleccionada</small>';
    }
  },

  // Actualizar estado de cursos
  updateCursosStatus: function () {
    if (!this.cursosSelect || !this.cursosStatus) return;

    const selected = Array.from(this.cursosSelect.selectedOptions);
    console.log(
      `🎓 Cursos seleccionados: ${selected.length}`,
      selected.map((opt) => opt.text)
    );

    if (selected.length > 0) {
      const nombres = selected.map((opt) => opt.text);
      this.cursosStatus.innerHTML = `
        <small class="text-success">
          <i class="fas fa-check-circle"></i> 
          <strong>Seleccionados (${selected.length}):</strong> ${nombres.join(
        ", "
      )}
        </small>
      `;
    } else {
      this.cursosStatus.innerHTML =
        '<small class="text-muted">Ningún curso seleccionado</small>';
    }
  },

  // Función para debugging
  debug: function () {
    console.log("=== ESTADO DEL FORMULARIO DE PROFESOR ===");
    console.log("Asignaturas select:", this.asignaturasSelect);
    console.log("Cursos select:", this.cursosSelect);
    console.log(
      "Asignaturas seleccionadas:",
      this.asignaturasSelect
        ? Array.from(this.asignaturasSelect.selectedOptions).map(
            (opt) => opt.text
          )
        : "N/A"
    );
    console.log(
      "Cursos seleccionados:",
      this.cursosSelect
        ? Array.from(this.cursosSelect.selectedOptions).map((opt) => opt.text)
        : "N/A"
    );
  },
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  // Solo inicializar si estamos en una página de profesor con los elementos necesarios
  if (
    window.location.pathname.includes("profesor") &&
    (document.getElementById("asignaturas_agregar") ||
      document.getElementById("cursos_agregar"))
  ) {
    ProfesorUtils.init();
  }
});

// Funciones globales para compatibilidad
window.profesorFormDebug = function () {
  ProfesorUtils.debug();
};

window.profesorFormUpdate = function () {
  ProfesorUtils.updateStatus();
};

// Exportar módulo
window.ProfesorUtils = ProfesorUtils;
