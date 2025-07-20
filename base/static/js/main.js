/**
 * Sistema de Asistencia - Colegio AML
 * JavaScript principal para funcionalidades comunes
 */

// Configuración global
const API_BASE_URL = '/api';
const TOAST_DURATION = 5000;

/**
 * Utilidades generales
 */
const Utils = {
    // Mostrar mensaje de éxito
    showSuccess: function(message) {
        this.showToast(message, 'success');
    },

    // Mostrar mensaje de error
    showError: function(message) {
        this.showToast(message, 'error');
    },

    // Mostrar mensaje de advertencia
    showWarning: function(message) {
        this.showToast(message, 'warning');
    },

    // Mostrar toast personalizado
    showToast: function(message, type = 'info') {
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${this.getBootstrapColor(type)} border-0" role="alert" aria-live="assertive" aria-atomic="true">
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
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        
        const toastElement = toastContainer.lastElementChild;
        const toast = new bootstrap.Toast(toastElement, { delay: TOAST_DURATION });
        toast.show();

        // Limpiar el elemento después de que se oculte
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastElement.remove();
        });
    },

    // Obtener o crear contenedor de toasts
    getToastContainer: function() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
        return container;
    },

    // Convertir tipo a color de Bootstrap
    getBootstrapColor: function(type) {
        const colors = {
            'success': 'success',
            'error': 'danger',
            'warning': 'warning',
            'info': 'info'
        };
        return colors[type] || 'info';
    },

    // Obtener icono según el tipo
    getIcon: function(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    },

    // Formatear fecha
    formatDate: function(date) {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Formatear tiempo relativo
    timeAgo: function(date) {
        if (!date) return '-';
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'hace unos momentos';
    },

    // Validar email
    isValidEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Capitalizar primera letra
    capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Debounce para funciones
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

/**
 * Funciones para sistema de huellas dactilares
 */
const FingerprintSystem = {
    // Estados del sistema
    states: {
        DISCONNECTED: 'disconnected',
        CONNECTED: 'connected',
        SCANNING: 'scanning',
        ERROR: 'error'
    },

    currentState: 'disconnected',

    // Cambiar estado del sistema
    setState: function(state, message = '') {
        this.currentState = state;
        this.updateUI(state, message);
    },

    // Actualizar interfaz según el estado
    updateUI: function(state, message) {
        const indicator = document.querySelector('.scanner-status');
        if (!indicator) return;

        indicator.className = `scanner-status ${state}`;
        
        const statusTexts = {
            'disconnected': 'Desconectado',
            'connected': 'Conectado',
            'scanning': 'Escaneando...',
            'error': 'Error'
        };

        const statusIcons = {
            'disconnected': 'fa-unlink',
            'connected': 'fa-link',
            'scanning': 'fa-spinner fa-spin',
            'error': 'fa-exclamation-triangle'
        };

        indicator.innerHTML = `
            <i class="fas ${statusIcons[state]} me-2"></i>
            ${statusTexts[state]}${message ? ': ' + message : ''}
        `;
    },

    // Simular captura de huella
    simulateCapture: function(onSuccess, onError) {
        this.setState('scanning', 'Capturando huella dactilar');
        
        setTimeout(() => {
            const success = Math.random() > 0.2; // 80% éxito
            if (success) {
                this.setState('connected', 'Huella capturada correctamente');
                if (onSuccess) onSuccess({
                    quality: Math.floor(Math.random() * 30) + 70, // 70-100%
                    template: 'template_simulado_' + Date.now(),
                    finger: 'indice_derecho'
                });
            } else {
                this.setState('error', 'Error al capturar huella');
                if (onError) onError('No se pudo leer la huella dactilar');
            }
        }, 2000);
    },

    // Validar calidad de huella
    validateQuality: function(quality) {
        if (quality >= 80) return 'excelente';
        if (quality >= 60) return 'buena';
        if (quality >= 40) return 'regular';
        return 'mala';
    },

    // Obtener color según calidad
    getQualityColor: function(quality) {
        if (quality >= 80) return '#28a745';
        if (quality >= 60) return '#ffc107';
        if (quality >= 40) return '#fd7e14';
        return '#dc3545';
    }
};

/**
 * Funciones para búsqueda de alumnos
 */
const StudentSearch = {
    // Configuración de búsqueda
    config: {
        minChars: 2,
        debounceTime: 300,
        maxResults: 10
    },

    // Inicializar búsqueda
    init: function(inputId, resultsId, onSelect) {
        const input = document.getElementById(inputId);
        const results = document.getElementById(resultsId);
        
        if (!input) return;

        const debouncedSearch = Utils.debounce((query) => {
            this.search(query, results, onSelect);
        }, this.config.debounceTime);

        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= this.config.minChars) {
                debouncedSearch(query);
            } else {
                this.clearResults(results);
            }
        });

        // Ocultar resultados al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !results.contains(e.target)) {
                this.clearResults(results);
            }
        });
    },

    // Realizar búsqueda
    search: function(query, resultsContainer, onSelect) {
        // Simular búsqueda de alumnos
        const mockStudents = [
            { id: 1, nombre: 'Ana García López', email: 'ana.garcia@ejemplo.cl', curso: '8°A' },
            { id: 2, nombre: 'Carlos Rodríguez Silva', email: 'carlos.rodriguez@ejemplo.cl', curso: '7°B' },
            { id: 3, nombre: 'María Fernández Torres', email: 'maria.fernandez@ejemplo.cl', curso: '8°A' },
            { id: 4, nombre: 'Pedro Martínez Ruiz', email: 'pedro.martinez@ejemplo.cl', curso: '7°A' },
            { id: 5, nombre: 'Sofía López Herrera', email: 'sofia.lopez@ejemplo.cl', curso: '8°B' }
        ];

        const filtered = mockStudents.filter(student => 
            student.nombre.toLowerCase().includes(query.toLowerCase()) ||
            student.email.toLowerCase().includes(query.toLowerCase())
        ).slice(0, this.config.maxResults);

        this.displayResults(filtered, resultsContainer, onSelect);
    },

    // Mostrar resultados
    displayResults: function(students, container, onSelect) {
        if (!container) return;

        if (students.length === 0) {
            container.innerHTML = '<div class="dropdown-item text-muted">No se encontraron alumnos</div>';
            container.classList.add('show');
            return;
        }

        const html = students.map(student => `
            <div class="dropdown-item student-item" data-student='${JSON.stringify(student)}'>
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <i class="fas fa-user-circle fa-2x text-muted"></i>
                    </div>
                    <div>
                        <div class="fw-semibold">${student.nombre}</div>
                        <small class="text-muted">${student.email}</small>
                        <span class="badge bg-info ms-2">${student.curso}</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
        container.classList.add('show');

        // Agregar event listeners
        container.querySelectorAll('.student-item').forEach(item => {
            item.addEventListener('click', () => {
                const studentData = JSON.parse(item.dataset.student);
                if (onSelect) onSelect(studentData);
                this.clearResults(container);
            });
        });
    },

    // Limpiar resultados
    clearResults: function(container) {
        if (container) {
            container.innerHTML = '';
            container.classList.remove('show');
        }
    }
};

/**
 * Funciones para estadísticas y gráficos
 */
const StatsManager = {
    // Actualizar estadísticas en tiempo real
    updateStats: function(statsData) {
        // Actualizar números principales
        const elements = {
            'total-alumnos': statsData.total_alumnos,
            'alumnos-con-huellas': statsData.alumnos_con_huellas,
            'total-huellas': statsData.total_huellas,
            'calidad-promedio': statsData.calidad_promedio + '%'
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.animateNumber(element, elements[id]);
            }
        });

        // Actualizar barra de progreso
        this.updateProgressBar(statsData.porcentaje_cobertura);
    },

    // Animar números
    animateNumber: function(element, targetValue) {
        const isPercentage = typeof targetValue === 'string' && targetValue.includes('%');
        const numericValue = isPercentage ? 
            parseInt(targetValue.replace('%', '')) : 
            parseInt(targetValue);

        let currentValue = 0;
        const increment = numericValue / 20;
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= numericValue) {
                currentValue = numericValue;
                clearInterval(timer);
            }
            element.textContent = isPercentage ? 
                Math.floor(currentValue) + '%' : 
                Math.floor(currentValue);
        }, 50);
    },

    // Actualizar barra de progreso
    updateProgressBar: function(percentage) {
        const progressBar = document.querySelector('.progress-bar-custom');
        if (progressBar) {
            progressBar.style.width = percentage + '%';
            progressBar.textContent = percentage + '%';
        }
    }
};

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Inicializar popovers de Bootstrap
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Mostrar mensaje de bienvenida si es la primera visita
    if (localStorage.getItem('firstVisit') !== 'false') {
        setTimeout(() => {
            Utils.showSuccess('¡Bienvenido al Sistema de Asistencia Colegio AML!');
            localStorage.setItem('firstVisit', 'false');
        }, 1000);
    }

    // Actualizar reloj en tiempo real si existe
    const timeDisplay = document.querySelector('.time-display');
    if (timeDisplay) {
        setInterval(() => {
            timeDisplay.textContent = new Date().toLocaleTimeString('es-CL');
        }, 1000);
    }
});

/**
 * Gestor del Tema Oscuro
 */
const ThemeManager = {
    // Inicializar el gestor de temas
    init: function() {
        this.loadTheme();
        this.attachEventListeners();
    },

    // Cargar el tema guardado
    loadTheme: function() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        // Actualizar el switch si existe
        const themeSwitch = document.getElementById('tema-oscuro');
        if (themeSwitch) {
            themeSwitch.checked = savedTheme === 'dark';
        }
    },

    // Establecer el tema
    setTheme: function(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.updateBootstrapComponents('dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            this.updateBootstrapComponents('light');
        }
        localStorage.setItem('theme', theme);
        this.updateThemeIcon(theme);
    },

    // Alternar entre temas
    toggleTheme: function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Mostrar notificación
        const message = newTheme === 'dark' ? 'Tema oscuro activado' : 'Tema claro activado';
        Utils.showToast(message, 'info');
    },

    // Actualizar el icono del botón de tema
    updateThemeIcon: function(theme) {
        const themeButton = document.getElementById('theme-toggle-btn');
        if (themeButton) {
            const icon = themeButton.querySelector('i');
            if (icon) {
                if (theme === 'dark') {
                    icon.className = 'fas fa-sun';
                    themeButton.title = 'Cambiar a tema claro';
                } else {
                    icon.className = 'fas fa-moon';
                    themeButton.title = 'Cambiar a tema oscuro';
                }
            }
        }
    },

    // Actualizar componentes de Bootstrap para el tema
    updateBootstrapComponents: function(theme) {
        const isDark = theme === 'dark';
        
        // Actualizar navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (isDark) {
                navbar.classList.remove('navbar-light');
                navbar.classList.add('navbar-dark');
            } else {
                navbar.classList.remove('navbar-dark');
                navbar.classList.add('navbar-light');
            }
        }

        // Actualizar tablas
        const tables = document.querySelectorAll('.table');
        tables.forEach(table => {
            if (isDark) {
                table.classList.add('table-dark');
            } else {
                table.classList.remove('table-dark');
            }
        });

        // Actualizar modales
        const modals = document.querySelectorAll('.modal-content');
        modals.forEach(modal => {
            if (isDark) {
                modal.classList.add('bg-dark', 'text-light');
            } else {
                modal.classList.remove('bg-dark', 'text-light');
            }
        });
    },

    // Adjuntar event listeners
    attachEventListeners: function() {
        // Switch de tema en perfil
        const themeSwitch = document.getElementById('tema-oscuro');
        if (themeSwitch) {
            themeSwitch.addEventListener('change', () => {
                this.toggleTheme();
            });
        }

        // Botón de tema en navbar (si se agrega)
        const themeButton = document.getElementById('theme-toggle-btn');
        if (themeButton) {
            themeButton.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    },

    // Obtener el tema actual
    getCurrentTheme: function() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
};

// Inicializar el gestor de temas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.init();
});

// Exportar funciones globalmente para compatibilidad
window.Utils = Utils;
window.FingerprintSystem = FingerprintSystem;
window.StudentSearch = StudentSearch;
window.StatsManager = StatsManager;
window.ThemeManager = ThemeManager;
