import { test, expect } from "@playwright/test";

test.describe("Flujo E2E de Inventario - StockPascual", () => {
  test("login, crear producto, IN, OUT y verificar stock y alertas", async ({ page }) => {
    const timestamp = Date.now();
    const sku = `E2E-${timestamp}`;
    const nombreProducto = `Sensor E2E ${timestamp}`;
    const stockInicial = 10;
    const stockMinimo = 8;
    const entradaIN = 5;  // 10 + 5 = 15
    const salidaOUT = 8;  // 15 - 8 = 7 (queda <= stockMinimo de 8 para activar alerta)
    const stockEsperado = stockInicial + entradaIN - salidaOUT; // 7

    // 1) Login como administrador
    await page.goto("/");
    await page.getByLabel("Usuario").fill("admin");
    await page.getByLabel("Contraseña").fill("Admin123!");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    // 2) Ir a Productos y abrir modal de creacion
    await page.locator("aside, nav").getByText("Productos").click();
    await page.getByRole("button", { name: "+ Producto" }).click();

    // Acotar al formulario del modal para evitar colision con el checkbox #filter-low del fondo
    const formProducto = page.locator("form").filter({ has: page.getByLabel(/SKU/i) });
    await formProducto.getByLabel(/SKU/i).fill(sku);
    await formProducto.getByLabel(/Nombre/i).fill(nombreProducto);
    await formProducto.getByLabel(/Precio/i).fill("25000");
    await formProducto.getByLabel(/Stock/i).first().fill(String(stockInicial));
    await formProducto.getByLabel(/mínimo|Mín/i).fill(String(stockMinimo));

    await formProducto.getByRole("button", { name: /Guardar|Crear/i }).click();

    // Verificar que el producto recien creado aparece en la tabla de Productos con stock 10
    const filaProducto = page.locator("#products-table").getByRole("row", { name: new RegExp(sku) });
    await expect(filaProducto).toBeVisible();
    await expect(filaProducto).toContainText(String(stockInicial));

    // 3) Registrar movimiento IN de 5 unidades
    await page.getByRole("button", { name: "+ Movimiento" }).click();

    const formMovimientoIN = page.locator("form").filter({ has: page.getByLabel(/Cantidad/i) });
    const selectProductoIN = formMovimientoIN.getByLabel(/Producto/i);
    const valorProducto = await selectProductoIN
      .locator("option", { hasText: sku })
      .getAttribute("value");
    expect(valorProducto).not.toBeNull();
    await selectProductoIN.selectOption(valorProducto!);

    await formMovimientoIN.getByLabel(/Tipo/i).selectOption("IN");
    await formMovimientoIN.getByLabel(/Cantidad/i).fill(String(entradaIN));
    await formMovimientoIN.getByRole("button", { name: /Guardar|Registrar/i }).click();

    // Verificar actualizacion intermedia tras IN (15 unidades)
    await expect(filaProducto).toContainText(String(stockInicial + entradaIN));

    // 4) Registrar movimiento OUT de 8 unidades
    await page.getByRole("button", { name: "+ Movimiento" }).click();

    const formMovimientoOUT = page.locator("form").filter({ has: page.getByLabel(/Cantidad/i) });
    await formMovimientoOUT.getByLabel(/Producto/i).selectOption(valorProducto!);
    await formMovimientoOUT.getByLabel(/Tipo/i).selectOption("OUT");
    await formMovimientoOUT.getByLabel(/Cantidad/i).fill(String(salidaOUT));
    await formMovimientoOUT.getByRole("button", { name: /Guardar|Registrar/i }).click();

    // 5) Verificar en Productos que el stock final es 7 y su estado es Bajo
    await expect(filaProducto).toContainText(String(stockEsperado));
    await expect(filaProducto).toContainText(/Bajo/i);

    // 6) Como stock (7) <= minimo (8), verificar que aparece en la tabla visible de Alertas stock
    await page.locator("aside, nav").getByText(/Alertas/i).click();
    const filaAlerta = page.locator("main table").getByRole("row", { name: new RegExp(sku) });
    await expect(filaAlerta).toBeVisible();
    await expect(filaAlerta).toContainText(nombreProducto);
    await expect(filaAlerta).toContainText("Bajo");
  });
});