/**
 * Módulo para el manejo de asistencia rápida
 * Funcionalidades para marcar asistencia desde el listado de alumnos
 */

const AsistenciaRapida = {
  // Configuración inicial
  config: {
    profesorId: null,
    urls: {
      marcarAsistencia: null,
    },
  },

  // Inicializar configuración
  init: function (config = null) {
    // Leer configuración desde atributos de datos si no se proporciona configuración
    if (!config) {
      config = this.readConfigFromDOM();
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.bindEvents();
  },

  // Leer configuración desde atributos de datos del DOM
  readConfigFromDOM: function () {
    const container = document.querySelector(
      "[data-profesor-id], [data-asistencia-url]"
    );

    if (!container) {
      return null;
    }

    const config = {};

    // Leer profesor ID
    const profesorId = container.getAttribute("data-profesor-id");
    if (profesorId) {
      config.profesorId = parseInt(profesorId);
    }

    // Leer URLs
    const asistenciaUrl = container.getAttribute("data-asistencia-url");
    if (asistenciaUrl) {
      config.urls = {
        marcarAsistencia: asistenciaUrl,
      };
    }

    return config;
  },

  // Vincular eventos
  bindEvents: function () {
    // Eventos para botones de marcar asistencia
    document.addEventListener("click", (e) => {
      if (e.target.closest(".btn-marcar-asistencia")) {
        const btn = e.target.closest(".btn-marcar-asistencia");
        const idAlumno = btn.dataset.idAlumno;
        const nombreAlumno = btn.dataset.nombreAlumno;
        this.marcarAsistenciaRapida(idAlumno, nombreAlumno);
      }

      // Evento para guardar asistencia
      if (e.target.closest(".btn-guardar-asistencia")) {
        this.guardarAsistenciaRapida();
      }
    });
  },

  // Marcar asistencia rápida - abrir modal
  marcarAsistenciaRapida: function (idAlumno, nombreAlumno) {
    document.getElementById("rapid_id_alumno").value = idAlumno;
    document.getElementById("rapid_nombre_alumno").textContent = nombreAlumno;

    // Limpiar formulario
    document.getElementById("rapid_estado").value = "presente";
    document.getElementById("rapid_hora_llegada").value = "";
    document.getElementById("rapid_observaciones").value = "";

    // Mostrar modal
    const modal = new bootstrap.Modal(
      document.getElementById("modalAsistenciaRapida")
    );
    modal.show();
  },

  // Guardar asistencia rápida
  guardarAsistenciaRapida: function () {
    const form = document.getElementById("formAsistenciaRapida");
    const formData = new FormData(form);

    // Convertir a JSON
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Agregar profesor (opcional, desde la configuración)
    data.id_profesor = this.config.profesorId;

    fetch(this.config.urls.marcarAsistencia, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Mostrar mensaje de éxito
          this.showNotification("Asistencia marcada correctamente", "success");

          // Cerrar modal
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("modalAsistenciaRapida")
          );
          modal.hide();

          // Recargar página o actualizar tabla si fuera necesario
          // location.reload();
        } else {
          this.showNotification(
            data.message || "Error al marcar asistencia",
            "error"
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        this.showNotification("Error al marcar asistencia", "error");
      });
  },

  // Mostrar notificación
  showNotification: function (message, type) {
    const alertClass = type === "success" ? "alert-success" : "alert-danger";
    const alertHtml = `
      <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;

    // Agregar al top de la página
    const container = document.querySelector(".container");
    if (container) {
      container.insertAdjacentHTML("afterbegin", alertHtml);

      // Auto-remover después de 5 segundos
      setTimeout(() => {
        const alert = container.querySelector(".alert");
        if (alert) {
          alert.remove();
        }
      }, 5000);
    }
  },
};

// Funciones globales para compatibilidad con onclick en HTML
window.marcarAsistenciaRapida = function (idAlumno, nombreAlumno) {
  AsistenciaRapida.marcarAsistenciaRapida(idAlumno, nombreAlumno);
};

window.guardarAsistenciaRapida = function () {
  AsistenciaRapida.guardarAsistenciaRapida();
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  // Solo inicializar si estamos en una página con elementos de asistencia rápida
  if (
    document.querySelector("[data-profesor-id], [data-asistencia-url]") ||
    document.getElementById("modalAsistenciaRapida")
  ) {
    AsistenciaRapida.init();
  }
});

window.showNotification = function (message, type) {
  AsistenciaRapida.showNotification(message, type);
};

// Exportar módulo
window.AsistenciaRapida = AsistenciaRapida;
