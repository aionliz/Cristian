/**
 * Módulo para el manejo de reportes de asistencia
 * Funcionalidades para generar, visualizar y exportar reportes
 */

const ReportesAsistencia = {
  // Variables globales para los gráficos
  chartResumen: null,
  chartTendencia: null,
  datosReporte: null,

  // Inicializar el módulo
  init: function () {
    this.bindEvents();
    this.establecerMesActual();
    this.cargarDatosReporte();
  },

  // Vincular eventos
  bindEvents: function () {
    // Event listeners para filtros
    const filtrosForm = document.getElementById("filtros-form");
    if (filtrosForm) {
      filtrosForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.cargarDatosReporte();
      });
    }

    // Event listeners para cambios en filtros
    const mesSelect = document.getElementById("mes");
    const cursoSelect = document.getElementById("curso");
    const tipoSelect = document.getElementById("tipo");

    if (mesSelect)
      mesSelect.addEventListener("change", () => this.cargarDatosReporte());
    if (cursoSelect)
      cursoSelect.addEventListener("change", () => this.cargarDatosReporte());
    if (tipoSelect)
      tipoSelect.addEventListener("change", () => this.cargarDatosReporte());

    // Event listener para exportar PDF
    const btnExportar = document.getElementById("btn-exportar-reporte");
    if (btnExportar) {
      btnExportar.addEventListener("click", () => this.exportarReportePDF());
    }
  },

  // Establecer mes actual por defecto
  establecerMesActual: function () {
    const mesInput = document.getElementById("mes");
    if (mesInput) {
      const hoy = new Date();
      const mesActual = hoy.toISOString().slice(0, 7);
      mesInput.value = mesActual;
    }
  },

  // Cargar datos del reporte
  cargarDatosReporte: async function () {
    try {
      const mes = document.getElementById("mes").value;
      const curso = document.getElementById("curso").value;
      const tipo = document.getElementById("tipo").value;

      if (!mes) {
        alert("Por favor selecciona un mes");
        return;
      }

      const params = new URLSearchParams({
        mes: mes,
        tipo: tipo,
        formato: "json",
      });

      if (curso) {
        params.append("curso", curso);
      }

      const response = await fetch(
        `/asistencia/reporte-mensual?${params.toString()}`
      );
      const data = await response.json();

      if (data.success) {
        this.datosReporte = data.data;
        this.actualizarEstadisticas(this.datosReporte.resumen);
        this.actualizarTablaAlumnos(this.datosReporte.alumnos);
        this.actualizarGraficoResumen(this.datosReporte.resumen);
        this.actualizarGraficoTendencia(this.datosReporte.tendencia_diaria);
      } else {
        alert("Error al cargar los datos: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar los datos del reporte");
    }
  },

  // Actualizar estadísticas en las tarjetas
  actualizarEstadisticas: function (resumen) {
    const elementos = {
      "total-presente": resumen.total_presente || 0,
      "total-ausente": resumen.total_ausente || 0,
      "total-tarde": resumen.total_tarde || 0,
      "porcentaje-asistencia": (resumen.porcentaje_asistencia || 0) + "%",
    };

    for (const [id, valor] of Object.entries(elementos)) {
      const elemento = document.getElementById(id);
      if (elemento) {
        elemento.textContent = valor;
      }
    }
  },

  // Actualizar tabla de alumnos
  actualizarTablaAlumnos: function (alumnos) {
    const tbody = document.getElementById("tbody-asistencia");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!alumnos || alumnos.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center">No hay datos disponibles</td></tr>';
      return;
    }

    alumnos.forEach((alumno) => {
      const fila = document.createElement("tr");

      // Determinar clase CSS según el estado
      let claseEstado = "";
      switch (alumno.estado) {
        case "Excelente":
          claseEstado = "table-success";
          break;
        case "Bueno":
          claseEstado = "table-info";
          break;
        case "Regular":
          claseEstado = "table-warning";
          break;
        case "Crítico":
          claseEstado = "table-danger";
          break;
      }

      fila.className = claseEstado;
      fila.innerHTML = `
        <td>${alumno.nombre_completo}</td>
        <td>${alumno.curso}</td>
        <td>${alumno.dias_presente}</td>
        <td>${alumno.dias_ausente}</td>
        <td>${alumno.dias_tarde}</td>
        <td>${alumno.porcentaje_asistencia.toFixed(1)}%</td>
        <td>
          <span class="badge bg-${this.getBadgeColor(alumno.estado)}">
            ${alumno.estado}
          </span>
        </td>
      `;

      tbody.appendChild(fila);
    });
  },

  // Obtener color del badge según el estado
  getBadgeColor: function (estado) {
    switch (estado) {
      case "Excelente":
        return "success";
      case "Bueno":
        return "info";
      case "Regular":
        return "warning";
      case "Crítico":
        return "danger";
      default:
        return "secondary";
    }
  },

  // Actualizar gráfico de resumen
  actualizarGraficoResumen: function (resumen) {
    const canvas = document.getElementById("grafico-resumen");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Destruir gráfico anterior si existe
    if (this.chartResumen) {
      this.chartResumen.destroy();
    }

    this.chartResumen = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Presente", "Ausente", "Tardanza", "Justificado"],
        datasets: [
          {
            data: [
              resumen.total_presente || 0,
              resumen.total_ausente || 0,
              resumen.total_tarde || 0,
              resumen.total_justificado || 0,
            ],
            backgroundColor: [
              "#28a745", // Verde para presente
              "#dc3545", // Rojo para ausente
              "#ffc107", // Amarillo para tardanza
              "#17a2b8", // Azul para justificado
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  },

  // Actualizar gráfico de tendencia
  actualizarGraficoTendencia: function (tendenciaDiaria) {
    const canvas = document.getElementById("grafico-tendencia");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Destruir gráfico anterior si existe
    if (this.chartTendencia) {
      this.chartTendencia.destroy();
    }

    if (!tendenciaDiaria || tendenciaDiaria.length === 0) {
      return;
    }

    const fechas = tendenciaDiaria.map((item) => {
      const fecha = new Date(item.fecha);
      return fecha.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      });
    });

    this.chartTendencia = new Chart(ctx, {
      type: "line",
      data: {
        labels: fechas,
        datasets: [
          {
            label: "Presente",
            data: tendenciaDiaria.map((item) => item.presente),
            borderColor: "#28a745",
            backgroundColor: "rgba(40, 167, 69, 0.1)",
            fill: true,
          },
          {
            label: "Ausente",
            data: tendenciaDiaria.map((item) => item.ausente),
            borderColor: "#dc3545",
            backgroundColor: "rgba(220, 53, 69, 0.1)",
            fill: true,
          },
          {
            label: "Tardanza",
            data: tendenciaDiaria.map((item) => item.tarde),
            borderColor: "#ffc107",
            backgroundColor: "rgba(255, 193, 7, 0.1)",
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  },

  // Exportar reporte a PDF
  exportarReportePDF: async function () {
    if (!this.datosReporte) {
      alert("Primero debes generar un reporte");
      return;
    }

    try {
      const mes = document.getElementById("mes").value;
      const curso = document.getElementById("curso").value;

      const params = new URLSearchParams({
        mes: mes,
      });

      if (curso) {
        params.append("curso", curso);
      }

      // Crear enlace de descarga
      const url = `/reportes/exportar-pdf?${params.toString()}`;
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte_asistencia_${mes.replace("-", "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al exportar el reporte");
    }
  },
};

// Funciones globales para compatibilidad
window.cargarDatosReporte = function () {
  ReportesAsistencia.cargarDatosReporte();
};

window.exportarReportePDF = function () {
  ReportesAsistencia.exportarReportePDF();
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  ReportesAsistencia.init();
});

// Exportar módulo
window.ReportesAsistencia = ReportesAsistencia;
