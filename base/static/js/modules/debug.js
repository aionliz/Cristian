/**
 * Módulo para funciones de debugging y testing
 * Maneja dropdowns de prueba y validaciones de desarrollo
 */

/**
 * Inicialización del módulo de debug
 */
function initDebug() {
  console.log("🐛 Módulo Debug cargado");

  // Configurar dropdowns de test
  configurarDropdownsTest();

  // Configurar funciones de test
  configurarTestFunctions();

  // Configurar debug de asignaturas
  configurarDebugAsignaturas();
}

/**
 * Configurar dropdowns de test
 */
function configurarDropdownsTest() {
  const testAsignaturas = document.getElementById("test-asignaturas");
  const testCursos = document.getElementById("test-cursos");
  const testMultipleAsignaturas = document.getElementById(
    "test-multiple-asignaturas"
  );
  const testMultipleCursos = document.getElementById("test-multiple-cursos");

  // Event listeners para dropdowns simples
  testAsignaturas?.addEventListener("change", function () {
    logTestEvent(
      "Asignatura seleccionada",
      this.value,
      this.options[this.selectedIndex]?.text
    );
  });

  testCursos?.addEventListener("change", function () {
    logTestEvent(
      "Curso seleccionado",
      this.value,
      this.options[this.selectedIndex]?.text
    );
  });

  // Event listeners para dropdowns múltiples
  testMultipleAsignaturas?.addEventListener("change", function () {
    const seleccionados = Array.from(this.selectedOptions).map((option) => ({
      value: option.value,
      text: option.text,
    }));
    logTestEvent("Múltiples asignaturas seleccionadas", seleccionados);
  });

  testMultipleCursos?.addEventListener("change", function () {
    const seleccionados = Array.from(this.selectedOptions).map((option) => ({
      value: option.value,
      text: option.text,
    }));
    logTestEvent("Múltiples cursos seleccionados", seleccionados);
  });
}

/**
 * Configurar funciones de test
 */
function configurarTestFunctions() {
  // Función para probar todos los dropdowns
  window.probarDropdowns = function () {
    const asignatura = document.getElementById("test-asignaturas");
    const curso = document.getElementById("test-cursos");
    const asignaturasMultiple = document.getElementById(
      "test-multiple-asignaturas"
    );
    const cursosMultiple = document.getElementById("test-multiple-cursos");

    const results = document.getElementById("test-results");
    if (!results) return;

    let html = "<h5>Resultados de la Prueba:</h5>";
    html += '<ul class="list-group">';

    if (asignatura) {
      html += `<li class="list-group-item">Asignatura: ${asignatura.value} - ${
        asignatura.options[asignatura.selectedIndex]?.text || "N/A"
      }</li>`;
    }

    if (curso) {
      html += `<li class="list-group-item">Curso: ${curso.value} - ${
        curso.options[curso.selectedIndex]?.text || "N/A"
      }</li>`;
    }

    if (asignaturasMultiple) {
      const seleccionadas = Array.from(asignaturasMultiple.selectedOptions)
        .map((opt) => opt.text)
        .join(", ");
      html += `<li class="list-group-item">Asignaturas múltiples: ${
        seleccionadas || "Ninguna"
      }</li>`;
    }

    if (cursosMultiple) {
      const seleccionados = Array.from(cursosMultiple.selectedOptions)
        .map((opt) => opt.text)
        .join(", ");
      html += `<li class="list-group-item">Cursos múltiples: ${
        seleccionados || "Ninguno"
      }</li>`;
    }

    html += "</ul>";
    results.innerHTML = html;
  };
}

/**
 * Configurar debug específico para asignaturas
 */
function configurarDebugAsignaturas() {
  const asignaturaSelect = document.getElementById("asignatura_id");
  if (!asignaturaSelect) return;

  asignaturaSelect.addEventListener("change", function () {
    const asignaturaId = this.value;
    console.log("🔍 Debug: Asignatura seleccionada:", asignaturaId);

    if (asignaturaId) {
      // Aquí se podría cargar información adicional vía AJAX
      debugAsignaturaInfo(asignaturaId);
    }
  });
}

/**
 * Mostrar información de debug para una asignatura
 */
function debugAsignaturaInfo(asignaturaId) {
  console.group("📚 Debug Asignatura");
  console.log("ID:", asignaturaId);
  console.log("Timestamp:", new Date().toISOString());

  // Verificar si existen elementos relacionados
  const cursosRelacionados = document.querySelectorAll(
    `[data-asignatura="${asignaturaId}"]`
  );
  console.log("Cursos relacionados encontrados:", cursosRelacionados.length);

  // Log de elementos del DOM relacionados
  const elementosRelacionados = {
    dropdown: document.getElementById("asignatura_id"),
    form: document.querySelector("form"),
    submit: document.querySelector('button[type="submit"]'),
  };

  console.table(elementosRelacionados);
  console.groupEnd();
}

/**
 * Log para eventos de test
 */
function logTestEvent(tipo, valor, texto = null) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`🧪 [${timestamp}] ${tipo}:`, {
    valor: valor,
    texto: texto,
  });

  // Mostrar en interfaz si existe elemento de log
  const logElement = document.getElementById("test-log");
  if (logElement) {
    const logEntry = document.createElement("div");
    logEntry.className = "alert alert-info alert-sm mb-1";
    logEntry.innerHTML = `<small><strong>${timestamp}</strong> - ${tipo}: ${JSON.stringify(
      valor
    )}</small>`;
    logElement.prepend(logEntry);

    // Mantener solo las últimas 10 entradas
    const entries = logElement.children;
    if (entries.length > 10) {
      logElement.removeChild(entries[entries.length - 1]);
    }
  }
}

/**
 * Limpiar log de test
 */
function limpiarLogTest() {
  const logElement = document.getElementById("test-log");
  if (logElement) {
    logElement.innerHTML = "";
  }
  console.clear();
}

/**
 * Exportar información de debug
 */
function exportarDebugInfo() {
  const info = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    dropdowns: {},
  };

  // Recopilar información de todos los dropdowns
  const selects = document.querySelectorAll("select");
  selects.forEach((select) => {
    if (select.id) {
      info.dropdowns[select.id] = {
        value: select.value,
        options: Array.from(select.options).map((opt) => ({
          value: opt.value,
          text: opt.text,
          selected: opt.selected,
        })),
      };
    }
  });

  console.log("📋 Debug Info Export:", info);

  // Copiar al clipboard si es posible
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(JSON.stringify(info, null, 2))
      .then(() => console.log("✅ Debug info copiado al clipboard"))
      .catch((err) => console.error("❌ Error al copiar:", err));
  }

  return info;
}

// Exportar funciones para uso global
window.DebugModule = {
  init: initDebug,
  probarDropdowns: function () {
    window.probarDropdowns();
  },
  limpiarLog: limpiarLogTest,
  exportarInfo: exportarDebugInfo,
};

// Auto-inicialización si el DOM está listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDebug);
} else {
  initDebug();
}
