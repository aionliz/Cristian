/**
 * Sistema de Asistencia - Colegio AML
 * JavaScript Unificado - Todas las funcionalidades del sistema
 */

// ========================================
// CONFIGURACIÓN GLOBAL
// ========================================

// Configuración global
const API_BASE_URL = "/api";
const TOAST_DURATION = 5000;

// ========================================
// UTILIDADES GENERALES
// ========================================

/**
 * Utilidades generales
 */
const Utils = {
  // Mostrar mensaje de éxito
  showSuccess: function (message) {
    this.showToast(message, "success");
  },

  // Mostrar mensaje de error
  showError: function (message) {
    this.showToast(message, "error");
  },

  // Mostrar mensaje de advertencia
  showWarning: function (message) {
    this.showToast(message, "warning");
  },

  // Mostrar toast personalizado
  showToast: function (message, type = "info") {
    const toastHtml = `
            <div class="toast align-items-center text-white bg-${this.getBootstrapColor(
              type
            )} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas ${this.getIcon(type)} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

    const toastContainer = this.getToastContainer();
    toastContainer.insertAdjacentHTML("beforeend", toastHtml);

    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement, { delay: TOAST_DURATION });
    toast.show();

    // Limpiar el elemento después de que se oculte
    toastElement.addEventListener("hidden.bs.toast", function () {
      toastElement.remove();
    });
  },

  // Obtener o crear contenedor de toasts
  getToastContainer: function () {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container position-fixed top-0 end-0 p-3";
      container.style.zIndex = "9999";
      document.body.appendChild(container);
    }
    return container;
  },

  // Convertir tipo a color de Bootstrap
  getBootstrapColor: function (type) {
    const colors = {
      success: "success",
      error: "danger",
      warning: "warning",
      info: "info",
    };
    return colors[type] || "info";
  },

  // Obtener icono según el tipo
  getIcon: function (type) {
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    };
    return icons[type] || "fa-info-circle";
  },

  // Formatear fecha
  formatDate: function (date) {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Formatear tiempo relativo
  timeAgo: function (date) {
    if (!date) return "-";
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? "s" : ""}`;
    return "hace unos momentos";
  },

  // Validar email
  isValidEmail: function (email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Capitalizar primera letra
  capitalize: function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Debounce para funciones
  debounce: function (func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

// ========================================
// GESTOR DE TEMAS
// ========================================

/**
 * Gestor del Tema Oscuro
 */
const ThemeManager = {
  // Inicializar el gestor de temas
  init: function () {
    console.log("🚀 ThemeManager.init(): Inicializando gestor de temas...");
    this.loadTheme();
    this.attachEventListeners();
    console.log("✅ ThemeManager inicializado correctamente");
  },

  // Cargar el tema guardado
  loadTheme: function () {
    const savedTheme = localStorage.getItem("theme") || "light";
    console.log(
      `📦 ThemeManager.loadTheme(): Tema guardado encontrado: ${savedTheme}`
    );

    // Aplicar tema inmediatamente sin transiciones para evitar parpadeo inicial
    document.body.classList.add("no-transitions");
    this.setTheme(savedTheme);

    // Remover la clase después de un frame para permitir transiciones futuras
    requestAnimationFrame(() => {
      document.body.classList.remove("no-transitions");
    });

    // Actualizar el switch si existe
    const themeSwitch = document.getElementById("tema-oscuro");
    if (themeSwitch) {
      themeSwitch.checked = savedTheme === "dark";
      console.log(`🔘 Switch de tema actualizado: ${savedTheme === "dark"}`);
    }
  },

  // Establecer el tema
  setTheme: function (theme) {
    console.log(`🎨 ThemeManager.setTheme(): Aplicando tema ${theme}`);

    // Deshabilitar transiciones temporalmente para evitar parpadeo
    document.documentElement.setAttribute("data-disable-transitions", "true");
    document.body.classList.add("no-transitions");

    // Aplicar el tema inmediatamente
    if (theme === "dark") {
      console.log("🌙 Activando modo oscuro...");
      document.documentElement.setAttribute("data-theme", "dark");
      this.updateBootstrapComponents("dark");
    } else {
      console.log("☀️ Activando modo claro...");
      document.documentElement.removeAttribute("data-theme");
      this.updateBootstrapComponents("light");
    }

    localStorage.setItem("theme", theme);
    this.updateThemeIcon(theme);

    // Forzar repaint antes de reactivar transiciones
    document.body.offsetHeight;

    // Reactivar transiciones después de que se apliquen los estilos
    setTimeout(() => {
      document.documentElement.removeAttribute("data-disable-transitions");
      document.body.classList.remove("no-transitions");
    }, 10);

    console.log(
      `✅ Tema ${theme} aplicado. data-theme =`,
      document.documentElement.getAttribute("data-theme")
    );
  },

  // Alternar entre temas
  toggleTheme: function () {
    console.log("🔄 ThemeManager.toggleTheme(): Iniciando alternancia...");

    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    console.log(
      `🔄 Tema actual: ${currentTheme || "light"} → Nuevo tema: ${newTheme}`
    );

    this.setTheme(newTheme);

    // NOTA: El toast se maneja en theme-toggle.js para evitar duplicación
  },

  // Actualizar el icono del botón de tema
  updateThemeIcon: function (theme) {
    const themeButton = document.getElementById("theme-toggle-btn");
    if (themeButton) {
      const icon = themeButton.querySelector("i");
      if (icon) {
        if (theme === "dark") {
          icon.className = "fas fa-sun";
          themeButton.title = "Cambiar a tema claro";
        } else {
          icon.className = "fas fa-moon";
          themeButton.title = "Cambiar a tema oscuro";
        }
      }
    }
  },

  // Actualizar componentes de Bootstrap para el tema
  updateBootstrapComponents: function (theme) {
    const isDark = theme === "dark";

    // Actualizar navbar
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      if (isDark) {
        navbar.classList.remove("navbar-light");
        navbar.classList.add("navbar-dark");
      } else {
        navbar.classList.remove("navbar-dark");
        navbar.classList.add("navbar-light");
      }
    }

    // Actualizar tablas
    const tables = document.querySelectorAll(".table");
    tables.forEach((table) => {
      if (isDark) {
        table.classList.add("table-dark");
      } else {
        table.classList.remove("table-dark");
      }
    });

    // Actualizar modales
    const modals = document.querySelectorAll(".modal-content");
    modals.forEach((modal) => {
      if (isDark) {
        modal.classList.add("bg-dark", "text-light");
      } else {
        modal.classList.remove("bg-dark", "text-light");
      }
    });
  },

  // Adjuntar event listeners
  attachEventListeners: function () {
    console.log(
      "🔗 ThemeManager.attachEventListeners(): Configurando listeners..."
    );

    // Switch de tema en perfil (si existe)
    const themeSwitch = document.getElementById("tema-oscuro");
    if (themeSwitch) {
      // Remover listener anterior si existe
      themeSwitch.removeEventListener("change", this.toggleTheme.bind(this));
      themeSwitch.addEventListener("change", () => {
        console.log("🔘 Switch de tema cambiado (desde perfil)");
        this.toggleTheme();
      });
      console.log("✅ Listener del switch de tema configurado");
    }

    // NOTA: El botón de navbar (#theme-toggle-btn) se maneja EXCLUSIVAMENTE en theme-toggle.js
    // para evitar listeners duplicados
    console.log(
      "ℹ️ Event listeners del ThemeManager configurados (sin botón navbar)"
    );
  },

  // Obtener el tema actual
  getCurrentTheme: function () {
    return document.documentElement.getAttribute("data-theme") || "light";
  },
};

// ========================================
// SISTEMA BASE - Funciones del layout principal
// ========================================

/**
 * Funciones del sistema base (desde base.html)
 */
const BaseSystem = {
  // Actualizar la hora actual en el footer
  updateCurrentTime: function () {
    const now = new Date();
    const timeString = now.toLocaleString("es-CL");
    const timeElement = document.getElementById("current-time");
    if (timeElement) {
      timeElement.textContent = timeString;
    }
  },

  // Configurar AJAX para CSRF
  setupAjax: function () {
    if (typeof $ !== "undefined") {
      $.ajaxSetup({
        beforeSend: function (xhr, settings) {
          if (
            !/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) &&
            !this.crossDomain
          ) {
            xhr.setRequestHeader(
              "X-CSRFToken",
              $("meta[name=csrf-token]").attr("content")
            );
          }
        },
      });
    }
  },

  // Función para detectar dispositivos
  detectarDispositivos: function () {
    // Crear y mostrar modal
    const modalHtml = `
            <div class="modal fade" id="dispositivosModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-fingerprint"></i> Detección de Dispositivos Biométricos
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div id="dispositivos-loading" class="text-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Detectando dispositivos...</span>
                                </div>
                                <p class="mt-2">Detectando dispositivos conectados...</p>
                            </div>
                            <div id="dispositivos-content" style="display: none;"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" onclick="BaseSystem.detectarDispositivos()">
                                <i class="fas fa-refresh"></i> Actualizar
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Remover modal anterior si existe
    const existingModal = document.getElementById("dispositivosModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Agregar modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Mostrar modal
    const modal = new bootstrap.Modal(
      document.getElementById("dispositivosModal")
    );
    modal.show();

    // Realizar petición AJAX
    this.loadDeviceInfo();
  },

  // Cargar información de dispositivos
  loadDeviceInfo: function () {
    const url = window.location.href.includes("/biometric/")
      ? "../asistencia/detectar_dispositivos"
      : "./asistencia/detectar_dispositivos";

    fetch(url)
      .then((response) => response.json())
      .then((response) => {
        document.getElementById("dispositivos-loading").style.display = "none";
        document.getElementById("dispositivos-content").style.display = "block";

        this.renderDeviceInfo(response);
      })
      .catch((error) => {
        document.getElementById("dispositivos-loading").style.display = "none";
        document.getElementById("dispositivos-content").style.display = "block";
        document.getElementById("dispositivos-content").innerHTML =
          '<div class="alert alert-danger">' +
          '<i class="fas fa-exclamation-triangle"></i> ' +
          "Error al detectar dispositivos: " +
          error.message +
          "</div>";
      });
  },

  // Renderizar información de dispositivos
  renderDeviceInfo: function (response) {
    let html = "";

    // Información del sistema
    html += '<div class="card mb-3">';
    html +=
      '<div class="card-header"><h6><i class="fas fa-desktop"></i> Información del Sistema</h6></div>';
    html += '<div class="card-body">';
    html += '<div class="row">';
    html +=
      '<div class="col-md-6"><strong>SO:</strong> ' +
      (response.sistema?.sistema_operativo || "N/A") +
      "</div>";
    html +=
      '<div class="col-md-6"><strong>Arquitectura:</strong> ' +
      (response.sistema?.arquitectura || "N/A") +
      "</div>";
    html +=
      '<div class="col-md-6"><strong>Python:</strong> ' +
      (response.sistema?.python_version || "N/A") +
      "</div>";
    html +=
      '<div class="col-md-6"><strong>Fecha:</strong> ' +
      new Date(response.timestamp || Date.now()).toLocaleString() +
      "</div>";
    html += "</div></div></div>";

    // Dispositivos de huellas
    html += '<div class="card mb-3">';
    html +=
      '<div class="card-header d-flex justify-content-between align-items-center">';
    html +=
      '<h6><i class="fas fa-fingerprint"></i> Lectores de Huellas Detectados</h6>';
    html += '<div class="btn-group" role="group">';
    html +=
      '<button type="button" class="btn btn-sm btn-success" onclick="BaseSystem.controlarLuces(\'on\')"><i class="fas fa-lightbulb"></i> Encender</button>';
    html +=
      '<button type="button" class="btn btn-sm btn-warning" onclick="BaseSystem.controlarLuces(\'blink\')"><i class="fas fa-stroopwafel"></i> Parpadear</button>';
    html +=
      '<button type="button" class="btn btn-sm btn-info" onclick="BaseSystem.controlarLuces(\'pulse\')"><i class="fas fa-circle-notch"></i> Pulso</button>';
    html +=
      '<button type="button" class="btn btn-sm btn-secondary" onclick="BaseSystem.controlarLuces(\'off\')"><i class="fas fa-power-off"></i> Apagar</button>';
    html += "</div></div>";
    html += '<div class="card-body">';

    if (
      response.dispositivos_huellas &&
      response.dispositivos_huellas.length > 0
    ) {
      response.dispositivos_huellas.forEach(function (dispositivo) {
        const statusClass =
          dispositivo.estado === "Conectado" ? "text-success" : "text-danger";
        html += '<div class="row mb-2 p-2 border rounded">';
        html +=
          '<div class="col-md-3"><strong>Modelo:</strong> ' +
          dispositivo.modelo +
          "</div>";
        html +=
          '<div class="col-md-3"><strong>Estado:</strong> <span class="' +
          statusClass +
          '">' +
          dispositivo.estado +
          "</span></div>";
        html +=
          '<div class="col-md-3"><strong>Dispositivo:</strong> ' +
          dispositivo.dispositivo +
          "</div>";
        html +=
          '<div class="col-md-3"><strong>Tipo:</strong> ' +
          dispositivo.tipo +
          "</div>";
        if (
          dispositivo.detalles &&
          Object.keys(dispositivo.detalles).length > 0
        ) {
          html +=
            '<div class="col-12 mt-2"><details><summary>Detalles técnicos</summary>';
          html +=
            '<pre class="mt-2">' +
            JSON.stringify(dispositivo.detalles, null, 2) +
            "</pre>";
          html += "</details></div>";
        }
        html += "</div>";
      });
    } else {
      html += '<p class="text-muted">No se detectaron lectores de huellas.</p>';
    }

    html += "</div></div>";

    // Dispositivos USB
    html += '<div class="card">';
    html +=
      '<div class="card-header"><h6><i class="fas fa-usb"></i> Dispositivos USB Conectados</h6></div>';
    html += '<div class="card-body">';

    if (response.dispositivos_usb && response.dispositivos_usb.length > 0) {
      html += '<div class="table-responsive">';
      html += '<table class="table table-sm">';
      html +=
        "<thead><tr><th>Dispositivo</th><th>Detalles</th></tr></thead><tbody>";

      response.dispositivos_usb.slice(0, 10).forEach(function (dispositivo) {
        html += "<tr>";
        if (dispositivo.error) {
          html +=
            '<td colspan="2" class="text-danger">' +
            dispositivo.error +
            "</td>";
        } else if (dispositivo.descripcion) {
          html += "<td>" + dispositivo.descripcion + "</td><td>-</td>";
        } else {
          html +=
            "<td>" +
            (dispositivo.nombre || dispositivo.id || "Dispositivo USB") +
            "</td>";
          html +=
            "<td>" +
            (dispositivo.manufacturer || dispositivo.vendor_id || "-") +
            "</td>";
        }
        html += "</tr>";
      });

      if (response.dispositivos_usb.length > 10) {
        html +=
          '<tr><td colspan="2" class="text-muted">... y ' +
          (response.dispositivos_usb.length - 10) +
          " dispositivos más</td></tr>";
      }

      html += "</tbody></table></div>";
    } else {
      html +=
        '<p class="text-muted">No se pudieron obtener dispositivos USB.</p>';
    }

    html += "</div></div>";

    document.getElementById("dispositivos-content").innerHTML = html;
  },

  // Función para mostrar información de sesión (debug)
  mostrarInfoSesion: function () {
    // Esta función necesitaría ser adaptada según el contexto
    alert(
      "Función de debug - necesita implementación específica según el contexto del sistema"
    );
  },

  // Función para controlar las luces del lector
  controlarLuces: function (action, duration = 0) {
    const container = document.getElementById("dispositivos-content");
    if (!container) return;

    // Mostrar indicador de carga
    container.insertAdjacentHTML(
      "afterbegin",
      '<div id="luces-loading" class="alert alert-info">' +
        '<div class="spinner-border spinner-border-sm me-2" role="status"></div>' +
        "Enviando comando de luces: <strong>" +
        action.toUpperCase() +
        "</strong>..." +
        "</div>"
    );

    // Realizar petición AJAX
    const url = window.location.href.includes("/biometric/")
      ? "../asistencia/controlar_luces_lector"
      : "./asistencia/controlar_luces_lector";

    fetch(url + "?action=" + action + "&duration=" + duration)
      .then((response) => response.json())
      .then((response) => {
        const loadingElement = document.getElementById("luces-loading");
        if (loadingElement) {
          loadingElement.remove();
        }

        if (response.success) {
          container.insertAdjacentHTML(
            "afterbegin",
            '<div class="alert alert-success alert-dismissible fade show">' +
              '<i class="fas fa-check-circle"></i> ' +
              "<strong>¡Éxito!</strong> " +
              response.message +
              (response.duration > 0
                ? " (duración: " + response.duration + "s)"
                : "") +
              '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
              "</div>"
          );

          // Auto-remover alerta después de 3 segundos
          setTimeout(function () {
            const alertElement = container.querySelector(".alert-success");
            if (alertElement) {
              alertElement.style.display = "none";
            }
          }, 3000);
        } else {
          container.insertAdjacentHTML(
            "afterbegin",
            '<div class="alert alert-warning alert-dismissible fade show">' +
              '<i class="fas fa-exclamation-triangle"></i> ' +
              "<strong>Advertencia:</strong> " +
              response.error +
              '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
              "</div>"
          );
        }
      })
      .catch((error) => {
        const loadingElement = document.getElementById("luces-loading");
        if (loadingElement) {
          loadingElement.remove();
        }

        container.insertAdjacentHTML(
          "afterbegin",
          '<div class="alert alert-danger alert-dismissible fade show">' +
            '<i class="fas fa-exclamation-circle"></i> ' +
            "<strong>Error:</strong> " +
            error.message +
            '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
            "</div>"
        );
      });
  },

  // Inicializar funciones del sistema base
  init: function () {
    // Actualizar la hora actual
    this.updateCurrentTime();
    setInterval(() => this.updateCurrentTime(), 60000);

    // Configurar AJAX
    this.setupAjax();
  },
};

// ========================================
// TERMINAL BIOMÉTRICO
// ========================================

/**
 * Sistema de Terminal Biométrico
 */
const BiometricTerminal = {
  isScanning: false,
  scanTimeout: null,

  // Inicializar terminal
  init: function () {
    this.initializeTerminal();
    this.startAutoScan();
    this.updateAttendanceSummary();

    // Actualizar cada 30 segundos
    setInterval(() => this.updateAttendanceSummary(), 30000);
  },

  // Inicializar terminal
  initializeTerminal: function () {
    this.checkDeviceStatus();
    this.resetScanner();
  },

  // Iniciar escaneo automático
  startAutoScan: function () {
    if (this.isScanning) return;

    setInterval(async () => {
      if (!this.isScanning) {
        await this.checkForFingerprint();
      }
    }, 1000);
  },

  // Verificar huella dactilar
  checkForFingerprint: async function () {
    try {
      const response = await fetch("/biometric/check_finger", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();

        if (data.finger_detected) {
          await this.processFingerprint();
        }
      }
    } catch (error) {
      console.error("Error checking fingerprint:", error);
    }
  },

  // Procesar huella dactilar
  processFingerprint: async function () {
    if (this.isScanning) return;

    this.isScanning = true;
    this.setStatus("scanning", "Escaneando huella dactilar...");

    try {
      // Capturar huella
      const captureResponse = await fetch("/biometric/capture", {
        method: "POST",
      });

      if (!captureResponse.ok) {
        throw new Error("Error al capturar huella");
      }

      const captureData = await captureResponse.json();

      // Verificar huella
      const verifyResponse = await fetch("/biometric/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hash: captureData.hash,
          template: captureData.template,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Huella no reconocida");
      }

      const verifyData = await verifyResponse.json();

      if (verifyData.verified) {
        // Marcar asistencia
        const attendanceResponse = await fetch("/biometric/mark_attendance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: verifyData.student.id_alumno,
            fingerprint_id: verifyData.fingerprint_id,
          }),
        });

        const attendanceData = await attendanceResponse.json();

        if (attendanceData.success) {
          this.showStudentSuccess(
            verifyData.student,
            attendanceData.already_present
          );
        } else {
          throw new Error(
            attendanceData.message || "Error al marcar asistencia"
          );
        }
      } else {
        throw new Error("Huella dactilar no reconocida");
      }
    } catch (error) {
      console.error("Error:", error);
      this.setStatus("error", error.message);
      setTimeout(() => this.resetScanner(), 3000);
    }
  },

  // Mostrar éxito de estudiante
  showStudentSuccess: function (student, alreadyPresent) {
    this.setStatus("success", "¡Reconocido!");

    // Mostrar información del estudiante
    const studentNameElement = document.getElementById("studentName");
    const studentCourseElement = document.getElementById("studentCourse");
    const attendanceStatusElement = document.getElementById("attendanceStatus");
    const studentInfoElement = document.getElementById("studentInfo");

    if (studentNameElement) {
      studentNameElement.textContent = `${student.nombre} ${student.apellido_paterno} ${student.apellido_materno}`;
    }

    if (studentCourseElement) {
      studentCourseElement.textContent = student.curso || "Curso no disponible";
    }

    if (attendanceStatusElement) {
      if (alreadyPresent) {
        attendanceStatusElement.textContent = "Ya estaba presente";
        attendanceStatusElement.className =
          "attendance-status status-ya-presente";
      } else {
        attendanceStatusElement.textContent = "Asistencia marcada";
        attendanceStatusElement.className = "attendance-status status-presente";
      }
    }

    if (studentInfoElement) {
      studentInfoElement.style.display = "block";
    }

    // Actualizar resumen
    this.updateAttendanceSummary();

    // Resetear después de 5 segundos
    setTimeout(() => {
      if (studentInfoElement) {
        studentInfoElement.style.display = "none";
      }
      this.resetScanner();
    }, 5000);
  },

  // Establecer estado del escáner
  setStatus: function (status, message) {
    const scanner = document.getElementById("fingerprintScanner");
    const statusMessage = document.getElementById("statusMessage");

    if (scanner) {
      // Limpiar clases anteriores
      scanner.classList.remove("scanning", "success", "error");

      // Agregar nueva clase
      if (status !== "idle") {
        scanner.classList.add(status);
      }
    }

    if (statusMessage) {
      statusMessage.textContent = message;
      statusMessage.className = `status-message text-${
        status === "error"
          ? "danger"
          : status === "success"
          ? "success"
          : "accent"
      }`;
    }
  },

  // Resetear escáner
  resetScanner: function () {
    this.isScanning = false;
    this.setStatus(
      "idle",
      "Coloque su dedo en el lector para marcar asistencia"
    );
  },

  // Verificar estado del dispositivo
  checkDeviceStatus: async function () {
    try {
      const response = await fetch("/biometric/device_status");
      const data = await response.json();

      const indicator = document.getElementById("deviceIndicator");
      const status = document.getElementById("deviceStatus");

      if (indicator && status) {
        if (data.connected) {
          indicator.className = "device-indicator device-connected";
          status.textContent = "Listo";
          status.className = "status-registered";
        } else {
          indicator.className = "device-indicator device-disconnected";
          status.textContent = "Desconectado";
          status.className = "status-pending";
          this.setStatus(
            "error",
            "Lector desconectado - Contacte al administrador"
          );
        }
      }
    } catch (error) {
      console.error("Error checking device status:", error);
      this.setStatus("error", "Error de conexión");
    }
  },

  // Actualizar resumen de asistencia
  updateAttendanceSummary: async function () {
    try {
      const response = await fetch("/biometric/attendance_summary");
      const data = await response.json();

      const presentElement = document.getElementById("presentCount");
      const absentElement = document.getElementById("absentCount");
      const totalElement = document.getElementById("totalCount");

      if (presentElement) presentElement.textContent = data.presentes || 0;
      if (absentElement) absentElement.textContent = data.ausentes || 0;
      if (totalElement) totalElement.textContent = data.total || 0;
    } catch (error) {
      console.error("Error updating attendance summary:", error);
    }
  },
};

// ========================================
// PANEL DE ADMINISTRACIÓN BIOMÉTRICO
// ========================================

/**
 * Panel de Administración de Huellas
 */
const BiometricAdmin = {
  currentStudentId: null,
  isCapturing: false,

  // Inicializar panel
  init: function () {
    this.attachEventListeners();
    this.checkDeviceStatus();
    setInterval(() => this.checkDeviceStatus(), 5000);
  },

  // Adjuntar event listeners
  attachEventListeners: function () {
    // Botón de iniciar captura
    const startCaptureBtn = document.getElementById("startCapture");
    if (startCaptureBtn) {
      startCaptureBtn.addEventListener("click", () => {
        if (this.isCapturing) return;

        const fingerType =
          document.getElementById("fingerType")?.value || "indice_derecho";
        this.startFingerprintCapture(this.currentStudentId, fingerType);
      });
    }

    // Búsqueda de estudiantes
    const searchInput = document.getElementById("searchStudent");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const students = document.querySelectorAll("[data-student-name]");

        students.forEach((student) => {
          const name = student.getAttribute("data-student-name").toLowerCase();
          student.style.display = name.includes(searchTerm) ? "block" : "none";
        });
      });
    }
  },

  // Función para registrar huella
  registerFingerprint: function (studentId, studentName) {
    this.currentStudentId = studentId;
    const studentNameElement = document.getElementById("studentName");
    if (studentNameElement) {
      studentNameElement.textContent = `Alumno: ${studentName}`;
    }
    this.resetModal();
    const modal = new bootstrap.Modal(document.getElementById("captureModal"));
    modal.show();
  },

  // Función para actualizar huella
  updateFingerprint: function (studentId, studentName) {
    if (
      confirm("¿Está seguro de que desea actualizar la huella de este alumno?")
    ) {
      this.registerFingerprint(studentId, studentName);
    }
  },

  // Resetear modal
  resetModal: function () {
    const captureStatus = document.getElementById("captureStatus");
    const captureProgress = document.getElementById("captureProgress");
    const captureResult = document.getElementById("captureResult");
    const fingerprintIcon = document.getElementById("fingerprintIcon");
    const startCapture = document.getElementById("startCapture");

    if (captureStatus) captureStatus.style.display = "block";
    if (captureProgress) captureProgress.style.display = "none";
    if (captureResult) captureResult.style.display = "none";
    if (fingerprintIcon) fingerprintIcon.className = "fas fa-fingerprint";
    if (startCapture) startCapture.disabled = false;

    this.isCapturing = false;
  },

  // Función de captura de huella
  startFingerprintCapture: async function (studentId, fingerType) {
    this.isCapturing = true;
    const startCapture = document.getElementById("startCapture");
    const captureStatus = document.getElementById("captureStatus");
    const captureProgress = document.getElementById("captureProgress");

    if (startCapture) startCapture.disabled = true;
    if (captureStatus) captureStatus.style.display = "none";
    if (captureProgress) captureProgress.style.display = "block";

    try {
      // Paso 1: Inicializar dispositivo
      this.updateProgress(20, "Inicializando lector de huellas...");
      await fetch("/biometric/init_device", { method: "POST" });

      // Paso 2: Capturar huella
      this.updateProgress(50, "Esperando huella dactilar...");
      const captureResponse = await fetch("/biometric/capture", {
        method: "POST",
      });

      if (!captureResponse.ok) {
        throw new Error("Error en la captura de huella");
      }

      const captureData = await captureResponse.json();

      // Paso 3: Registrar en base de datos
      this.updateProgress(80, "Procesando y guardando huella...");
      const registerResponse = await fetch("/biometric/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          finger_type: fingerType,
          template: captureData.template,
          hash: captureData.hash,
          quality: captureData.quality,
        }),
      });

      if (!registerResponse.ok) {
        throw new Error("Error al registrar la huella");
      }

      // Éxito
      this.updateProgress(100, "¡Huella registrada exitosamente!");
      setTimeout(() => {
        this.showResult(true, "Huella dactilar registrada correctamente");
        setTimeout(() => {
          location.reload();
        }, 2000);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      this.showResult(false, error.message);
    }
  },

  // Actualizar progreso
  updateProgress: function (percentage, text) {
    const progressBar = document.querySelector(".progress-bar");
    const progressText = document.getElementById("progressText");

    if (progressBar) {
      progressBar.style.width = percentage + "%";
    }
    if (progressText) {
      progressText.textContent = text;
    }
  },

  // Mostrar resultado
  showResult: function (success, message) {
    const captureProgress = document.getElementById("captureProgress");
    const captureResult = document.getElementById("captureResult");

    if (captureProgress) captureProgress.style.display = "none";
    if (captureResult) {
      captureResult.style.display = "block";
      captureResult.innerHTML = `
                <div class="alert ${
                  success ? "alert-success" : "alert-danger"
                }" role="alert">
                    <i class="fas ${
                      success ? "fa-check-circle" : "fa-exclamation-circle"
                    }"></i>
                    ${message}
                </div>
            `;
    }

    this.isCapturing = false;
  },

  // Verificar estado del dispositivo
  checkDeviceStatus: async function () {
    try {
      const response = await fetch("/biometric/device_status");
      const data = await response.json();

      const indicator = document.getElementById("deviceIndicator");
      const status = document.getElementById("deviceStatus");

      if (indicator && status) {
        if (data.connected) {
          indicator.className = "device-indicator device-connected";
          status.textContent = "Conectado";
          status.className = "status-registered";
        } else {
          indicator.className = "device-indicator device-disconnected";
          status.textContent = "Desconectado";
          status.className = "status-pending";
        }
      }
    } catch (error) {
      console.error("Error checking device status:", error);
    }
  },
};

// ========================================
// GESTIÓN DE ALUMNOS
// ========================================

/**
 * Sistema de Gestión de Alumnos
 */
const StudentManager = {
  editandoAlumno: false,

  // Inicializar gestor
  init: function () {
    this.attachEventListeners();
  },

  // Adjuntar event listeners
  attachEventListeners: function () {
    // Aquí se pueden agregar event listeners específicos si es necesario
  },

  // Limpiar formulario
  limpiarFormulario: function () {
    const form = document.getElementById("form-alumno");
    const alumnoId = document.getElementById("alumno-id");
    const modalTitle = document.getElementById("modal-title");

    if (form) form.reset();
    if (alumnoId) alumnoId.value = "";
    if (modalTitle) modalTitle.textContent = "Nuevo Alumno";

    this.editandoAlumno = false;
  },

  // Editar alumno
  editarAlumno: function (id) {
    this.editandoAlumno = true;
    const modalTitle = document.getElementById("modal-title");
    if (modalTitle) modalTitle.textContent = "Editar Alumno";

    // Obtener datos del alumno
    fetch(`/admin/alumnos/${id}/editar`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const alumno = data.alumno;
          this.fillForm(alumno);

          // Mostrar modal
          const modal = new bootstrap.Modal(
            document.getElementById("modal-alumno")
          );
          modal.show();
        } else {
          Utils.showToast(data.message, "error");
        }
      })
      .catch((error) => {
        Utils.showToast("Error al cargar los datos del alumno", "error");
      });
  },

  // Llenar formulario con datos del alumno
  fillForm: function (alumno) {
    const fields = [
      "alumno-id",
      "rut",
      "nombre",
      "apellido",
      "email",
      "telefono",
      "fecha_nacimiento",
      "direccion",
      "id_curso",
      "fecha_ingreso",
    ];

    fields.forEach((field) => {
      const element = document.getElementById(field);
      if (element && alumno[field.replace("-", "_")] !== undefined) {
        element.value = alumno[field.replace("-", "_")] || "";
      }
    });
  },

  // Guardar alumno
  guardarAlumno: function () {
    const form = document.getElementById("form-alumno");
    if (!form) return;

    const formData = new FormData(form);

    // Validaciones
    if (
      !formData.get("rut") ||
      !formData.get("nombre") ||
      !formData.get("apellido") ||
      !formData.get("id_curso")
    ) {
      Utils.showToast(
        "Por favor complete todos los campos obligatorios",
        "error"
      );
      return;
    }

    const url = this.editandoAlumno
      ? `/admin/alumnos/${formData.get("id_alumno")}/editar`
      : "/admin/alumnos/crear";

    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          Utils.showToast(data.message, "success");

          // Cerrar modal y recargar tabla
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("modal-alumno")
          );
          if (modal) modal.hide();
          location.reload();
        } else {
          Utils.showToast(data.message, "error");
        }
      })
      .catch((error) => {
        Utils.showToast("Error al guardar el alumno", "error");
      });
  },

  // Eliminar alumno
  eliminarAlumno: function (id) {
    if (!confirm("¿Está seguro de que desea eliminar este alumno?")) {
      return;
    }

    fetch(`/admin/alumnos/${id}/eliminar`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          Utils.showToast(data.message, "success");
          location.reload();
        } else {
          Utils.showToast(data.message, "error");
        }
      })
      .catch((error) => {
        Utils.showToast("Error al eliminar el alumno", "error");
      });
  },

  // Ver detalles de alumno
  verDetalles: function (id) {
    fetch(`/admin/alumnos/${id}/editar`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Implementar modal de detalles aquí
          console.log("Detalles del alumno:", data.alumno);
        } else {
          Utils.showToast(data.message, "error");
        }
      })
      .catch((error) => {
        Utils.showToast("Error al cargar los detalles del alumno", "error");
      });
  },
};

// ========================================
// SISTEMA DE ASISTENCIA
// ========================================

/**
 * Sistema Principal de Asistencia
 */
const AttendanceSystem = {
  // Inicializar sistema
  init: function () {
    this.cargarResumenDia();
    this.configurarBusquedaAlumnos();
  },

  // Cargar resumen del día
  cargarResumenDia: function () {
    // Cargar datos reales desde el servidor
    fetch("/asistencia/resumen-dia")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          this.actualizarResumen(data.data);
        }
      })
      .catch((error) => {
        console.error("Error cargando resumen del día:", error);
        // Valores por defecto en caso de error
        this.actualizarResumen({
          total_presentes: 0,
          total_ausentes: 0,
          total_tardanzas: 0,
          total_justificados: 0,
        });
      });
  },

  // Actualizar resumen en la interfaz
  actualizarResumen: function (data) {
    const elements = {
      "total-presentes": data.total_presentes,
      "total-ausentes": data.total_ausentes,
      "total-tardanzas": data.total_tardanzas,
      "total-justificados": data.total_justificados,
    };

    Object.keys(elements).forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = elements[id];
      }
    });

    // Calcular porcentaje de asistencia
    const total =
      data.total_presentes +
      data.total_ausentes +
      data.total_tardanzas +
      data.total_justificados;
    const presentes =
      data.total_presentes + data.total_tardanzas + data.total_justificados;
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;

    const porcentajeElement = document.getElementById("porcentaje-asistencia");
    const progressElement = document.getElementById("progress-asistencia");

    if (porcentajeElement) porcentajeElement.textContent = porcentaje + "%";
    if (progressElement) progressElement.style.width = porcentaje + "%";
  },

  // Configurar búsqueda de alumnos
  configurarBusquedaAlumnos: function () {
    const searchInput = document.getElementById("buscar-alumno-input");
    if (!searchInput) return;

    searchInput.addEventListener(
      "input",
      Utils.debounce((e) => {
        const term = e.target.value.trim();

        if (term.length < 2) {
          this.limpiarResultadosBusqueda();
          return;
        }

        this.buscarAlumnos(term);
      }, 300)
    );
  },

  // Buscar alumnos
  buscarAlumnos: function (term) {
    fetch("/asistencia/buscar_alumno?term=" + encodeURIComponent(term))
      .then((response) => response.json())
      .then((data) => {
        this.mostrarResultadosBusqueda(data);
      })
      .catch((error) => {
        const container = document.getElementById("resultados-busqueda");
        if (container) {
          container.innerHTML =
            '<div class="alert alert-warning">Error al buscar alumnos</div>';
        }
      });
  },

  // Mostrar resultados de búsqueda
  mostrarResultadosBusqueda: function (alumnos) {
    const container = document.getElementById("resultados-busqueda");
    if (!container) return;

    container.innerHTML = "";

    if (alumnos.length === 0) {
      container.innerHTML =
        '<div class="alert alert-info">No se encontraron alumnos</div>';
      return;
    }

    const listGroup = document.createElement("div");
    listGroup.className = "list-group";

    alumnos.forEach((alumno) => {
      const item = document.createElement("a");
      item.href = `/asistencia/detalle_alumno/${alumno.id}`;
      item.className = "list-group-item list-group-item-action";
      item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${alumno.nombre} ${alumno.apellido}</h6>
                    <small class="text-muted">${alumno.rut}</small>
                </div>
            `;
      listGroup.appendChild(item);
    });

    container.appendChild(listGroup);
  },

  // Limpiar resultados de búsqueda
  limpiarResultadosBusqueda: function () {
    const container = document.getElementById("resultados-busqueda");
    if (container) {
      container.innerHTML = "";
    }
  },
};

