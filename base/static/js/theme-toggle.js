/**
 * Sistema de Alternancia de Temas - Colegio AML
 * Control específico del toggle de temas
 * ÚNICA FUENTE DE VERDAD para el botón de tema
 */

// Variable para evitar múltiples inicializaciones
let themeToggleInitialized = false;

// Esperar a que el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  // Evitar inicialización múltiple
  if (themeToggleInitialized) {
    console.log("⚠️ theme-toggle.js ya está inicializado");
    return;
  }

  // Esperar un poco más para asegurar que unified-app.js se haya cargado
  setTimeout(() => {
    if (window.ThemeManager) {
      console.log("✅ ThemeManager encontrado, configurando tema...");

      // Función ÚNICA de toggle de tema
      window.toggleTheme = () => {
        console.log("🔄 theme-toggle.js: Alternando tema (ÚNICO)...");

        // Alternar el tema SIN mostrar toast duplicado
        const currentTheme =
          document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        // Solo cambiar el tema usando ThemeManager
        window.ThemeManager.setTheme(newTheme);

        // Mostrar UNA SOLA notificación
        const message =
          newTheme === "dark" ? "Tema oscuro activado" : "Tema claro activado";

        // Verificar que no haya toasts duplicados
        const existingToasts = document.querySelectorAll(".toast:not(.hide)");
        if (existingToasts.length === 0) {
          Utils.showToast(message, "info");
        } else {
          console.log("ℹ️ Ya hay una notificación visible, omitiendo");
        }
      };

      window.setTheme = (theme) => {
        console.log(`🎨 Estableciendo tema: ${theme}`);
        window.ThemeManager.setTheme(theme);
      };

      window.getCurrentTheme = () => window.ThemeManager.getCurrentTheme();

      // Inicializar ThemeManager SOLO si no está inicializado
      if (!window.ThemeManager.initialized) {
        console.log("🚀 Inicializando ThemeManager desde theme-toggle.js...");
        window.ThemeManager.init();
        window.ThemeManager.initialized = true;
      } else {
        console.log("ℹ️ ThemeManager ya está inicializado");
      }

      // Configurar el botón de toggle CON LIMPIEZA COMPLETA
      const themeButton = document.getElementById("theme-toggle-btn");
      if (themeButton) {
        console.log(
          "🔘 Botón de tema encontrado, configurando listener ÚNICO..."
        );

        // MÉTODO 1: Remover TODOS los listeners clonando el elemento
        const newButton = themeButton.cloneNode(true);
        themeButton.parentNode.replaceChild(newButton, themeButton);

        // MÉTODO 2: Agregar UN SOLO listener con preventDefault y stopPropagation
        newButton.addEventListener(
          "click",
          function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            console.log("🖱️ Click en botón de tema (ÚNICO LISTENER)");

            // Agregar una pequeña demora para evitar clics múltiples
            if (newButton.disabled) return;
            newButton.disabled = true;

            setTimeout(() => {
              window.toggleTheme();
              newButton.disabled = false;
            }, 300);
          },
          { once: false, passive: false }
        );

        console.log("✅ Event listener ÚNICO configurado correctamente");
        themeToggleInitialized = true;
      } else {
        console.error("❌ Botón de tema no encontrado (#theme-toggle-btn)");
      }
    } else {
      console.error("❌ ThemeManager no encontrado en window");
    }
  }, 150);
});
