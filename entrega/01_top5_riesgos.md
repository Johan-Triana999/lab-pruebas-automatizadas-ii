# Prompt 01 — Análisis de riesgos

## Cómo usarlo (paso a paso)

1. Abrir ChatGPT, Claude, Gemini o Cursor Chat, la herramienta acordada por el equipo.
2. Crear un chat nuevo: `Lab StockPascual - Riesgos`.
3. Seleccionar **todo** el texto del bloque de código de la sección **Prompt**, desde `Actúa como...` hasta el final de ese bloque.
4. Pegarlo en el chat y enviarlo.
5. Copiar la tabla resultante a Excel, por ejemplo `Riesgos_IA_crudo`.
6. **No entregar eso crudo**: en equipo dejar solo un Top 5 refinado, ver Paso 2 de la guía.

Si la respuesta sale muy genérica, usar también la **Variante** del final.

---

## Prompt

```
Actúa como Senior QA / Risk-Based Testing coach en una institución universitaria de Colombia.

Contexto del sistema bajo prueba (MVP web "StockPascual" de la Institución Universitaria Pascual Bravo):
- Login con roles admin y operador
- CRUD de productos (SKU, nombre, categoría, precio, stock, stock mínimo, ubicación)
- Movimientos de inventario: IN (entrada), OUT (salida), ADJUST (ajuste a inventario físico)
- Dashboard con métricas: total productos, stock bajo, agotados, valor de inventario, cantidad de movimientos
- Alertas de stock bajo
- Exportación CSV

Historia de negocio:
El almacén institucional sufrió diferencias entre stock físico y Excel. Necesitan confiar en el stock para entregar insumos a laboratorios y en el valor de inventario para decisiones administrativas.

Tarea:
1) Identifica riesgos de calidad (funcionales, datos, seguridad/roles, usabilidad, integridad, reporting).
2) Para cada riesgo indica: impacto de negocio (Alto/Medio/Bajo), probabilidad, módulo afectado, y cómo lo probarías en 1-2 ideas de prueba.
3) Devuelve una tabla Markdown ordenada por impacto × probabilidad (Top 12).
4) Señala el Top 5 que probarías primero en un piloto de almacén institucional real y justifica en 3 líneas.

Restricciones:
- No inventes módulos que no existan en el alcance.
- Sé específico del dominio inventarios (no des consejos genéricos de QA).
- Distingue severidad técnica vs impacto de negocio cuando aplique.
```

## Variante (mejorar resultados)

Agrega al final:

```
Antes de responder, lista supuestos. Si falta información crítica, hazme máximo 5 preguntas.
Después responde con la tabla.
```