// ========================================
// INICIALIZACIÓN GLOBAL
// ========================================

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener("DOMContentLoaded", function () {
  // Inicializar tooltips de Bootstrap
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Inicializar popovers de Bootstrap
  const popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]')
  );
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  // Inicializar sistemas base
  if (!window.ThemeManager || !window.ThemeManager.initialized) {
    console.log("🚀 Inicializando ThemeManager desde unified-app.js...");
    ThemeManager.init();
    ThemeManager.initialized = true;
  } else {
    console.log("ℹ️ ThemeManager ya está inicializado");
  }
  BaseSystem.init();

  // Inicializar sistemas específicos según la página
  const currentPath = window.location.pathname;

  if (
    currentPath.includes("/biometric/terminal") ||
    currentPath.includes("/fingerprint/terminal")
  ) {
    BiometricTerminal.init();
  }

  if (
    currentPath.includes("/biometric/admin") ||
    currentPath.includes("/fingerprint/admin")
  ) {
    BiometricAdmin.init();
  }

  if (
    currentPath.includes("/admin/alumnos") ||
    currentPath.includes("/admin/gestionar_alumnos")
  ) {
    StudentManager.init();
  }

  if (
    currentPath.includes("/asistencia/") &&
    !currentPath.includes("/detalle_")
  ) {
    AttendanceSystem.init();
  }

  // Mostrar mensaje de bienvenida si es la primera visita
  if (localStorage.getItem("firstVisit") !== "false") {
    setTimeout(() => {
      Utils.showSuccess("¡Bienvenido al Sistema de Asistencia Colegio AML!");
      localStorage.setItem("firstVisit", "false");
    }, 1000);
  }

  // Actualizar reloj en tiempo real si existe
  const timeDisplay = document.querySelector(".time-display");
  if (timeDisplay) {
    const updateClock = () => {
      timeDisplay.textContent = new Date().toLocaleTimeString("es-CL");
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Manejar eventos de conexión
  window.addEventListener("online", function () {
    Utils.showSuccess("Conexión restaurada");
  });

  window.addEventListener("offline", function () {
    Utils.showWarning("Sin conexión a internet");
  });
});

