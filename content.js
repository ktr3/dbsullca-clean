// DBSullca Clean - Content Script
// Se ejecuta en document_start

(function () {
  "use strict";

  // ============================================
  // 1. Inyectar script en el contexto REAL de la página
  //    (los content scripts viven en un "isolated world"
  //     y no pueden interceptar window.open, localStorage, etc.)
  // ============================================

  var pageScript = document.createElement("script");
  pageScript.textContent = "(" + function () {

    // --- Neutralizar GBM_MODAL_CONFIG ---
    Object.defineProperty(window, "GBM_MODAL_CONFIG", {
      set: function () {},
      get: function () { return { images: [], urls: [], enabled: false }; },
      configurable: false,
    });

    // --- Falsear localStorage del modal ---
    var origGetItem = Storage.prototype.getItem;
    var origSetItem = Storage.prototype.setItem;

    Storage.prototype.getItem = function (key) {
      if (key === "gbm_modal_last_closed" || key === "gbm_modal_close_timestamp_v1") {
        return String(Date.now());
      }
      if (key === "gbm_modal_page_views_v1") return "0";
      if (key === "gbm_modal_closed_count_v1") return "999";
      if (key === "gbm_modal_last_closed_v1") return "999";
      return origGetItem.call(this, key);
    };

    Storage.prototype.setItem = function (key, value) {
      if (typeof key === "string" && key.startsWith("gbm_modal")) return;
      return origSetItem.call(this, key, value);
    };

    // --- Bloquear window.open para redirects ---
    var origOpen = window.open;
    window.open = function (url) {
      if (url && typeof url === "string" && url.indexOf("redireccionar") !== -1) {
        return null;
      }
      return origOpen.apply(this, arguments);
    };

    // --- Neutralizar funciones de ads ---
    var fns = ["showModal", "hideModal", "startCountdown", "showGbmModal"];
    fns.forEach(function (name) {
      try {
        Object.defineProperty(window, name, {
          set: function () {},
          get: function () { return function () {}; },
          configurable: true,
        });
      } catch (e) {}
    });

  } + ")();";

  // Inyectar lo antes posible en <head> o <documentElement>
  (document.head || document.documentElement).prepend(pageScript);
  pageScript.remove(); // Limpiar el tag después de ejecutar

  // ============================================
  // 2. Limpiar DOM (esto sí funciona desde el content script)
  // ============================================

  function cleanPage() {
    var selectors = [
      ".gbm-modal-backdrop",
      ".gbm-modal-container",
      ".gbm-modal-overlay",
      ".prsbn-sticky-wrap",
      ".prsbn-instance",
      "#rf-click-overlay",
      "#rf-container",
      'iframe[src*="redireccionar"]',
      'a.sullca-external-link[href*="redireccionar"]',
    ];

    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.remove();
      });
    });

    // Restaurar body si el modal lo bloqueó
    if (document.body) {
      document.body.classList.remove("gbm-modal-open");
      document.body.style.overflow = "";
      document.body.style.filter = "";
    }
  }

  // ============================================
  // 3. MutationObserver para limpiar en tiempo real
  // ============================================

  function startObserver() {
    new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue;
          var cl = node.className || "";
          var id = node.id || "";
          if (
            (typeof cl === "string" && (cl.indexOf("gbm-modal") !== -1 || cl.indexOf("prsbn-") !== -1)) ||
            id === "rf-click-overlay" ||
            id === "rf-container"
          ) {
            cleanPage();
            return;
          }
          // También verificar hijos (por si meten un wrapper)
          if (node.querySelector && node.querySelector(".gbm-modal-backdrop, .prsbn-sticky-wrap, #rf-click-overlay, #rf-container")) {
            cleanPage();
            return;
          }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  // ============================================
  // 4. Inicialización
  // ============================================

  startObserver();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cleanPage);
  } else {
    cleanPage();
  }

  window.addEventListener("load", cleanPage);

  // Limpieza periódica por si algo se escapa (cada 2 segundos, se detiene después de 30s)
  var cleanCount = 0;
  var cleanInterval = setInterval(function () {
    cleanPage();
    cleanCount++;
    if (cleanCount >= 15) clearInterval(cleanInterval);
  }, 2000);

})();
