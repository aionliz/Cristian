/**
 * Funciones globales para el Sistema de Asistencia
 * Estas funciones actúan como bridge/wrapper para las funciones de los módulos
 */

// ========================================
// FUNCIONES GLOBALES - WRAPPERS
// ========================================

// Funciones del sistema base
function detectarDispositivos() {
  if (typeof BaseSystem !== "undefined" && BaseSystem.detectarDispositivos) {
    BaseSystem.detectarDispositivos();
  } else {
    console.error("BaseSystem.detectarDispositivos no está disponible");
    alert("Función de detectar dispositivos no disponible");
  }
}

function mostrarInfoSesion() {
  if (typeof BaseSystem !== "undefined" && BaseSystem.mostrarInfoSesion) {
    BaseSystem.mostrarInfoSesion();
  } else {
    // Función básica de información de sesión
    const info = `
Información de Sesión:
- Usuario: ${window.session?.user_email || "No disponible"}
- Rol: ${window.session?.user_role || "No disponible"}
- URL actual: ${window.location.href}
- Navegador: ${navigator.userAgent}
        `;
    alert(info);
  }
}

// ========================================
// GESTIÓN DE ALUMNOS
// ========================================

function editarAlumno(id) {
  // Redirigir directamente a la página de edición
  window.location.href = `/admin/editar-alumno/${id}`;
}

function eliminarAlumno(id) {
  if (typeof StudentManager !== "undefined" && StudentManager.eliminarAlumno) {
    StudentManager.eliminarAlumno(id);
  } else {
    if (confirm("¿Está seguro de que desea eliminar este alumno?")) {
      // Fallback usando fetch directamente
      fetch(`/admin/alumnos/${id}/eliminar`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Alumno eliminado exitosamente");
            location.reload();
          } else {
            alert("Error al eliminar alumno: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error al eliminar alumno");
        });
    }
  }
}

function verDetalles(id) {
  if (typeof StudentManager !== "undefined" && StudentManager.verDetalles) {
    StudentManager.verDetalles(id);
  } else {
    // Redirigir a página de detalles del alumno
    window.location.href = `/admin/alumnos/${id}/detalle`;
  }
}

function guardarAlumno() {
  if (typeof StudentManager !== "undefined" && StudentManager.guardarAlumno) {
    StudentManager.guardarAlumno();
  } else {
    // Fallback - enviar formulario si existe
    const form = document.getElementById("form-alumno");
    if (form) {
      form.submit();
    } else {
      alert("Formulario de alumno no encontrado");
    }
  }
}

function limpiarFormulario() {
  if (
    typeof StudentManager !== "undefined" &&
    StudentManager.limpiarFormulario
  ) {
    StudentManager.limpiarFormulario();
  } else {
    // Fallback - limpiar formulario básico
    const form = document.getElementById("form-alumno");
    if (form) {
      form.reset();
    }
    const alumnoId = document.getElementById("alumno-id");
    if (alumnoId) alumnoId.value = "";

    const modalTitle = document.getElementById("modal-title");
    if (modalTitle) modalTitle.textContent = "Nuevo Alumno";

    if (typeof Utils !== "undefined") {
      Utils.showSuccess("Formulario limpiado");
    }
  }
}

// ========================================
// GESTIÓN DE CURSOS
// ========================================

function editarCurso(id) {
  fetch(`/admin/cursos/${id}/editar`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Llenar formulario con datos del curso
        const curso = data.curso;
        const fields = ["curso-id", "nombre_curso", "nivel", "seccion", "anio"];

        fields.forEach((field) => {
          const element = document.getElementById(field);
          if (element && curso[field.replace("-", "_")] !== undefined) {
            element.value = curso[field.replace("-", "_")] || "";
          }
        });

        // Cambiar título del modal
        const modalTitle = document.getElementById("modal-title-curso");
        if (modalTitle) modalTitle.textContent = "Editar Curso";

        // Mostrar modal
        const modal = new bootstrap.Modal(
          document.getElementById("modal-curso")
        );
        modal.show();
      } else {
        alert("Error al cargar datos del curso: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al cargar datos del curso");
    });
}

function eliminarCurso(id) {
  if (
    confirm(
      "¿Está seguro de que desea eliminar este curso? Esta acción no se puede deshacer."
    )
  ) {
    fetch(`/admin/cursos/${id}/eliminar`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Curso eliminado exitosamente");
          location.reload();
        } else {
          alert("Error al eliminar curso: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error al eliminar curso");
      });
  }
}

function guardarCurso() {
  const form = document.getElementById("form-curso");
  if (!form) {
    alert("Formulario de curso no encontrado");
    return;
  }

  const formData = new FormData(form);

  // Validaciones básicas
  if (!formData.get("nombre_curso") || !formData.get("nivel")) {
    alert("Por favor complete todos los campos obligatorios");
    return;
  }

  const cursoId = formData.get("id_curso");
  const url = cursoId
    ? `/admin/cursos/${cursoId}/editar`
    : "/admin/cursos/crear";

  fetch(url, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(data.message || "Curso guardado exitosamente");

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("modal-curso")
        );
        if (modal) modal.hide();

        location.reload();
      } else {
        alert("Error: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al guardar el curso");
    });
}

function limpiarFormularioCurso() {
  const form = document.getElementById("form-curso");
  if (form) {
    form.reset();
  }

  const cursoId = document.getElementById("curso-id");
  if (cursoId) cursoId.value = "";

  const modalTitle = document.getElementById("modal-title-curso");
  if (modalTitle) modalTitle.textContent = "Nuevo Curso";

  if (typeof Utils !== "undefined") {
    Utils.showSuccess("Formulario de curso limpiado");
  }
}

// ========================================
// FUNCIONES DE ASISTENCIA
// ========================================