// ========================================
// MÓDULO 11: DETALLE DE CURSO
// ========================================

const CourseDetail = {
  // Inicializar búsqueda de estudiantes
  initStudentSearch: function () {
    const searchInput = document.getElementById("buscar-estudiante");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterStudents(e.target.value);
      });
    }
  },

  // Filtrar estudiantes
  filterStudents: function (searchTerm) {
    const term = searchTerm.toLowerCase();
    const rows = document.querySelectorAll("#tabla-estudiantes tbody tr");

    rows.forEach((row) => {
      const nombre = row.getAttribute("data-nombre");
      const textoCompleto = row.textContent.toLowerCase();

      if (
        (nombre && nombre.toLowerCase().includes(term)) ||
        textoCompleto.includes(term)
      ) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  },

  // Editar estudiante
  editarEstudiante: function (idAlumno) {
    // Redirigir a la página de gestión de alumnos con el alumno seleccionado
    window.location.href = `/admin/alumnos?edit=${idAlumno}`;
  },

  // Inicializar el módulo
  init: function () {
    document.addEventListener("DOMContentLoaded", () => {
      this.initStudentSearch();
    });
  },
};

// Inicializar CourseDetail
CourseDetail.init();

// ========================================
// EXPORTAR THEMEMANAGER AL SCOPE GLOBAL
// ========================================

// Hacer que ThemeManager esté disponible globalmente
window.ThemeManager = ThemeManager;

// ========================================
// FUNCIONES GLOBALES - WRAPPERS
// ========================================

/**
 * Funciones globales para hacer compatibles los onclick en HTML
 * Estas funcionan como wrappers para las funciones de los módulos
 */

// Funciones del sistema base
function detectarDispositivos() {
  BaseSystem.detectarDispositivos();
}

function mostrarInfoSesion() {
  BaseSystem.mostrarInfoSesion();
}

// Funciones de gestión de alumnos
function editarAlumno(id) {
  StudentManager.editarAlumno(id);
}

function eliminarAlumno(id) {
  StudentManager.eliminarAlumno(id);
}

function verDetalles(id) {
  StudentManager.verDetalles(id);
}

function guardarAlumno() {
  StudentManager.guardarAlumno();
}

function limpiarFormulario() {
  StudentManager.limpiarFormulario();
}

// Funciones de gestión de cursos (necesitan ser definidas en curso_controller)
function editarCurso(id) {
  if (typeof CourseManager !== "undefined" && CourseManager.editarCurso) {
    CourseManager.editarCurso(id);
  } else {
    Utils.showWarning("Función de editar curso en desarrollo");
  }
}

function eliminarCurso(id) {
  if (typeof CourseManager !== "undefined" && CourseManager.eliminarCurso) {
    CourseManager.eliminarCurso(id);
  } else {
    Utils.showWarning("Función de eliminar curso en desarrollo");
  }
}

function guardarCurso() {
  if (typeof CourseManager !== "undefined" && CourseManager.guardarCurso) {
    CourseManager.guardarCurso();
  } else {
    Utils.showWarning("Función de guardar curso en desarrollo");
  }
}

// Funciones de detalle de curso
function editarEstudiante(id) {
  CourseDetail.editarEstudiante(id);
}

// Funciones biométricas
function registerFingerprint(studentId, studentName) {
  if (
    typeof BiometricAdmin !== "undefined" &&
    BiometricAdmin.registerFingerprint
  ) {
    BiometricAdmin.registerFingerprint(studentId, studentName);
  } else {
    Utils.showWarning("Sistema biométrico no disponible");
  }
}

function updateFingerprint(studentId, studentName) {
  if (
    typeof BiometricAdmin !== "undefined" &&
    BiometricAdmin.updateFingerprint
  ) {
    BiometricAdmin.updateFingerprint(studentId, studentName);
  } else {
    Utils.showWarning("Sistema biométrico no disponible");
  }
}

// Funciones de asistencia
function marcarAsistenciaRapida(idAlumno, nombreAlumno) {
  if (
    typeof AttendanceByCourse !== "undefined" &&
    AttendanceByCourse.marcarAsistenciaRapida
  ) {
    AttendanceByCourse.marcarAsistenciaRapida(idAlumno, nombreAlumno);
  } else {
    Utils.showWarning("Función de asistencia rápida en desarrollo");
  }
}

function guardarAsistenciaRapida() {
  if (
    typeof AttendanceByCourse !== "undefined" &&
    AttendanceByCourse.guardarAsistenciaRapida
  ) {
    AttendanceByCourse.guardarAsistenciaRapida();
  } else {
    Utils.showWarning("Función de guardar asistencia rápida en desarrollo");
  }
}

function mostrarModalMarcarTodos() {
  if (
    typeof AttendanceByCourse !== "undefined" &&
    AttendanceByCourse.mostrarModalMarcarTodos
  ) {
    AttendanceByCourse.mostrarModalMarcarTodos();
  } else {
    Utils.showWarning("Función de marcar todos en desarrollo");
  }
}

// Funciones de perfil de usuario
function editarPerfil() {
  if (typeof AuthForms !== "undefined" && AuthForms.editarPerfil) {
    AuthForms.editarPerfil();
  } else {
    Utils.showWarning("Función de editar perfil en desarrollo");
  }
}

function cambiarPassword() {
  if (typeof AuthForms !== "undefined" && AuthForms.cambiarPassword) {
    AuthForms.cambiarPassword();
  } else {
    Utils.showWarning("Función de cambiar contraseña en desarrollo");
  }
}

function configurar2FA() {
  if (typeof AuthForms !== "undefined" && AuthForms.configurar2FA) {
    AuthForms.configurar2FA();
  } else {
    Utils.showWarning("Función de 2FA en desarrollo");
  }
}

function guardarPreferencias() {
  if (typeof AuthForms !== "undefined" && AuthForms.guardarPreferencias) {
    AuthForms.guardarPreferencias();
  } else {
    Utils.showWarning("Función de guardar preferencias en desarrollo");
  }
}

function confirmarCambioPassword() {
  if (typeof AuthForms !== "undefined" && AuthForms.confirmarCambioPassword) {
    AuthForms.confirmarCambioPassword();
  } else {
    Utils.showWarning(
      "Función de confirmar cambio de contraseña en desarrollo"
    );
  }
}

// Funciones de marcado de asistencia
function limpiarFormularioAsistencia() {
  if (
    typeof AttendanceMarker !== "undefined" &&
    AttendanceMarker.limpiarFormulario
  ) {
    AttendanceMarker.limpiarFormulario();
  } else {
    Utils.showWarning("Función de limpiar formulario en desarrollo");
  }
}

function marcarHoraActual() {
  if (
    typeof AttendanceMarker !== "undefined" &&
    AttendanceMarker.marcarHoraActual
  ) {
    AttendanceMarker.marcarHoraActual();
  } else {
    Utils.showWarning("Función de marcar hora actual en desarrollo");
  }
}

function marcarPresente() {
  if (
    typeof AttendanceMarker !== "undefined" &&
    AttendanceMarker.marcarPresente
  ) {
    AttendanceMarker.marcarPresente();
  } else {
    Utils.showWarning("Función de marcar presente en desarrollo");
  }
}

// ========================================
// DEBUGGING Y UTILIDADES GLOBALES
// ========================================

/**
 * Función para debug - mostrar todos los módulos cargados
 */
function mostrarModulosCargados() {
  console.log("=== MÓDULOS CARGADOS ===");
  console.log("Utils:", typeof Utils !== "undefined" ? "✓" : "✗");
  console.log("ThemeManager:", typeof ThemeManager !== "undefined" ? "✓" : "✗");
  console.log("BaseSystem:", typeof BaseSystem !== "undefined" ? "✓" : "✗");
  console.log(
    "BiometricTerminal:",
    typeof BiometricTerminal !== "undefined" ? "✓" : "✗"
  );
  console.log(
    "BiometricAdmin:",
    typeof BiometricAdmin !== "undefined" ? "✓" : "✗"
  );
  console.log(
    "StudentManager:",
    typeof StudentManager !== "undefined" ? "✓" : "✗"
  );
  console.log(
    "AttendanceSystem:",
    typeof AttendanceSystem !== "undefined" ? "✓" : "✗"
  );
  console.log("CourseDetail:", typeof CourseDetail !== "undefined" ? "✓" : "✗");
  console.log(
    "AttendanceByCourse:",
    typeof AttendanceByCourse !== "undefined" ? "✓" : "✗"
  );
  console.log(
    "AttendanceMarker:",
    typeof AttendanceMarker !== "undefined" ? "✓" : "✗"
  );
  console.log("AuthForms:", typeof AuthForms !== "undefined" ? "✓" : "✗");
  console.log("========================");

  Utils.showSuccess(
    "Estado de módulos mostrado en consola. Presiona F12 para ver detalles."
  );
}

/**
 * Función para probar todas las funciones globales
 */
function probarFunciones() {
  console.log("=== PROBANDO FUNCIONES GLOBALES ===");

  // Probar cada función global
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
  Utils.showSuccess(
    "Prueba de funciones completada. Revisa la consola para ver los resultados."
  );
}

// ========================================
// MÓDULO 10: ASISTENCIA POR CURSO
// ========================================

const AttendanceByCourse = {
  // Marcar asistencia rápida
  marcarAsistenciaRapida: function (idAlumno, nombreAlumno) {
    const rapidIdAlumno = $("#rapid_id_alumno");
    const rapidNombreAlumno = $("#rapid_nombre_alumno");
    const rapidHoraLlegada = $("#rapid_hora_llegada");
    const modal = $("#modalAsistenciaRapida");

    if (rapidIdAlumno.length) {
      rapidIdAlumno.val(idAlumno);
    }
    if (rapidNombreAlumno.length) {
      rapidNombreAlumno.text(nombreAlumno);
    }

    // Establecer hora actual
    const now = new Date();
    const timeString =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");
    if (rapidHoraLlegada.length) {
      rapidHoraLlegada.val(timeString);
    }

    if (modal.length) {
      modal.modal("show");
    }
  },

  // Guardar asistencia rápida
  guardarAsistenciaRapida: function () {
    const form = $("#formAsistenciaRapida");
    if (!form.length) return;

    const formData = new FormData(form[0]);

    $.ajax({
      url: "/asistencia/marcar",
      method: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        const modal = $("#modalAsistenciaRapida");
        if (modal.length) {
          modal.modal("hide");
        }
        AttendanceByCourse.mostrarNotificacion(
          "Asistencia marcada correctamente",
          "success"
        );
        // Recargar la página para ver los cambios
        setTimeout(() => location.reload(), 1000);
      },
      error: function (xhr) {
        AttendanceByCourse.mostrarNotificacion(
          "Error al marcar asistencia",
          "error"
        );
      },
    });
  },

  // Mostrar modal para marcar todos
  mostrarModalMarcarTodos: function () {
    // Implementar funcionalidad para marcar asistencia masiva
    Utils.showToast(
      "Funcionalidad en desarrollo: Marcar asistencia para todo el curso",
      "info"
    );
  },

  // Mostrar notificación
  mostrarNotificacion: function (mensaje, tipo) {
    const alertClass = tipo === "success" ? "alert-success" : "alert-danger";
    const icon =
      tipo === "success"
        ? "fas fa-check-circle"
        : "fas fa-exclamation-triangle";

    const alert = $(`
      <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
          <i class="${icon}"></i> ${mensaje}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `);

    const container = $(".container");
    if (container.length) {
      container.prepend(alert);
    }

    setTimeout(function () {
      alert.fadeOut();
    }, 5000);
  },
};

