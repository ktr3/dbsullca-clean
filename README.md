# DBSullca Clean

> Extensión de Chrome para ver [dbsullca.com](https://dbsullca.com/) sin anuncios, popups ni redirecciones.

## Qué bloquea

| Elemento | Descripción |
|----------|-------------|
| Modales popup | Anuncios con countdown que aparecen al navegar |
| Banners sticky | Banner fijo en la esquina inferior |
| Overlay de click | Capa invisible sobre el video que redirige a publicidad |
| Reproductor flotante | Mini-player de video publicitario |
| Redirects | Links a `sullca.com/redireccionar` bloqueados a nivel de red y JS |

## Instalación

1. Descarga o clona este repositorio
   ```bash
   git clone https://github.com/ktr3/dbsullca-clean.git
   ```
2. Abre `chrome://extensions/` en tu navegador
3. Activa el **Modo de desarrollador** (esquina superior derecha)
4. Click en **Cargar descomprimida**
5. Selecciona la carpeta `dbsullca-clean`
6. Listo — navega a [dbsullca.com](https://dbsullca.com/) y disfruta

## Cómo funciona

- **CSS** — Oculta los elementos de anuncios antes de que se rendericen
- **Content Script** — Inyecta código en el contexto real de la página para:
  - Neutralizar `GBM_MODAL_CONFIG` (sistema de modales)
  - Interceptar `localStorage` para evitar reactivación de popups
  - Bloquear `window.open` hacia URLs publicitarias
  - Anular funciones como `showModal()` y `startCountdown()`
- **MutationObserver** — Detecta y elimina en tiempo real cualquier elemento publicitario inyectado dinámicamente
- **Declarative Net Request** — Bloquea peticiones de red a dominios de redirección

## Estructura

```
dbsullca-clean/
├── manifest.json    # Configuración de la extensión (Manifest V3)
├── content.js       # Script principal de bloqueo
├── styles.css       # Reglas CSS para ocultar ads
├── rules.json       # Reglas de bloqueo de red
└── icons/
    ├── icon48.png
    └── icon128.png
```

## Compatibilidad

- Chrome / Chromium 88+
- Edge (Chromium)
- Brave
- Opera GX

## Licencia

MIT