function marcarAsistenciaRapida(idAlumno, nombreAlumno) {
  // Llenar datos en el modal
  const rapidIdAlumno = document.getElementById("rapid_id_alumno");
  const rapidNombreAlumno = document.getElementById("rapid_nombre_alumno");
  const rapidHoraLlegada = document.getElementById("rapid_hora_llegada");

  if (rapidIdAlumno) rapidIdAlumno.value = idAlumno;
  if (rapidNombreAlumno) rapidNombreAlumno.textContent = nombreAlumno;

  // Establecer hora actual
  const now = new Date();
  const timeString =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");
  if (rapidHoraLlegada) rapidHoraLlegada.value = timeString;

  // Mostrar modal
  const modal = new bootstrap.Modal(
    document.getElementById("modalAsistenciaRapida")
  );
  modal.show();
}

function guardarAsistenciaRapida() {
  const form = document.getElementById("formAsistenciaRapida");
  if (!form) {
    alert("Formulario de asistencia no encontrado");
    return;
  }

  const formData = new FormData(form);

  fetch("/asistencia/marcar", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("modalAsistenciaRapida")
      );
      if (modal) modal.hide();

      if (data.success) {
        alert("Asistencia marcada correctamente");
        location.reload();
      } else {
        alert("Error al marcar asistencia: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al marcar asistencia");
    });
}

function mostrarModalMarcarTodos() {
  alert("Funcionalidad en desarrollo: Marcar asistencia para todo el curso");
}

// ========================================
// FUNCIONES BIOMÉTRICAS
// ========================================

function registerFingerprint(studentId, studentName) {
  if (
    typeof BiometricAdmin !== "undefined" &&
    BiometricAdmin.registerFingerprint
  ) {
    BiometricAdmin.registerFingerprint(studentId, studentName);
  } else {
    alert("Sistema biométrico no disponible en esta página");
  }
}

function updateFingerprint(studentId, studentName) {
  if (
    typeof BiometricAdmin !== "undefined" &&
    BiometricAdmin.updateFingerprint
  ) {
    BiometricAdmin.updateFingerprint(studentId, studentName);
  } else {
    if (
      confirm("¿Está seguro de que desea actualizar la huella de este alumno?")
    ) {
      registerFingerprint(studentId, studentName);
    }
  }
}

// ========================================
// FUNCIONES DE PERFIL
// ========================================

function editarPerfil() {
  alert("Función de editar perfil en desarrollo");
}

function cambiarPassword() {
  const modal = document.getElementById("cambiarPasswordModal");
  if (modal) {
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
  } else {
    alert("Modal de cambio de contraseña no encontrado");
  }
}

function configurar2FA() {
  alert("Función de configuración 2FA en desarrollo");
}

function guardarPreferencias() {
  alert("Función de guardar preferencias en desarrollo");
}

function confirmarCambioPassword() {
  const form = document.getElementById("cambiarPasswordForm");
  if (!form) {
    alert("Formulario de cambio de contraseña no encontrado");
    return;
  }

  const formData = new FormData(form);
  const currentPassword = formData.get("current_password");
  const newPassword = formData.get("new_password");
  const confirmPassword = formData.get("confirm_password");

  // Validaciones
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Por favor complete todos los campos");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Las contraseñas nuevas no coinciden");
    return;
  }

  if (newPassword.length < 6) {
    alert("La nueva contraseña debe tener al menos 6 caracteres");
    return;
  }

  // Aquí iría la petición al servidor
  alert("Función de cambio de contraseña en desarrollo");
}

// ========================================
// FUNCIONES DE DETALLES
// ========================================

function editarEstudiante(id) {
  // Redirigir a la gestión de alumnos con el alumno específico
  window.location.href = `/admin/alumnos?edit=${id}`;
}

// ========================================
// FUNCIONES DE UTILIDAD Y DEBUG
// ========================================

function mostrarModulosCargados() {
  const modulos = [
    "Utils",
    "ThemeManager",
    "BaseSystem",
    "BiometricTerminal",
    "BiometricAdmin",
    "StudentManager",
    "AttendanceSystem",
    "CourseDetail",
    "AttendanceByCourse",
    "AttendanceMarker",
    "AuthForms",
  ];

  let mensaje = "=== MÓDULOS CARGADOS ===\n";
  modulos.forEach((modulo) => {
    const disponible = typeof window[modulo] !== "undefined" ? "✓" : "✗";
    mensaje += `${modulo}: ${disponible}\n`;
  });
  mensaje += "========================";

  console.log(mensaje);
  alert(
    "Estado de módulos mostrado en consola. Presiona F12 para ver detalles."
  );
}

function probarFunciones() {
  console.log("=== PROBANDO FUNCIONES GLOBALES ===");

  const funcionesGlobales = [
    "detectarDispositivos",
    "mostrarInfoSesion",
    "editarAlumno",
    "eliminarAlumno",
    "verDetalles",
    "guardarAlumno",
    "limpiarFormulario",
    "editarCurso",
    "eliminarCurso",
    "guardarCurso",
    "editarEstudiante",
    "registerFingerprint",
    "updateFingerprint",
    "marcarAsistenciaRapida",
    "guardarAsistenciaRapida",
    "mostrarModalMarcarTodos",
    "editarPerfil",
    "cambiarPassword",
    "configurar2FA",
    "guardarPreferencias",
    "confirmarCambioPassword",
  ];

  funcionesGlobales.forEach((funcion) => {
    const existe = typeof window[funcion] === "function";
    console.log(`${funcion}: ${existe ? "✓" : "✗"}`);
  });

  console.log("===================================");
  alert(
    "Prueba de funciones completada. Revisa la consola para los resultados."
  );
}

// ========================================
// FUNCIONES DE BÚSQUEDA DE ALUMNOS
// ========================================