// ========================================
// MÓDULO 9: MARCADO DE ASISTENCIA
// ========================================

const AttendanceMarker = {
  // Configurar autocompletado para búsqueda de alumnos
  configurarAutocompletado: function () {
    console.log("🔧 Verificando configuración de autocompletado...");

    const alumnoSearch = $("#alumno-search");
    const idAlumno = $("#id_alumno");
    const infoAlumno = $("#info-alumno");

    console.log("  Elementos encontrados:");
    console.log("    #alumno-search:", alumnoSearch.length > 0 ? "✅" : "❌");
    console.log("    #id_alumno:", idAlumno.length > 0 ? "✅" : "❌");
    console.log("    #info-alumno:", infoAlumno.length > 0 ? "✅" : "❌");

    // El autocompletado ya está configurado por global-functions.js
    // Solo verificamos que los elementos existan
    if (alumnoSearch.length && idAlumno.length) {
      console.log("✅ Autocompletado delegado a global-functions.js");

      // Agregar un listener adicional para verificar cuando se establezca el ID
      const checkInterval = setInterval(() => {
        if (idAlumno.val()) {
          console.log("🎯 ID del alumno detectado:", idAlumno.val());
          clearInterval(checkInterval);
        }
      }, 500);

      // Limpiar el intervalo después de 10 segundos
      setTimeout(() => clearInterval(checkInterval), 10000);
    } else {
      console.error("❌ Elementos del autocompletado no encontrados");
    }
  },

  // Mostrar información del alumno seleccionado
  mostrarInfoAlumno: function (alumno) {
    console.log("📄 Mostrando información del alumno:", alumno);

    const html = `
      <div class="card border-0 shadow-sm">
          <div class="card-body">
              <h6 class="card-title text-primary">
                  <i class="fas fa-user"></i> Alumno Seleccionado
              </h6>
              <p class="mb-1"><strong>Nombre:</strong> ${
                alumno.label ||
                alumno.value ||
                `${alumno.nombre} ${alumno.apellido}`
              }</p>
              <p class="mb-1"><strong>Email:</strong> ${
                alumno.email || "No disponible"
              }</p>
              <p class="mb-0"><strong>Curso:</strong> ${
                alumno.curso || "No disponible"
              }</p>
              <small class="text-muted">ID: ${alumno.id}</small>
          </div>
      </div>
    `;

    const datosAlumno = $("#datos-alumno");
    const infoAlumno = $("#info-alumno");

    if (datosAlumno.length) {
      datosAlumno.html(html);
    }
    if (infoAlumno.length) {
      infoAlumno.show();
    }

    // Asegurar que el ID esté establecido (método de respaldo)
    const idAlumno = $("#id_alumno");
    if (idAlumno.length && alumno.id) {
      idAlumno.val(alumno.id);
      console.log("🔒 ID del alumno confirmado (respaldo):", alumno.id);
    }
  },

  // Método de respaldo para seleccionar alumno manualmente
  seleccionarAlumno: function (id, nombre, email, curso) {
    console.log("🎯 Seleccionando alumno manualmente:", {
      id,
      nombre,
      email,
      curso,
    });

    const idAlumno = $("#id_alumno");
    const alumnoSearch = $("#alumno-search");

    if (idAlumno.length) {
      idAlumno.val(id);
      console.log("✅ ID establecido manualmente:", id);
    }

    if (alumnoSearch.length) {
      alumnoSearch.val(nombre);
    }

    this.mostrarInfoAlumno({
      id: id,
      label: nombre,
      email: email,
      curso: curso,
    });
  },

  // Marcar hora actual
  marcarHoraActual: function () {
    const now = new Date();
    const hora = now.getHours().toString().padStart(2, "0");
    const minutos = now.getMinutes().toString().padStart(2, "0");
    const horaLlegada = $("#hora_llegada");

    if (horaLlegada.length) {
      horaLlegada.val(`${hora}:${minutos}`);
    }
  },

  // Marcar presente
  marcarPresente: function () {
    const estado = $("#estado");
    if (estado.length) {
      estado.val("presente");
    }
  },

  // Limpiar formulario
  limpiarFormulario: function () {
    const form = $("#form-asistencia");
    const idAlumno = $("#id_alumno");
    const infoAlumno = $("#info-alumno");
    const fecha = $("#fecha");

    if (form.length) {
      form[0].reset();
    }
    if (idAlumno.length) {
      idAlumno.val("");
    }
    if (infoAlumno.length) {
      infoAlumno.hide();
    }

    // Restaurar fecha actual (usar atributo data o valor por defecto)
    if (fecha.length) {
      const fechaActual =
        fecha.data("fecha-actual") || new Date().toISOString().split("T")[0];
      fecha.val(fechaActual);
    }

    this.marcarHoraActual();
  },

  // Función de debugging para verificar estado del formulario
  debugFormulario: function () {
    console.log("=== DEBUG FORMULARIO ===");
    console.log("Elementos del formulario:");
    console.log("  #alumno-search existe:", $("#alumno-search").length > 0);
    console.log("  #alumno-search valor:", $("#alumno-search").val());
    console.log("  #id_alumno existe:", $("#id_alumno").length > 0);
    console.log("  #id_alumno valor:", $("#id_alumno").val());
    console.log("  #fecha existe:", $("#fecha").length > 0);
    console.log("  #fecha valor:", $("#fecha").val());
    console.log("  #estado existe:", $("#estado").length > 0);
    console.log("  #estado valor:", $("#estado").val());

    const form = $("#form-asistencia");
    if (form.length) {
      const formData = new FormData(form[0]);
      console.log("Datos del formulario:");
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }
    }
    console.log("=== FIN DEBUG ===");
  },

  // Marcar asistencia
  marcarAsistencia: function () {
    console.log("=== INICIO marcarAsistencia ===");

    const form = $("#form-asistencia");
    const idAlumno = $("#id_alumno");
    const alumnoSearch = $("#alumno-search");

    if (!form.length) {
      console.error("❌ Formulario #form-asistencia no encontrado");
      return;
    }

    console.log("✅ Formulario encontrado");

    // Validar que se haya seleccionado un alumno
    if (!idAlumno.val()) {
      console.error("❌ No se ha seleccionado un alumno");
      if (alumnoSearch.length) {
        alumnoSearch.addClass("is-invalid");
      }
      // No mostrar notificación JavaScript ya que el servidor enviará un flash message
      return;
    } else {
      console.log("✅ Alumno seleccionado:", idAlumno.val());
      if (alumnoSearch.length) {
        alumnoSearch.removeClass("is-invalid");
      }
    }

    // Debug: verificar valores de campos individuales
    console.log("🔍 Valores de campos del formulario:");
    console.log("  id_alumno:", $("#id_alumno").val());
    console.log("  fecha:", $("#fecha").val());
    console.log("  estado:", $("#estado").val());
    console.log("  hora_llegada:", $("#hora_llegada").val());
    console.log("  observaciones:", $("#observaciones").val());

    const formData = new FormData(form[0]);

    // Debug: mostrar datos que se van a enviar
    console.log("📤 Enviando datos de asistencia:");
    for (let pair of formData.entries()) {
      console.log(`  ${pair[0]}: ${pair[1]}`);
    }

    // Validar campos requeridos
    const requiredFields = ["id_alumno", "fecha", "estado"];
    let hasErrors = false;

    for (let field of requiredFields) {
      if (!formData.get(field)) {
        console.error(`❌ Campo requerido faltante: ${field}`);
        hasErrors = true;
      }
    }

    if (hasErrors) {
      // No mostrar notificación JavaScript ya que el servidor enviará un flash message
      return;
    }

    console.log("📡 Iniciando petición AJAX...");

    $.ajax({
      url: "/asistencia/marcar",
      method: "POST",
      data: formData,
      processData: false,
      contentType: false,
      beforeSend: function () {
        console.log("🔄 Enviando petición...");
      },
      success: function (response) {
        console.log("✅ Respuesta exitosa:", response);
        // No mostrar notificación JavaScript ya que el servidor maneja redirects y flash messages
        AttendanceMarker.limpiarFormulario();
        AttendanceMarker.cargarEstadisticasHoy();

        // Si el response es HTML (redirect), recargar la página
        if (
          typeof response === "string" &&
          response.includes("<!DOCTYPE html>")
        ) {
          window.location.reload();
        }
      },
      error: function (xhr, status, error) {
        console.error("❌ Error en petición:");
        console.error("  Status:", xhr.status);
        console.error("  Status Text:", xhr.statusText);
        console.error("  Response Text:", xhr.responseText);
        console.error("  Error:", error);

        // No mostrar notificación JavaScript ya que el servidor enviará un flash message
        // Si hay un redirect (302), recargar la página para mostrar el flash message
        if (xhr.status === 302 || xhr.status === 0) {
          window.location.reload();
        }
      },
      complete: function () {
        console.log("🔚 Petición completada");
      },
    });
  },

  // Mostrar notificación
  mostrarNotificacion: function (mensaje, tipo) {
    const alertClass = tipo === "success" ? "alert-success" : "alert-danger";
    const icon =
      tipo === "success"
        ? "fas fa-check-circle"
        : "fas fa-exclamation-triangle";

    const alert = $(`
      <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
          <i class="${icon}"></i> ${mensaje}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `);

    const container = $(".container");
    if (container.length) {
      container.prepend(alert);
    }

    // Auto-dismiss después de 5 segundos
    setTimeout(function () {
      alert.fadeOut();
    }, 5000);
  },

  // Cargar estadísticas del día
  cargarEstadisticasHoy: function () {
    // Cargar datos reales desde el servidor
    $.get("/asistencia/estadisticas_hoy")
      .done(function (data) {
        const countPresentes = $("#count-presentes");
        const countAusentes = $("#count-ausentes");

        if (countPresentes.length) {
          countPresentes.text(data.presentes || 0);
        }
        if (countAusentes.length) {
          countAusentes.text(data.ausentes || 0);
        }
      })
      .fail(function () {
        console.error("Error al cargar estadísticas del día");
        // Valores por defecto en caso de error
        const countPresentes = $("#count-presentes");
        const countAusentes = $("#count-ausentes");

        if (countPresentes.length) {
          countPresentes.text("0");
        }
        if (countAusentes.length) {
          countAusentes.text("0");
        }
      });
  },

  // Inicializar el módulo
  init: function () {
    $(document).ready(() => {
      // Configurar autocompletado para búsqueda de alumnos
      this.configurarAutocompletado();

      // Marcar hora actual por defecto
      this.marcarHoraActual();

      // Manejar envío del formulario
      const form = $("#form-asistencia");
      if (form.length) {
        form.on("submit", (e) => {
          e.preventDefault();
          this.marcarAsistencia();
        });
      }

      // Event listeners para botones
      $("#btn-limpiar-formulario").on("click", () => {
        this.limpiarFormulario();
      });

      $("#btn-marcar-hora-actual").on("click", () => {
        this.marcarHoraActual();
      });

      $("#btn-marcar-presente").on("click", () => {
        this.marcarPresente();
      });

      // Cargar estadísticas del día
      this.cargarEstadisticasHoy();

      // Hacer debugging disponible globalmente
      window.debugAsistencia = () => this.debugFormulario();
      window.testAutocompletado = (alumnoId, alumnoNombre) => {
        console.log("🧪 Probando autocompletado manualmente...");
        const idAlumno = $("#id_alumno");
        const alumnoSearch = $("#alumno-search");

        console.log("📝 Estableciendo ID:", alumnoId);
        idAlumno.val(alumnoId);
        console.log("✅ ID establecido, valor actual:", idAlumno.val());

        if (alumnoNombre) {
          console.log("� Estableciendo nombre:", alumnoNombre);
          alumnoSearch.val(alumnoNombre);
        }

        // Mostrar estado final
        this.debugFormulario();
      };
      console.log("�🔧 Funciones de debugging disponibles:");
      console.log("  - debugAsistencia()");
      console.log("  - testAutocompletado(id, nombre)");
    });
  },
};

