const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = __dirname;
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4179';
const results = [];
const admin = { userId: 1, correo: 'qa6@example.test', username: 'qa6', displayName: 'Usuario QA', rol: 'admin', role: 'admin', token: 'local-test' };
const ledger = { openingDate: '2026-11-01', openingCents: 10000, movements: [] };
const scenario = { start: '2026-11-26', opening: 100, reserve: 200, movements: [{ id: 'expense-1', date: '2026-11-27', description: 'Pago previsto', type: 'expense', amount: 500 }], savedAt: '2026-11-26T15:00:00.000Z' };
const products = [{ id: 1, nombre: 'Producto sin stock', sku: 'QA-01', stock: 0, stockMinimo: 5, estado: 'activo' }];
const sales = [
  { id: 1, numeroBoleta: 'B-001', cliente: 'Cliente A', subtotal: 100, igv: 18, descuento: 0, total: 118, estado: 'completada', fechaVenta: '2026-11-25T10:00:00', vendedorNombre: 'QA' },
  { id: 2, numeroBoleta: 'B-002', cliente: 'Cliente B', subtotal: 200, igv: 36, descuento: 0, total: 236, estado: 'completada', fechaVenta: '2026-10-25T10:00:00', vendedorNombre: 'QA' },
];
const purchases = [{ id: 1, proveedorNombre: 'Proveedor A', subtotal: 60, igv: 10.8, total: 70.8, fechaCompra: '2026-11-25T11:00:00', usuarioNombre: 'QA' }];

function record(id, ok, observation) {
  results.push({ id, status: ok ? 'APROBADO' : 'FALLIDO', observation });
  console.log(`${id}: ${ok ? 'APROBADO' : 'FALLIDO'} - ${observation}`);
}
async function setup(browser, role = 'admin', viewport = { width: 1360, height: 900 }) {
  const context = await browser.newContext({ viewport, locale: 'es-PE', timezoneId: 'America/Lima' });
  await context.addInitScript(({ session, ledger, scenario }) => {
    localStorage.setItem('sm_session', JSON.stringify(session));
    localStorage.setItem(`finvora:movimientos-financieros:v1:${session.userId}`, JSON.stringify(ledger));
    localStorage.setItem(`finvora:escenario-caja:v1:${session.userId}`, JSON.stringify(scenario));
  }, { session: { ...admin, rol: role, role }, ledger, scenario });
  await context.route('**/*', route => {
    const u = new URL(route.request().url());
    if (u.pathname.includes('/api/')) {
      const data = u.pathname.endsWith('/productos') ? products : u.pathname.endsWith('/ventas') ? sales : u.pathname.endsWith('/compras') ? purchases : [];
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
    }
    if (u.hostname === '127.0.0.1' || u.protocol === 'data:' || u.protocol === 'blob:') return route.continue();
    return route.abort();
  });
  const page = await context.newPage();
  return { context, page };
}