function initializarBuscadorAlumnos() {
  // Configurar autocompletado para todos los inputs de búsqueda de alumnos
  const buscadores = [
    "#alumno-search",
    "#buscar-alumno-input",
    "#buscar-alumno",
    "#searchStudent",
  ];

  buscadores.forEach((selector) => {
    const elemento = $(selector);
    if (elemento.length > 0) {
      configurarAutocompletado(elemento, selector);
    }
  });
}

function ocultarInfoAlumno() {
  const infoContainer = $("#info-alumno, #datos-alumno, #alumno-info");
  if (infoContainer.length) {
    infoContainer.slideUp(300, function () {
      $(this).remove();
    });
  }
}

function configurarAutocompletado(inputSelector) {
  console.log("Configurando autocompletado para:", inputSelector);

  const input = $(inputSelector);
  if (!input.length) {
    console.warn("Input no encontrado:", inputSelector);
    return;
  }

  // Mejorar estilos del input
  input.addClass("form-control search-input");

  // Añadir icono de búsqueda si no existe
  if (!input.parent().hasClass("input-group")) {
    input.wrap('<div class="input-group position-relative"></div>');
    input.after(`
            <span class="position-absolute top-50 end-0 translate-middle-y me-3" style="z-index: 10;">
                <i class="fas fa-search text-muted"></i>
            </span>
        `);
  }

  input
    .autocomplete({
      source: function (request, response) {
        const loadingIcon = input.siblings("span").find("i");
        loadingIcon.removeClass("fa-search").addClass("fa-spinner fa-spin");

        $.ajax({
          url: "/asistencia/buscar_alumno",
          data: { term: request.term },
          dataType: "json",
          success: function (data) {
            loadingIcon.removeClass("fa-spinner fa-spin").addClass("fa-search");

            // Remover cualquier estilo de error previo si la request fue exitosa
            input.removeClass("is-invalid border-danger session-expired");

            if (data && data.length > 0) {
              response(
                data.map(function (alumno) {
                  return {
                    label: `${alumno.nombre} ${alumno.apellido} (${alumno.email})`,
                    value: `${alumno.nombre} ${alumno.apellido}`,
                    data: alumno,
                  };
                })
              );
            } else {
              response([]);
            }
          },
          error: function (xhr, status, error) {
            loadingIcon.removeClass("fa-spinner fa-spin").addClass("fa-search");
            console.error("Error en búsqueda:", error);

            // Si es error 401 (no autorizado), mostrar mensaje y redirigir al login
            if (xhr.status === 401) {
              console.warn("Sesión expirada. Redirigiendo al login...");
              // Remover cualquier estilo de error del input
              input.removeClass("is-invalid border-danger");
              // Mostrar mensaje al usuario
              if (typeof window.showAlert === "function") {
                window.showAlert(
                  "Tu sesión ha expirado. Serás redirigido al login.",
                  "warning"
                );
              }
              // Redirigir al login después de 2 segundos
              setTimeout(function () {
                window.location.href = "/auth/login";
              }, 2000);
            } else {
              // Para otros errores, marcar el input como inválido
              input.addClass("is-invalid border-danger");
            }

            response([]);
          },
        });
      },
      minLength: 2,
      delay: 300,
      select: function (event, ui) {
        console.log("Alumno seleccionado:", ui.item.data);

        // Establecer valor en input
        $(this).val(ui.item.value);

        // Solo mostrar información del alumno si NO estamos en gestión de alumnos
        if (!$("#tabla-alumnos").length) {
          mostrarInfoAlumno(ui.item.data);
        } else {
          // Si estamos en gestión de alumnos, filtrar la tabla con el ID del alumno
          // Esto es más preciso que usar el nombre
          filtrarTablaAlumnosPorId(ui.item.data.id);
        }

        // Establecer ID del alumno si hay campo oculto
        const hiddenInput = $("#alumno_id, #alumno-id, #id_alumno");
        if (hiddenInput.length && ui.item.data.id) {
          hiddenInput.val(ui.item.data.id);
          console.log("✅ ID establecido en campo oculto:", ui.item.data.id);
        }

        // Trigger evento personalizado
        $(this).trigger("alumno-seleccionado", ui.item.data);

        return false;
      },
      change: function (event, ui) {
        if (!ui.item) {
          // Limpiar si no hay selección válida
          ocultarInfoAlumno();
          $("#alumno_id, #alumno-id").val("");
        }
      },
    })
    .autocomplete("instance")._renderItem = function (ul, item) {
    return $("<li>")
      .addClass("ui-autocomplete-item px-3 py-2")
      .append(
        `
                <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                             style="width: 35px; height: 35px; font-size: 0.9rem;">
                            <i class="fas fa-user"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1 ms-2">
                        <div class="fw-semibold text-dark">${
                          item.data.nombre
                        } ${item.data.apellido}</div>
                        <div class="small text-muted">${item.data.email}</div>
                        ${
                          item.data.curso
                            ? `<div class="small text-info">${item.data.curso}</div>`
                            : ""
                        }
                    </div>
                </div>
            `
      )
      .appendTo(ul);
  };
}