// Inicializar AttendanceMarker
AttendanceMarker.init();

// ========================================
// MÓDULO 8: FORMULARIOS DE AUTENTICACIÓN
// ========================================

const AuthForms = {
  // Validar email
  isValidEmail: function (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Inicializar formulario de registro
  initRegisterForm: function () {
    document.addEventListener("DOMContentLoaded", () => {
      const nombreInput = document.getElementById("nombre");
      const form = document.getElementById("registroForm");
      const password = document.getElementById("password");
      const confirmPassword = document.getElementById("confirm_password");

      // Auto-focus en el nombre
      if (nombreInput) nombreInput.focus();

      // Validación de contraseñas en tiempo real
      const validatePasswords = () => {
        if (
          confirmPassword &&
          confirmPassword.value &&
          password &&
          password.value !== confirmPassword.value
        ) {
          confirmPassword.setCustomValidity("Las contraseñas no coinciden");
        } else if (confirmPassword) {
          confirmPassword.setCustomValidity("");
        }
      };

      if (password) password.addEventListener("input", validatePasswords);
      if (confirmPassword)
        confirmPassword.addEventListener("input", validatePasswords);

      // Validación del formulario al enviar
      if (form) {
        form.addEventListener("submit", (e) => {
          const email = document.getElementById("email");
          const terminos = document.getElementById("terminos");

          // Validar email
          if (email && !this.isValidEmail(email.value)) {
            e.preventDefault();
            Utils.showError("Por favor ingrese un email válido");
            return;
          }

          // Validar contraseña
          if (password && password.value.length < 6) {
            e.preventDefault();
            Utils.showError("La contraseña debe tener al menos 6 caracteres");
            return;
          }

          // Validar confirmación de contraseña
          if (
            password &&
            confirmPassword &&
            password.value !== confirmPassword.value
          ) {
            e.preventDefault();
            Utils.showError("Las contraseñas no coinciden");
            return;
          }

          // Validar términos
          if (terminos && !terminos.checked) {
            e.preventDefault();
            Utils.showError("Debe aceptar los términos y condiciones");
            return;
          }
        });
      }
    });
  },

  // Inicializar formulario de perfil
  initProfileForm: function () {
    // Función para editar perfil
    window.editarPerfil = function () {
      const inputs = document.querySelectorAll("#perfil-form input");
      const isReadonly = inputs[0] && inputs[0].hasAttribute("readonly");

      if (isReadonly) {
        // Activar modo edición
        inputs.forEach((input) => {
          if (input.id !== "email" && input.id !== "cargo") {
            input.removeAttribute("readonly");
            input.classList.add("form-control-editable");
          }
        });

        // Cambiar botón
        const btn = document.querySelector(".btn-primary");
        if (btn) {
          btn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
          btn.setAttribute("onclick", "guardarPerfil()");
          btn.classList.remove("btn-primary");
          btn.classList.add("btn-success");
        }
      }
    };

    // Función para guardar perfil
    window.guardarPerfil = function () {
      // Simular guardado
      Utils.showToast("Perfil actualizado exitosamente", "success");

      const inputs = document.querySelectorAll("#perfil-form input");
      inputs.forEach((input) => {
        input.setAttribute("readonly", "true");
        input.classList.remove("form-control-editable");
      });

      // Restaurar botón
      const btn = document.querySelector(".btn-success");
      if (btn) {
        btn.innerHTML = '<i class="fas fa-edit"></i> Editar Perfil';
        btn.setAttribute("onclick", "editarPerfil()");
        btn.classList.remove("btn-success");
        btn.classList.add("btn-primary");
      }
    };

    // Función para cambiar contraseña
    window.cambiarPassword = function () {
      const modal = new bootstrap.Modal(
        document.getElementById("modal-password")
      );
      modal.show();
    };

    // Función para confirmar cambio de contraseña
    window.confirmarCambioPassword = function () {
      const actual = document.getElementById("password-actual");
      const nueva = document.getElementById("password-nueva");
      const confirmar = document.getElementById("password-confirmar");

      if (!actual || !nueva || !confirmar) {
        Utils.showToast("Todos los campos son obligatorios", "error");
        return;
      }

      if (!actual.value || !nueva.value || !confirmar.value) {
        Utils.showToast("Todos los campos son obligatorios", "error");
        return;
      }

      if (nueva.value !== confirmar.value) {
        Utils.showToast("Las contraseñas no coinciden", "error");
        return;
      }

      if (nueva.value.length < 6) {
        Utils.showToast(
          "La contraseña debe tener al menos 6 caracteres",
          "error"
        );
        return;
      }

      // Simular cambio de contraseña
      Utils.showToast("Contraseña cambiada exitosamente", "success");

      // Cerrar modal y limpiar form
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("modal-password")
      );
      if (modal) modal.hide();

      const form = document.getElementById("form-password");
      if (form) form.reset();
    };

    // Función para configurar 2FA
    window.configurar2FA = function () {
      Utils.showToast("Funcionalidad de 2FA en desarrollo", "info");
    };

    // Función para guardar preferencias
    window.guardarPreferencias = function () {
      const notificaciones = document.getElementById("notificaciones");
      const temaOscuro = document.getElementById("tema-oscuro");

      // Guardar notificaciones en localStorage
      if (notificaciones) {
        localStorage.setItem("notificaciones", notificaciones.checked);
      }

      // El tema ya se maneja automáticamente por el ThemeManager
      Utils.showToast("Preferencias guardadas exitosamente", "success");
    };

    // Cargar preferencias al inicializar
    document.addEventListener("DOMContentLoaded", () => {
      // Cargar estado de notificaciones
      const notificaciones = localStorage.getItem("notificaciones");
      const notificacionesCheckbox = document.getElementById("notificaciones");

      if (notificaciones !== null && notificacionesCheckbox) {
        notificacionesCheckbox.checked = notificaciones === "true";
      }

      // El tema oscuro se carga automáticamente por ThemeManager
    });
  },
};

