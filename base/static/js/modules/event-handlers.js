/**
 * Módulo universal para manejo de eventos onclick comunes
 * Reemplaza eventos inline onclick con manejadores modernos
 */

const EventHandlers = {
  // Inicializar manejadores de eventos universales
  init: function () {
    console.log("Inicializando EventHandlers");
    this.bindUniversalEvents();
    this.checkForSuccessMessages();
    this.convertAsistenciaFormToAjax();
    console.log("EventHandlers inicializados completamente");
  },

  // Vincular eventos universales usando delegación
  bindUniversalEvents: function () {
    document.addEventListener("click", (e) => {
      // Manejadores de confirmación
      if (e.target.closest("[data-confirm]")) {
        return this.handleConfirmAction(e);
      }

      // Botones de desactivación/activación
      if (e.target.closest(".btn-confirmar-desactivacion")) {
        return this.confirmarDesactivacion(e);
      }

      // Botones de eliminación
      if (e.target.closest(".btn-confirmar-eliminacion")) {
        return this.confirmarEliminacion(e);
      }

      // Auto-submit de formularios
      if (e.target.closest(".auto-submit-form")) {
        return this.autoSubmitForm(e);
      }

      // Alerts simples
      if (e.target.closest("[data-alert]")) {
        return this.showAlert(e);
      }
    });

    // Manejar envío de formularios de asistencia (fallback si AJAX falla)
    document.addEventListener("submit", (e) => {
      if (
        e.target.id === "form-asistencia" &&
        !e.target.hasAttribute("data-ajax-enabled")
      ) {
        return this.handleAsistenciaFormSubmit(e);
      }
    });
  },

  // Manejar acciones que requieren confirmación
  handleConfirmAction: function (e) {
    const element = e.target.closest("[data-confirm]");
    const message = element.dataset.confirm;

    if (!confirm(message)) {
      e.preventDefault();
      return false;
    }

    return true;
  },

  // Confirmar desactivación (profesores, etc.)
  confirmarDesactivacion: function (e) {
    const element = e.target.closest(".btn-confirmar-desactivacion");

    if (window.confirmarDesactivacion) {
      e.preventDefault();
      window.confirmarDesactivacion();
    } else {
      // Fallback básico
      const confirmed = confirm("¿Está seguro que desea realizar esta acción?");
      if (!confirmed) {
        e.preventDefault();
      }
    }
  },

  // Confirmar eliminación
  confirmarEliminacion: function (e) {
    const element = e.target.closest(".btn-confirmar-eliminacion");
    const itemId = element.dataset.id;
    const itemName = element.dataset.name;

    if (window.confirmarEliminacion) {
      e.preventDefault();
      if (itemId && itemName) {
        window.confirmarEliminacion(itemId, itemName);
      } else {
        window.confirmarEliminacion();
      }
    } else {
      // Fallback básico
      const confirmed = confirm(
        `¿Está seguro que desea eliminar ${itemName || "este elemento"}?`
      );
      if (!confirmed) {
        e.preventDefault();
      }
    }
  },

  // Auto-submit de formularios
  autoSubmitForm: function (e) {
    const form = e.target.closest("form");
    if (form) {
      form.submit();
    }
  },

  // Mostrar alerts simples
  showAlert: function (e) {
    const element = e.target.closest("[data-alert]");
    const message = element.dataset.alert;

    e.preventDefault();
    alert(message);
  },

  // Manejar envío de formulario de asistencia
  handleAsistenciaFormSubmit: function (e) {
    const form = e.target;
    const alumnoInput = form.querySelector("#id_alumno");
    const estadoSelect = form.querySelector("#estado");

    // Validar que se haya seleccionado un alumno
    if (!alumnoInput || !alumnoInput.value) {
      e.preventDefault();
      alert(
        "⚠️ Por favor, seleccione un alumno antes de marcar la asistencia."
      );
      return false;
    }

    // Validar que se haya seleccionado un estado
    if (!estadoSelect || !estadoSelect.value) {
      e.preventDefault();
      alert("⚠️ Por favor, seleccione el estado de asistencia.");
      return false;
    }

    // Obtener el nombre del alumno del campo de búsqueda
    const alumnoSearchInput = form.querySelector("#alumno-search");
    const nombreAlumno = alumnoSearchInput
      ? alumnoSearchInput.value
      : "el alumno seleccionado";
    const estado = estadoSelect.options[estadoSelect.selectedIndex].text;

    // Mostrar confirmación
    // COMENTADO: Deshabilitado para evitar múltiples alertas
    // const confirmMessage = `¿Confirma que desea marcar a ${nombreAlumno} como ${estado.toLowerCase()}?`;
    // if (!confirm(confirmMessage)) {
    //   e.preventDefault();
    //   return false;
    // }

    // Mostrar alerta de éxito (esto se ejecutará antes del submit)
    // COMENTADO: Deshabilitado para evitar múltiples alertas
    // alert("✅ Procesando marcación de asistencia...");

    return true;
  },

  // Funciones auxiliares para casos específicos
  editarEstudiante: function (id) {
    if (window.editarEstudiante) {
      window.editarEstudiante(id);
    } else {
      console.warn("Función editarEstudiante no disponible");
    }
  },

  eliminarAsignacion: function (id) {
    if (window.eliminarAsignacion) {
      window.eliminarAsignacion(id);
    } else {
      console.warn("Función eliminarAsignacion no disponible");
    }
  },

  // Verificar si hay mensajes de éxito en la URL
  checkForSuccessMessages: function () {
    console.log("Verificando mensajes de éxito en URL");
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const message = urlParams.get("message");

    console.log("Parámetros URL:", { success, message });

    if (success === "1" && message) {
      console.log("Mostrando alerta de éxito");

      // Mostrar alerta inmediatamente
      const mensajeDecodificado = decodeURIComponent(message);
      alert("✅ " + mensajeDecodificado);

      // Limpiar los parámetros de la URL sin recargar la página
      const url = new URL(window.location);
      url.searchParams.delete("success");
      url.searchParams.delete("message");
      window.history.replaceState(
        {},
        document.title,
        url.pathname + url.search
      );

      console.log("Alerta mostrada y URL limpiada");
    } else {
      console.log("No hay mensajes de éxito para mostrar");
    }
  },

  // Convertir formulario de asistencia a AJAX para mejor UX
  convertAsistenciaFormToAjax: function () {
    const form = document.getElementById("form-asistencia");
    if (!form) return;

    console.log("Configurando formulario AJAX para asistencia");

    // Marcar el formulario como habilitado para AJAX
    form.setAttribute("data-ajax-enabled", "true");

    // Añadir el event listener con prevención predeterminada
    const originalOnSubmit = form.onsubmit;
    form.onsubmit = null; // Remover cualquier handler previo

    form.addEventListener(
      "submit",
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Formulario enviado via AJAX");

        // Realizar validaciones primero
        const alumnoInput = form.querySelector("#id_alumno");
        const estadoSelect = form.querySelector("#estado");

        // Validar que se haya seleccionado un alumno
        if (!alumnoInput || !alumnoInput.value) {
          alert(
            "⚠️ Por favor, seleccione un alumno antes de marcar la asistencia."
          );
          return false;
        }

        // Validar que se haya seleccionado un estado
        if (!estadoSelect || !estadoSelect.value) {
          alert("⚠️ Por favor, seleccione el estado de asistencia.");
          return false;
        }

        // Obtener confirmación
        const alumnoSearchInput = form.querySelector("#alumno-search");
        const nombreAlumno = alumnoSearchInput
          ? alumnoSearchInput.value
          : "el alumno seleccionado";
        const estado = estadoSelect.options[estadoSelect.selectedIndex].text;
        const confirmMessage = `¿Confirma que desea marcar a ${nombreAlumno} como ${estado.toLowerCase()}?`;

        if (!confirm(confirmMessage)) {
          return false;
        }

        // Preparar datos
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });

        console.log("Datos a enviar:", data);

        // Mostrar indicador de carga
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        submitBtn.disabled = true;

        // Realizar petición AJAX
        fetch(form.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Respuesta del servidor:", data);

            if (data.success) {
              // Mostrar alerta de éxito
              alert("✅ " + data.message);

              // Limpiar formulario
              form.reset();
              document.getElementById("alumno-search").value = "";
              document.getElementById("id_alumno").value = "";

              // Ocultar información del alumno si existe
              const infoAlumno = document.getElementById("info-alumno");
              if (infoAlumno) {
                infoAlumno.classList.add("info-alumno-hidden");
              }
            } else {
              // Mostrar alerta de error
              alert("❌ " + data.message);
            }
          })
          .catch((error) => {
            console.error("Error en petición AJAX:", error);
            alert("❌ Error al procesar la solicitud. Intente nuevamente.");
          })
          .finally(() => {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          });

        return false;
      },
      true
    ); // true para capturar en fase de captura
  },

  // Función de prueba para debug
  testAlert: function (message) {
    console.log("Probando alerta:", message);
    alert(
      "🧪 Test: " + (message || "Función de alerta funcionando correctamente")
    );
  },
};

// Auto-inicializar
document.addEventListener("DOMContentLoaded", function () {
  EventHandlers.init();
});

// También verificar en load para asegurar que se ejecute
window.addEventListener("load", function () {
  console.log("Window load - verificando mensajes nuevamente");
  EventHandlers.checkForSuccessMessages();
});

// Exportar para uso global
window.EventHandlers = EventHandlers;