function mostrarInfoAlumno(alumno) {
  console.log("Mostrando info de alumno:", alumno);

  // Buscar contenedor de información
  let infoContainer = $("#info-alumno, #datos-alumno, #alumno-info");

  if (infoContainer.length === 0) {
    // Crear contenedor si no existe
    const searchInput = $(
      "#alumno-search, #buscar-alumno-input, #buscar-alumno, #test-alumno-search"
    );
    if (searchInput.length) {
      searchInput.after(`
                <div id="info-alumno" class="mt-3 p-3 border rounded bg-light shadow-sm" style="display: none;">
                    <div id="datos-alumno"></div>
                </div>
            `);
      infoContainer = $("#info-alumno");
    }
  }

  if (infoContainer.length) {
    const html = `
            <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                         style="width: 50px; height: 50px; font-size: 1.2rem;">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
                <div class="flex-grow-1 ms-3">
                    <h6 class="mb-1 text-primary">
                        <i class="fas fa-check-circle text-success me-1"></i>
                        ${alumno.nombre || ""} ${alumno.apellido || ""}
                    </h6>
                    <div class="text-muted small mb-1">
                        <i class="fas fa-envelope me-1"></i>
                        ${alumno.email || "Email no disponible"}
                    </div>
                    ${
                      alumno.curso
                        ? `
                        <div class="text-muted small">
                            <i class="fas fa-school me-1"></i>
                            ${alumno.curso}
                        </div>
                    `
                        : ""
                    }
                </div>
                <div class="flex-shrink-0">
                    <button type="button" class="btn-close" onclick="ocultarInfoAlumno()" aria-label="Cerrar"></button>
                </div>
            </div>
        `;

    $("#datos-alumno").html(html);
    infoContainer.slideDown(300);
  }
}

function ocultarInfoAlumno() {
  $("#info-alumno, #datos-alumno, #alumno-info").hide();
}

// Función para buscar alumnos manualmente (sin autocompletado)
function buscarAlumnos(termino) {
  if (!termino || termino.length < 2) {
    return;
  }

  $.ajax({
    url: "/asistencia/buscar_alumno",
    data: { term: termino },
    dataType: "json",
    success: function (data) {
      mostrarResultadosBusqueda(data);
    },
    error: function (xhr, status, error) {
      console.error("Error en búsqueda manual:", error);
      alert("Error al buscar alumnos. Verifique su conexión.");
    },
  });
}

function mostrarResultadosBusqueda(alumnos) {
  const container = $("#resultados-busqueda, #search-results");

  if (!container.length) {
    // Crear contenedor si no existe
    const searchInput = $("#buscar-alumno-input, #buscar-alumno");
    if (searchInput.length) {
      searchInput.after('<div id="resultados-busqueda" class="mt-2"></div>');
    }
  }

  const resultContainer = $("#resultados-busqueda, #search-results");

  if (alumnos.length === 0) {
    resultContainer.html(
      '<div class="alert alert-info">No se encontraron alumnos</div>'
    );
    return;
  }

  let html = '<div class="list-group">';
  alumnos.forEach((alumno) => {
    html += `
            <a href="#" class="list-group-item list-group-item-action" onclick="seleccionarAlumno(${
              alumno.id || alumno.id_alumno
            }, '${alumno.nombre || ""}', '${
      alumno.apellido || alumno.apellido_paterno || ""
    }', '${alumno.email || ""}')">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${alumno.nombre || ""} ${
      alumno.apellido || alumno.apellido_paterno || ""
    }</h6>
                    <small class="text-muted">${alumno.email || ""}</small>
                </div>
                ${
                  alumno.curso
                    ? `<small class="text-muted">Curso: ${alumno.curso}</small>`
                    : ""
                }
            </a>
        `;
  });
  html += "</div>";

  resultContainer.html(html);
}

function seleccionarAlumno(id, nombre, apellido, email) {
  // Llenar campos
  $("#id_alumno").val(id);
  $("#rapid_id_alumno").val(id);

  // Llenar campo de búsqueda
  const searchField = $("#alumno-search, #buscar-alumno-input, #buscar-alumno");
  searchField.val(`${nombre} ${apellido} - ${email}`);

  // Mostrar información
  mostrarInfoAlumno({ id, nombre, apellido, email });

  // Ocultar resultados
  $("#resultados-busqueda, #search-results").hide();
}

function probarApiBusqueda(termino = "test") {
  console.log(`🔍 Probando API de búsqueda con término: "${termino}"`);

  fetch(`/asistencia/buscar_alumno?term=${encodeURIComponent(termino)}`)
    .then((response) => {
      console.log(
        "📡 Respuesta del servidor:",
        response.status,
        response.statusText
      );
      return response.json();
    })
    .then((data) => {
      console.log("📋 Datos recibidos:", data);
      if (data.length > 0) {
        console.log(`✅ Se encontraron ${data.length} alumnos:`);
        data.forEach((alumno, index) => {
          console.log(
            `  ${index + 1}. ${alumno.nombre} ${alumno.apellido} - ${
              alumno.email
            }`
          );
        });

        if (typeof Utils !== "undefined") {
          Utils.showSuccess(
            `Se encontraron ${data.length} alumnos. Ver consola para detalles.`
          );
        }
      } else {
        console.log("⚠️ No se encontraron alumnos");
        if (typeof Utils !== "undefined") {
          Utils.showWarning("No se encontraron alumnos con ese término");
        }
      }
    })
    .catch((error) => {
      console.error("❌ Error en la búsqueda:", error);
      if (typeof Utils !== "undefined") {
        Utils.showError("Error al buscar alumnos: " + error.message);
      }
    });
}

// ========================================
// INICIALIZACIÓN
// ========================================