// Inicializar formularios de autenticación
AuthForms.initRegisterForm();
AuthForms.initProfileForm();

// ========================================
// MÓDULO 7: GESTIÓN DE CURSOS
// ========================================

const CourseManager = {
  editandoCurso: false,

  // Limpiar formulario
  limpiarFormulario: function () {
    const form = document.getElementById("form-curso");
    const cursoId = document.getElementById("curso-id");
    const activoContainer = document.getElementById("activo-container");
    const modalTitle = document.getElementById("modal-title");

    if (form) form.reset();
    if (cursoId) cursoId.value = "";
    if (activoContainer) activoContainer.style.display = "none";
    if (modalTitle) modalTitle.textContent = "Nuevo Curso";

    this.editandoCurso = false;
  },

  // Editar curso
  editarCurso: function (id) {
    this.editandoCurso = true;
    const modalTitle = document.getElementById("modal-title");
    const activoContainer = document.getElementById("activo-container");

    if (modalTitle) modalTitle.textContent = "Editar Curso";
    if (activoContainer) activoContainer.style.display = "block";

    // Obtener datos del curso
    fetch(`/admin/cursos/${id}/editar`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const curso = data.curso;
          const elements = {
            "curso-id": curso.id_curso,
            nivel: curso.nivel,
            letra: curso.letra,
            descripcion: curso.descripcion || "",
            activo: curso.activo,
          };

          // Llenar formulario
          Object.keys(elements).forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
              if (element.type === "checkbox") {
                element.checked = elements[id];
              } else {
                element.value = elements[id];
              }
            }
          });

          // Mostrar modal
          const modal = new bootstrap.Modal(
            document.getElementById("modal-curso")
          );
          modal.show();
        } else {
          Utils.showToast(data.message, "error");
        }
      })
      .catch((error) => {
        Utils.showToast("Error al cargar los datos del curso", "error");
      });
  },

  // Guardar curso
  guardarCurso: function () {
    const form = document.getElementById("form-curso");
    if (!form) return;

    const formData = new FormData(form);

    // Validaciones
    if (!formData.get("nivel") || !formData.get("letra")) {
      Utils.showToast(
        "Por favor complete todos los campos obligatorios",
        "error"
      );
      return;
    }

    const url = this.editandoCurso
      ? `/admin/cursos/${formData.get("id_curso")}/editar`
      : "/admin/cursos/crear";

    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          Utils.showToast(data.message, "success");

          // Cerrar modal y recargar tabla
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("modal-curso")
          );
          if (modal) modal.hide();
          location.reload();
        } else {
          Utils.showToast(data.message, "error");
        }
      })
      .catch((error) => {
        Utils.showToast("Error al guardar el curso", "error");
      });
  },

  // Eliminar curso
  eliminarCurso: function (id) {
    if (
      !confirm(
        "¿Está seguro de que desea eliminar este curso? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    fetch(`/admin/cursos/${id}/eliminar`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          Utils.showToast(data.message, "success");
          location.reload();
        } else {
          Utils.showToast(data.message, "error");
        }
      })
      .catch((error) => {
        Utils.showToast("Error al eliminar el curso", "error");
      });
  },

  // Filtrar tabla
  filtrarTabla: function () {
    const busqueda = document.getElementById("buscar-curso");
    const filtroNivel = document.getElementById("filtro-nivel");
    const filtroEstado = document.getElementById("filtro-estado");
    const filas = document.querySelectorAll("#tbody-cursos tr");

    if (!busqueda || !filtroNivel || !filtroEstado) return;

    const busquedaValue = busqueda.value.toLowerCase();
    const filtroNivelValue = filtroNivel.value;
    const filtroEstadoValue = filtroEstado.value;

    filas.forEach((fila) => {
      const textoFila = fila.textContent.toLowerCase();
      const nivel = fila.getAttribute("data-nivel");

      const cumpleBusqueda = textoFila.includes(busquedaValue);
      const cumpleNivel = !filtroNivelValue || nivel === filtroNivelValue;
      const cumpleEstado = !filtroEstadoValue; // Por ahora, todos son activos

      if (cumpleBusqueda && cumpleNivel && cumpleEstado) {
        fila.style.display = "";
      } else {
        fila.style.display = "none";
      }
    });
  },

  // Inicializar eventos
  init: function () {
    document.addEventListener("DOMContentLoaded", () => {
      // Limpiar formulario al abrir modal para nuevo curso
      const modalCurso = document.getElementById("modal-curso");
      if (modalCurso) {
        modalCurso.addEventListener("show.bs.modal", (event) => {
          if (!this.editandoCurso) {
            this.limpiarFormulario();
          }
        });
      }

      // Búsqueda en tiempo real
      const buscarInput = document.getElementById("buscar-curso");
      if (buscarInput) {
        buscarInput.addEventListener("input", () => {
          this.filtrarTabla();
        });
      }

      // Filtros
      const filtroNivel = document.getElementById("filtro-nivel");
      const filtroEstado = document.getElementById("filtro-estado");

      if (filtroNivel) {
        filtroNivel.addEventListener("change", () => this.filtrarTabla());
      }
      if (filtroEstado) {
        filtroEstado.addEventListener("change", () => this.filtrarTabla());
      }
    });
  },
};

