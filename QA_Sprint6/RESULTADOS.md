# Sprint VI: simplificación de la interfaz

**Ejecución técnica:** 26/11/2026. **Entorno:** frontend Vite local en Edge automatizado, sesión y respuestas de API simuladas, datos financieros locales sintéticos. No se conectó la base de producción.

## Cambios implementados

- **HU-21:** el Dashboard presenta primero saldo, riesgo y dos acciones principales. Los indicadores adicionales y la actividad reciente se abren bajo demanda; las alertas críticas de liquidez y stock permanecen visibles.
- **HU-22:** el menú muestra tres accesos frecuentes y agrupa el resto en Finanzas, Operaciones y Administración según el rol. El grupo activo señala el módulo actual y el menú móvil conserva el control de acceso.
- **HU-23:** Reportes presenta tres cifras y oculta filtros, exportaciones y tablas hasta solicitarlos. Flujo de caja oculta el panel técnico y la tabla de proyección, mientras deja las alertas visibles. El filtro de Reportes y la vista mensual/semanal se conservan durante la sesión.

## Verificación

- `npm run build`: aprobado.
- `npm run lint`: aprobado.
- `npm run test:ui`: **17/17 casos aprobados**. El detalle está en `resultados.json`. Requiere tener el frontend iniciado en `http://127.0.0.1:4179` o definir `QA_BASE_URL` y tener Microsoft Edge instalado.
- La exportación de ventas CSV respetó el período filtrado.
- Capturas: `dashboard-resumen.png`, `menu-agrupado.png`, `reportes-resumen.png`, `flujo-caja.png` y `menu-movil-vendedor.png`.

**Alcance del cierre:** las tres historias están implementadas y verificadas técnicamente. No se ha realizado una nueva sesión de prueba de percepción con el usuario ni se han recabado firmas de Product Owner o dueño del negocio. Esas actividades no se atribuyen a esta ejecución.

**Ajustes posteriores a la evidencia:** se retiraron textos explicativos marcados por el usuario en 26 puntos y se simplificaron barra lateral, cabecera, panel principal e inventario. Las capturas iniciales de esta carpeta documentan el cierre del Sprint VI; el estado actual se comprueba ejecutando el frontend.