(async () => {
  fs.mkdirSync(root, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const { context, page } = await setup(browser);
    await page.goto(base + '/');
    await page.getByText('Producto sin stock').first().waitFor({ state: 'attached' });
    const summary = page.locator('.financial-dashboard .fd-details');
    const secondary = page.locator('.finvora-dashboard .fv-details');
    record('UI-01', !(await summary.evaluate(el => el.open)) && !(await secondary.evaluate(el => el.open)), 'Los análisis secundarios del Dashboard inician cerrados.');
    record('UI-02', await page.getByText('Revisar alerta de liquidez').isVisible() && await page.getByText('Inventario requiere atención:').isVisible(), 'Las alertas críticas de caja e inventario siguen visibles.');
    await page.screenshot({ path: path.join(root, 'dashboard-resumen.png'), fullPage: false });
    await summary.locator('summary').click();
    record('UI-03', await page.getByLabel('Período registrado').isVisible(), 'El análisis financiero puede expandirse.');
    await secondary.locator('summary').click();
    record('UI-04', await page.getByText('Últimas Transacciones Registradas').isVisible(), 'Ventas e inventario pueden expandirse.');
    const adminGroup = page.locator('.sidebar-group').filter({ has: page.locator('summary', { hasText: 'Administración' }) });
    record('UI-05', !(await adminGroup.evaluate(el => el.open)), 'El grupo Administración inicia cerrado fuera de sus rutas.');
    await adminGroup.locator('summary').click();
    record('UI-06', await adminGroup.getByRole('link', { name: 'Reportes' }).isVisible(), 'Las opciones de administración se recuperan desde el grupo.');
    await page.screenshot({ path: path.join(root, 'menu-agrupado.png'), fullPage: false });

    await page.goto(base + '/reports');
    await page.getByText('Ventas del período').waitFor();
    const reportsGroup = page.locator('.sidebar-group.current');
    record('UI-07', !(await reportsGroup.evaluate(el => el.open)) && await reportsGroup.locator('summary').innerText().then(text => text.includes('Reportes')), 'El menú sigue compacto y señala el módulo actual.');
    const filters = page.locator('details').filter({ has: page.locator('summary', { hasText: 'Filtrar período' }) });
    const reportDetails = page.locator('details').filter({ has: page.locator('summary', { hasText: 'Ver indicadores' }) });
    record('UI-08', !(await filters.evaluate(el => el.open)) && !(await reportDetails.evaluate(el => el.open)), 'Reportes muestra primero tres cifras y mantiene filtros y tablas cerrados.');
    await page.screenshot({ path: path.join(root, 'reportes-resumen.png'), fullPage: false });
    await filters.locator('summary').click();
    await filters.locator('input[type=date]').first().fill('2026-11-01');
    await filters.getByRole('button', { name: 'Aplicar Filtro' }).click();
    record('UI-09', /118[.,]00/.test(await page.locator('[aria-label="Resumen de reportes"]').innerText()), 'El resumen responde al filtro aplicado.');
    await reportDetails.locator('summary').click();
    record('UI-10', await page.getByText('Detalle Reciente de Ventas').isVisible(), 'El detalle de ventas se abre tras filtrar.');
    const downloadEvent = page.waitForEvent('download');
    await filters.getByRole('button', { name: 'Ventas CSV' }).click();
    const download = await downloadEvent;
    const csvPath = path.join(root, 'reporte_ventas_filtrado.csv');
    await download.saveAs(csvPath);
    const csv = fs.readFileSync(csvPath, 'utf8');
    record('UI-11', csv.includes('B-001') && !csv.includes('B-002'), 'La exportación conserva el filtro activo.');
    await page.goto(base + '/');
    await page.goto(base + '/reports');
    await page.getByText('Ventas del período').waitFor();
    record('UI-12', /118[.,]00/.test(await page.locator('[aria-label="Resumen de reportes"]').innerText()), 'El filtro aplicado permanece al volver a Reportes en la misma sesión.');

    await page.goto(base + '/flujo-caja');
    const technical = page.locator('details').filter({ has: page.locator('summary', { hasText: 'información técnica' }) });
    const projection = page.locator('details').filter({ has: page.locator('summary', { hasText: 'tabla de proyección' }) });
    record('UI-13', !(await technical.evaluate(el => el.open)) && !(await projection.evaluate(el => el.open)), 'Los detalles técnicos y la tabla de proyección inician cerrados.');
    record('UI-14', await page.getByText('Alertas preventivas de liquidez').isVisible(), 'Las alertas preventivas permanecen en la vista principal.');
    await projection.locator('summary').click();
    await page.getByRole('button', { name: 'Mensual' }).click();
    record('UI-15', await page.getByRole('button', { name: 'Mensual' }).getAttribute('aria-pressed') === 'true', 'La proyección permite cambiar a vista mensual.');
    await page.goto(base + '/');
    await page.goto(base + '/flujo-caja');
    await page.locator('details').filter({ has: page.locator('summary', { hasText: 'tabla de proyección' }) }).locator('summary').click();
    record('UI-16', await page.getByRole('button', { name: 'Mensual' }).getAttribute('aria-pressed') === 'true', 'La vista mensual permanece al regresar durante la sesión.');
    await page.screenshot({ path: path.join(root, 'flujo-caja.png'), fullPage: false });
    await context.close();

    const worker = await setup(browser, 'vendedor', { width: 390, height: 844 });
    await worker.page.goto(base + '/');
    await worker.page.getByRole('button', { name: 'Abrir menú' }).click();
    record('UI-17', await worker.page.locator('.app-sidebar').isVisible() && await worker.page.locator('.sidebar-group').filter({ hasText: 'Administración' }).count() === 0, 'En móvil el menú se abre y el vendedor no ve Administración.');
    await worker.page.waitForTimeout(400);
    await worker.page.screenshot({ path: path.join(root, 'menu-movil-vendedor.png'), fullPage: false });
    await worker.context.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(root, 'resultados.json'), JSON.stringify({ runAt: new Date().toISOString(), environment: 'Frontend Vite local; API y datos financieros simulados en navegador; sin base de producción', results }, null, 2));
  console.log(`RESULTADO ${results.filter(x => x.status === 'APROBADO').length}/${results.length}`);
  if (results.some(x => x.status !== 'APROBADO')) process.exitCode = 1;
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