// Inicializar CourseManager
CourseManager.init();

// ========================================
// EXPORTAR FUNCIONES GLOBALMENTE
// ========================================

// Exportar todas las funciones para compatibilidad global
window.Utils = Utils;
window.ThemeManager = ThemeManager;
window.BaseSystem = BaseSystem;
window.BiometricTerminal = BiometricTerminal;
window.BiometricAdmin = BiometricAdmin;
window.StudentManager = StudentManager;
window.AttendanceSystem = AttendanceSystem;
window.CourseManager = CourseManager;
window.AuthForms = AuthForms;
window.AttendanceMarker = AttendanceMarker;
window.AttendanceByCourse = AttendanceByCourse;
window.CourseDetail = CourseDetail;

// Funciones globales para compatibilidad con HTML inline
window.detectarDispositivos = () => BaseSystem.detectarDispositivos();
window.controlarLuces = (action, duration) =>
  BaseSystem.controlarLuces(action, duration);
window.mostrarInfoSesion = () => BaseSystem.mostrarInfoSesion();
window.registerFingerprint = (studentId, studentName) =>
  BiometricAdmin.registerFingerprint(studentId, studentName);
window.updateFingerprint = (studentId, studentName) =>
  BiometricAdmin.updateFingerprint(studentId, studentName);