// Ejecutar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  console.log("✓ Funciones globales cargadas correctamente");

  // Inicializar buscadores de alumnos cuando jQuery UI esté disponible
  if (typeof $ !== "undefined" && $.ui && $.ui.autocomplete) {
    console.log("✓ jQuery UI disponible, inicializando buscadores...");
    setTimeout(initializarBuscadorAlumnos, 500);
  } else {
    console.log("⚠ jQuery UI no disponible, reintentando...");
    // Reintentar cada segundo hasta que jQuery UI esté disponible
    const interval = setInterval(() => {
      if (typeof $ !== "undefined" && $.ui && $.ui.autocomplete) {
        console.log(
          "✓ jQuery UI ahora disponible, inicializando buscadores..."
        );
        initializarBuscadorAlumnos();
        clearInterval(interval);
      }
    }, 1000);

    // Parar después de 10 intentos
    setTimeout(() => {
      clearInterval(interval);
      console.error("❌ jQuery UI no se pudo cargar después de 10 intentos");
    }, 10000);
  }

  // Hacer funciones disponibles globalmente
  window.detectarDispositivos = detectarDispositivos;
  window.mostrarInfoSesion = mostrarInfoSesion;
  window.editarAlumno = editarAlumno;
  window.eliminarAlumno = eliminarAlumno;
  window.verDetalles = verDetalles;
  window.guardarAlumno = guardarAlumno;
  window.limpiarFormulario = limpiarFormulario;
  window.limpiarFormularioCurso = limpiarFormularioCurso;
  window.editarCurso = editarCurso;
  window.eliminarCurso = eliminarCurso;
  window.guardarCurso = guardarCurso;
  window.editarEstudiante = editarEstudiante;
  window.registerFingerprint = registerFingerprint;
  window.updateFingerprint = updateFingerprint;
  window.marcarAsistenciaRapida = marcarAsistenciaRapida;
  window.guardarAsistenciaRapida = guardarAsistenciaRapida;
  window.mostrarModalMarcarTodos = mostrarModalMarcarTodos;
  window.editarPerfil = editarPerfil;
  window.cambiarPassword = cambiarPassword;
  window.configurar2FA = configurar2FA;
  window.guardarPreferencias = guardarPreferencias;
  window.confirmarCambioPassword = confirmarCambioPassword;
  window.mostrarModulosCargados = mostrarModulosCargados;
  window.probarFunciones = probarFunciones;

  // Funciones de búsqueda de alumnos
  window.initializarBuscadorAlumnos = initializarBuscadorAlumnos;
  window.configurarAutocompletado = configurarAutocompletado;
  window.mostrarInfoAlumno = mostrarInfoAlumno;
  window.ocultarInfoAlumno = ocultarInfoAlumno;
  window.buscarAlumnos = buscarAlumnos;
  window.mostrarResultadosBusqueda = mostrarResultadosBusqueda;
  window.seleccionarAlumno = seleccionarAlumno;
  window.probarApiBusqueda = probarApiBusqueda;

  // Funciones auxiliares
  function limpiarBuscador() {
    console.log("Limpiando buscador...");

    // Limpiar todos los inputs de búsqueda
    $(
      "#alumno-search, #buscar-alumno-input, #buscar-alumno, #test-alumno-search"
    ).val("");

    // Ocultar información del alumno
    ocultarInfoAlumno();

    // Limpiar campos ocultos
    $("#alumno_id, #alumno-id").val("");

    // Mostrar mensaje de confirmación
    mostrarMensajeExito("Búsqueda limpiada correctamente");
  }

  // Función auxiliar para mostrar mensajes
  function mostrarMensajeExito(mensaje) {
    // Crear y mostrar toast o alert temporal
    const alertDiv = $(`
          <div class="alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3" 
               style="z-index: 9999; min-width: 300px;" role="alert">
              <i class="fas fa-check-circle me-2"></i>
              ${mensaje}
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          </div>
      `);

    $("body").append(alertDiv);

    // Auto-dismiss después de 3 segundos
    setTimeout(() => {
      alertDiv.alert("close");
    }, 3000);
  }

  // Función auxiliar para mostrar mensajes de error
  function mostrarMensajeError(mensaje) {
    const alertDiv = $(`
          <div class="alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3" 
               style="z-index: 9999; min-width: 300px;" role="alert">
              <i class="fas fa-exclamation-circle me-2"></i>
              ${mensaje}
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          </div>
      `);

    $("body").append(alertDiv);

    setTimeout(() => {
      alertDiv.alert("close");
    }, 5000);
  }

  // ==========================================
  // FUNCIONES DE FILTRADO DE TABLA
  // ==========================================

  function inicializarFiltroTablaAlumnos() {
    console.log("Inicializando filtro de tabla de alumnos...");

    const inputBusqueda = $("#buscar-alumno");
    const btnLimpiar = $("#limpiar-busqueda");
    const contador = $("#contador-resultados");

    if (!inputBusqueda.length) {
      console.warn("Input de búsqueda no encontrado");
      return;
    }

    // Configurar eventos de búsqueda
    inputBusqueda.on("input", function () {
      const termino = $(this).val().trim();

      if (termino.length > 0) {
        btnLimpiar.show();
        filtrarTablaAlumnos(termino);
      } else {
        limpiarFiltroTabla();
      }
    });

    // Configurar botón limpiar
    btnLimpiar.on("click", function () {
      limpiarFiltroTabla();
    });

    console.log("Filtro de tabla inicializado correctamente");
  }

  function filtrarTablaAlumnos(termino) {
    console.log("Filtrando tabla con término:", termino);

    const tabla = $("#tabla-alumnos tbody");
    const filas = tabla.find("tr");
    let resultadosEncontrados = 0;

    // Agregar clase de búsqueda a la tabla
    tabla.addClass("tabla-buscando");

    filas.each(function () {
      const fila = $(this);
      const textoFila = fila.text();

      // Usar búsqueda más precisa
      const coincide = busquedaMasPrecisa(textoFila, termino);

      if (coincide) {
        // Mostrar fila y destacarla
        fila.removeClass("fila-oculta").addClass("tabla-alumno-destacado");
        destacarTextoEnTabla(fila, termino);
        resultadosEncontrados++;
      } else {
        // Ocultar fila
        fila.addClass("fila-oculta").removeClass("tabla-alumno-destacado");
        limpiarDestacadoTexto(fila);
      }
    });

    // Actualizar contador
    actualizarContadorResultados(resultadosEncontrados, filas.length);

    // Quitar clase de búsqueda
    setTimeout(() => {
      tabla.removeClass("tabla-buscando");
    }, 300);

    // Mostrar mensaje si no hay resultados
    if (resultadosEncontrados === 0) {
      mostrarMensajeSinResultados();
    } else {
      ocultarMensajeSinResultados();
    }
  }

  function filtrarTablaAlumnosPorId(alumnoId) {
    console.log("Filtrando tabla por ID de alumno:", alumnoId);

    const tabla = $("#tabla-alumnos tbody");
    const filas = tabla.find("tr");
    let resultadosEncontrados = 0;

    // Agregar clase de búsqueda a la tabla
    tabla.addClass("tabla-buscando");

    filas.each(function () {
      const fila = $(this);
      const filaId = fila.data("id");

      if (filaId && filaId.toString() === alumnoId.toString()) {
        // Mostrar solo esta fila y destacarla
        fila.removeClass("fila-oculta").addClass("tabla-alumno-destacado");
        resultadosEncontrados++;
      } else {
        // Ocultar todas las demás filas
        fila.addClass("fila-oculta").removeClass("tabla-alumno-destacado");
        limpiarDestacadoTexto(fila);
      }
    });

    // Actualizar contador
    actualizarContadorResultados(resultadosEncontrados, filas.length);

    // Quitar clase de búsqueda
    setTimeout(() => {
      tabla.removeClass("tabla-buscando");
    }, 300);

    // Mostrar mensaje si no hay resultados
    if (resultadosEncontrados === 0) {
      mostrarMensajeSinResultados();
    } else {
      ocultarMensajeSinResultados();
    }
  }

  function destacarTextoEnTabla(fila, termino) {
    const terminoBusqueda = termino.toLowerCase();
    const palabrasBusqueda = terminoBusqueda
      .split(" ")
      .filter((p) => p.length > 0);

    fila.find("td").each(function () {
      const celda = $(this);
      const textoOriginal = celda.data("texto-original") || celda.text();

      // Guardar texto original si no existe
      if (!celda.data("texto-original")) {
        celda.data("texto-original", textoOriginal);
      }

      let textoDestacado = textoOriginal;

      // Destacar cada palabra de búsqueda
      palabrasBusqueda.forEach((palabra) => {
        if (palabra.length > 1) {
          // Solo palabras de más de 1 carácter
          // Crear patrón que busque la palabra completa o al inicio de palabras
          const patron = new RegExp(`(\\b${escapeRegExp(palabra)})`, "gi");
          textoDestacado = textoDestacado.replace(
            patron,
            '<span class="texto-destacado">$1</span>'
          );
        }
      });

      celda.html(textoDestacado);
    });
  }

  function limpiarDestacadoTexto(fila) {
    fila.find("td").each(function () {
      const celda = $(this);
      const textoOriginal = celda.data("texto-original");

      if (textoOriginal) {
        celda.text(textoOriginal);
      }
    });
  }

  function limpiarFiltroTabla() {
    console.log("Limpiando filtro de tabla...");

    const inputBusqueda = $("#buscar-alumno");
    const btnLimpiar = $("#limpiar-busqueda");
    const contador = $("#contador-resultados");
    const tabla = $("#tabla-alumnos tbody");
    const filas = tabla.find("tr");

    // Limpiar input
    inputBusqueda.val("");

    // Ocultar botón y contador
    btnLimpiar.hide();
    contador.hide();

    // Mostrar todas las filas y quitar destacados
    filas.each(function () {
      const fila = $(this);
      fila.removeClass("fila-oculta tabla-alumno-destacado");
      limpiarDestacadoTexto(fila);
    });

    // Ocultar mensaje sin resultados
    ocultarMensajeSinResultados();

    mostrarMensajeExito("Filtro limpiado correctamente");
  }

  function actualizarContadorResultados(encontrados, total) {
    const contador = $("#contador-resultados");

    if (encontrados === total) {
      contador.hide();
    } else {
      contador.text(`${encontrados} de ${total} resultados`).show();
    }
  }

  function mostrarMensajeSinResultados() {
    const tabla = $("#tabla-alumnos tbody");

    if (!$("#mensaje-sin-resultados").length) {
      const mensaje = $(`
              <tr id="mensaje-sin-resultados">
                  <td colspan="8" class="sin-resultados">
                      <i class="fas fa-search"></i>
                      <div>No se encontraron alumnos que coincidan con tu búsqueda</div>
                      <small>Intenta con otros términos de búsqueda</small>
                  </td>
              </tr>
          `);

      tabla.append(mensaje);
    }
  }

  function ocultarMensajeSinResultados() {
    $("#mensaje-sin-resultados").remove();
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizarTexto(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .trim();
  }

  function busquedaMasPrecisa(textoFila, terminoBusqueda) {
    const textoNormalizado = normalizarTexto(textoFila);
    const terminoNormalizado = normalizarTexto(terminoBusqueda);

    // Dividir término de búsqueda en palabras
    const palabrasBusqueda = terminoNormalizado
      .split(" ")
      .filter((p) => p.length > 0);

    if (palabrasBusqueda.length === 1) {
      const palabra = palabrasBusqueda[0];
      // Buscar al inicio de palabras o palabra completa
      const regex = new RegExp(`\\b${palabra}`, "i");
      return regex.test(textoNormalizado) || textoNormalizado.includes(palabra);
    } else {
      // Múltiples palabras - todas deben estar presentes
      return palabrasBusqueda.every((palabra) =>
        textoNormalizado.includes(palabra)
      );
    }
  }

  // ==========================================
  // FUNCIONES DE GESTIÓN DE ALUMNOS
  // ==========================================

  function editarAlumno(id) {
    console.log("Editando alumno con ID:", id);

    // Mostrar modal de loading
    mostrarModalLoading("Cargando datos del alumno...");

    // Hacer petición AJAX para obtener datos del alumno
    $.ajax({
      url: `/admin/alumnos/${id}/datos`,
      method: "GET",
      success: function (response) {
        ocultarModalLoading();

        if (response.success) {
          // Llenar el formulario con los datos del alumno
          llenarFormularioAlumno(response.alumno);
          // Cambiar título del modal
          $("#modal-alumno .modal-title").html(
            '<i class="fas fa-edit"></i> Editar Alumno'
          );
          // Mostrar modal
          $("#modal-alumno").modal("show");
        } else {
          mostrarMensajeError(
            "Error al cargar los datos del alumno: " + response.message
          );
        }
      },
      error: function (xhr, status, error) {
        ocultarModalLoading();
        console.error("Error al cargar alumno:", error);
        mostrarMensajeError("Error al cargar los datos del alumno");
      },
    });
  }

  function eliminarAlumno(id) {
    console.log("Eliminando alumno con ID:", id);

    // Obtener nombre del alumno desde la fila de la tabla
    const fila = $(`tr[data-id="${id}"]`);
    const nombreAlumno = fila.find("td:nth-child(2)").text().trim();

    // Mostrar modal de confirmación
    $("#confirmar-eliminar-alumno .alumno-nombre").text(nombreAlumno);
    $("#confirmar-eliminar-alumno").data("alumno-id", id);
    $("#confirmar-eliminar-alumno").modal("show");
  }

  function verDetalles(id) {
    console.log("Viendo detalles del alumno con ID:", id);

    // Mostrar modal de loading
    mostrarModalLoading("Cargando detalles del alumno...");

    // Hacer petición AJAX para obtener datos completos del alumno
    $.ajax({
      url: `/admin/alumnos/${id}/detalles`,
      method: "GET",
      success: function (response) {
        ocultarModalLoading();

        if (response.success) {
          // Mostrar detalles en modal
          mostrarModalDetallesAlumno(response.alumno);
        } else {
          mostrarMensajeError(
            "Error al cargar los detalles del alumno: " + response.message
          );
        }
      },
      error: function (xhr, status, error) {
        ocultarModalLoading();
        console.error("Error al cargar detalles:", error);
        mostrarMensajeError("Error al cargar los detalles del alumno");
      },
    });
  }

  function guardarAlumno() {
    console.log("Guardando alumno...");

    const formData = new FormData($("#form-alumno")[0]);
    const alumnoId = $("#alumno-id").val();
    const isEditing = alumnoId && alumnoId !== "";

    const url = isEditing
      ? `/admin/alumnos/${alumnoId}/actualizar`
      : "/admin/alumnos/crear";
    const method = "POST";

    // Mostrar loading en botón
    const btnGuardar = $("#btn-guardar-alumno");
    const textoOriginal = btnGuardar.html();
    btnGuardar
      .html('<i class="fas fa-spinner fa-spin"></i> Guardando...')
      .prop("disabled", true);

    $.ajax({
      url: url,
      method: method,
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        if (response.success) {
          mostrarMensajeExito(
            isEditing
              ? "Alumno actualizado correctamente"
              : "Alumno creado correctamente"
          );
          $("#modal-alumno").modal("hide");
          // Recargar la página para mostrar los cambios
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          mostrarMensajeError("Error: " + response.message);
        }
      },
      error: function (xhr, status, error) {
        console.error("Error al guardar alumno:", error);

        if (xhr.responseJSON && xhr.responseJSON.errors) {
          // Mostrar errores de validación
          mostrarErroresValidacion(xhr.responseJSON.errors);
        } else {
          mostrarMensajeError("Error al guardar el alumno");
        }
      },
      complete: function () {
        // Restaurar botón
        btnGuardar.html(textoOriginal).prop("disabled", false);
      },
    });
  }

  function confirmarEliminarAlumno() {
    const alumnoId = $("#confirmar-eliminar-alumno").data("alumno-id");
    console.log("Confirmando eliminación del alumno:", alumnoId);

    // Mostrar loading en botón
    const btnConfirmar = $("#btn-confirmar-eliminar");
    const textoOriginal = btnConfirmar.html();
    btnConfirmar
      .html('<i class="fas fa-spinner fa-spin"></i> Eliminando...')
      .prop("disabled", true);

    $.ajax({
      url: `/admin/alumnos/${alumnoId}/eliminar`,
      method: "POST",
      success: function (response) {
        if (response.success) {
          mostrarMensajeExito("Alumno eliminado correctamente");
          $("#confirmar-eliminar-alumno").modal("hide");

          // Remover fila de la tabla con animación
          const fila = $(`tr[data-id="${alumnoId}"]`);
          fila.fadeOut(500, function () {
            fila.remove();
            // Actualizar contador si está visible
            actualizarContadorResultados(
              $("#tabla-alumnos tbody tr:visible").length,
              $("#tabla-alumnos tbody tr").length
            );
          });
        } else {
          mostrarMensajeError(
            "Error al eliminar el alumno: " + response.message
          );
        }
      },
      error: function (xhr, status, error) {
        console.error("Error al eliminar alumno:", error);
        mostrarMensajeError("Error al eliminar el alumno");
      },
      complete: function () {
        // Restaurar botón
        btnConfirmar.html(textoOriginal).prop("disabled", false);
      },
    });
  }

  // Funciones auxiliares para modales
  function llenarFormularioAlumno(alumno) {
    $("#alumno-id").val(alumno.id_alumno);
    $("#rut").val(alumno.rut || "");
    $("#nombre").val(alumno.nombre || "");
    $("#apellido").val(alumno.apellido_paterno || "");
    $("#apellido_materno").val(alumno.apellido_materno || "");
    $("#email").val(alumno.email || "");
    $("#telefono").val(alumno.telefono || "");
    $("#fecha_nacimiento").val(alumno.fecha_nacimiento || "");
    $("#fecha_ingreso").val(alumno.fecha_ingreso || "");
    $("#curso").val(alumno.id_curso_fk || "");
    $("#direccion").val(alumno.direccion || "");
  }

  function limpiarFormularioAlumno() {
    $("#form-alumno")[0].reset();
    $("#alumno-id").val("");
    $("#modal-alumno .modal-title").html(
      '<i class="fas fa-plus"></i> Nuevo Alumno'
    );

    // Remover clases de validación
    $("#form-alumno .is-invalid").removeClass("is-invalid");
    $("#form-alumno .is-valid").removeClass("is-valid");
  }

  function mostrarModalDetallesAlumno(alumno) {
    const html = `
      <div class="row">
        <div class="col-md-6">
          <h6><i class="fas fa-user"></i> Información Personal</h6>
          <p><strong>RUT:</strong> ${alumno.rut || "No especificado"}</p>
          <p><strong>Nombre:</strong> ${alumno.nombre} ${
      alumno.apellido_paterno
    } ${alumno.apellido_materno || ""}</p>
          <p><strong>Email:</strong> ${alumno.email || "No especificado"}</p>
          <p><strong>Teléfono:</strong> ${
            alumno.telefono || "No especificado"
          }</p>
        </div>
        <div class="col-md-6">
          <h6><i class="fas fa-calendar"></i> Fechas</h6>
          <p><strong>Fecha de Nacimiento:</strong> ${
            alumno.fecha_nacimiento || "No especificada"
          }</p>
          <p><strong>Fecha de Ingreso:</strong> ${
            alumno.fecha_ingreso || "No especificada"
          }</p>
          <h6><i class="fas fa-school"></i> Académico</h6>
          <p><strong>Curso:</strong> ${alumno.curso_nombre || "No asignado"}</p>
          <p><strong>Estado:</strong> <span class="badge bg-success">Activo</span></p>
        </div>
      </div>
    `;

    $("#modal-detalles-alumno .modal-body").html(html);
    $("#modal-detalles-alumno .modal-title").html(
      `<i class="fas fa-eye"></i> Detalles de ${alumno.nombre} ${alumno.apellido_paterno}`
    );
    $("#modal-detalles-alumno").modal("show");
  }

  function mostrarModalLoading(mensaje = "Cargando...") {
    const html = `
      <div class="modal fade" id="modal-loading" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-sm modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-body text-center py-4">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mb-0">${mensaje}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remover modal anterior si existe
    $("#modal-loading").remove();
    $("body").append(html);
    $("#modal-loading").modal("show");
  }

  function ocultarModalLoading() {
    $("#modal-loading").modal("hide");
    setTimeout(() => {
      $("#modal-loading").remove();
    }, 500);
  }

  function mostrarErroresValidacion(errores) {
    let mensaje = "Errores de validación:\n";
    for (const campo in errores) {
      mensaje += `• ${errores[campo].join(", ")}\n`;
    }
    mostrarMensajeError(mensaje);
  }

  // Funciones de búsqueda de alumnos
  window.initializarBuscadorAlumnos = initializarBuscadorAlumnos;
  window.configurarAutocompletado = configurarAutocompletado;
  window.mostrarInfoAlumno = mostrarInfoAlumno;
  window.ocultarInfoAlumno = ocultarInfoAlumno;
  window.buscarAlumnos = buscarAlumnos;
  window.mostrarResultadosBusqueda = mostrarResultadosBusqueda;
  window.seleccionarAlumno = seleccionarAlumno;
  window.probarApiBusqueda = probarApiBusqueda;
  window.limpiarBuscador = limpiarBuscador;
  window.mostrarMensajeExito = mostrarMensajeExito;
  window.mostrarMensajeError = mostrarMensajeError;

  // Funciones de filtrado de tabla
  window.inicializarFiltroTablaAlumnos = inicializarFiltroTablaAlumnos;
  window.filtrarTablaAlumnos = filtrarTablaAlumnos;
  window.filtrarTablaAlumnosPorId = filtrarTablaAlumnosPorId;
  window.destacarTextoEnTabla = destacarTextoEnTabla;
  window.limpiarFiltroTabla = limpiarFiltroTabla;
  window.actualizarContadorResultados = actualizarContadorResultados;

  // Funciones de gestión de alumnos
  window.editarAlumno = editarAlumno;
  window.eliminarAlumno = eliminarAlumno;
  window.verDetalles = verDetalles;
  window.guardarAlumno = guardarAlumno;
  window.confirmarEliminarAlumno = confirmarEliminarAlumno;
  window.limpiarFormularioAlumno = limpiarFormularioAlumno;
});

// ==========================================
// INICIALIZACIÓN AUTOMÁTICA
// ==========================================
$(document).ready(function () {
  console.log("Documento listo - Inicializando funciones globales...");

  // Inicializar filtro de tabla si estamos en gestión de alumnos
  if ($("#tabla-alumnos").length && $("#buscar-alumno").length) {
    console.log("Inicializando filtro de tabla de alumnos...");
    inicializarFiltroTablaAlumnos();

    // TAMBIÉN inicializar autocompletado en gestión de alumnos
    console.log("Inicializando autocompletado en gestión de alumnos...");
    configurarAutocompletado("#buscar-alumno");
  }

  // Inicializar autocompletado en otras páginas
  const selectoresBuscador = [
    "#alumno-search",
    "#buscar-alumno-input",
    "#test-alumno-search",
  ];

  selectoresBuscador.forEach((selector) => {
    if ($(selector).length) {
      console.log("Inicializando buscador autocompletado:", selector);
      configurarAutocompletado(selector);
    }
  });

  console.log("Funciones globales inicializadas correctamente");
});