window.limpiarFormulario = () => StudentManager.limpiarFormulario();
window.editarAlumno = (id) => StudentManager.editarAlumno(id);
window.guardarAlumno = () => StudentManager.guardarAlumno();
window.eliminarAlumno = (id) => StudentManager.eliminarAlumno(id);
window.verDetalles = (id) => StudentManager.verDetalles(id);

// Funciones de gestión de cursos
window.editarCurso = (id) => CourseManager.editarCurso(id);
window.guardarCurso = () => CourseManager.guardarCurso();
window.eliminarCurso = (id) => CourseManager.eliminarCurso(id);

// Funciones de marcado de asistencia
window.marcarHoraActual = () => AttendanceMarker.marcarHoraActual();
window.marcarPresente = () => AttendanceMarker.marcarPresente();
window.limpiarFormularioAsistencia = () => AttendanceMarker.limpiarFormulario();
window.marcarAsistencia = () => AttendanceMarker.marcarAsistencia();

// Funciones de asistencia por curso
window.marcarAsistenciaRapida = (idAlumno, nombreAlumno) =>
  AttendanceByCourse.marcarAsistenciaRapida(idAlumno, nombreAlumno);
window.guardarAsistenciaRapida = () =>
  AttendanceByCourse.guardarAsistenciaRapida();
window.mostrarModalMarcarTodos = () =>
  AttendanceByCourse.mostrarModalMarcarTodos();

// Funciones de detalle de curso
window.editarEstudiante = (idAlumno) => CourseDetail.editarEstudiante(idAlumno);

// ========================================
// FIN DEL ARCHIVO JAVASCRIPT UNIFICADO
// ========================================
