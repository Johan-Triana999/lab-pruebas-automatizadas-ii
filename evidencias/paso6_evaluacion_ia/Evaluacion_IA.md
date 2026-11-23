# Evaluación crítica del uso de IA — Laboratorio Pruebas Automatizadas II + IA

## 1. Prompts clave utilizados
Se adaptaron y ejecutaron tres prompts reales de la carpeta `/prompts` del repositorio sobre el contexto de **StockPascual**:

1. **Prompt 02 — Generación y refino de casos de prueba (`prompts/02_casos_de_prueba.md`):**
   > *"Eres QA Analyst diseñando la suite de pruebas del MVP StockPascual (inventarios de la Institución Universitaria Pascual Bravo). Usuarios de prueba: admin / Admin123!, operador / Oper123!. Genera una suite en tabla Markdown con columnas: ID | Módulo | Título | Precondiciones | Pasos | Datos de prueba | Resultado esperado | Prioridad (P0/P1/P2) | Automatizable (Sí/No)... Elimina redundancias, mejora datos de prueba y agrega 5 casos de frontera que no estén."*

2. **Prompt 03 — Misión de pruebas exploratorias (`prompts/03_exploracion_guiada.md`):**
   > *"Actúa como coach de pruebas exploratorias por sesión. Sistema: StockPascual, inventarios web de la IU Pascual Bravo, roles admin y operador. Diseña 3 misiones de exploración de 25 minutos cada una, enfocadas en: A) Integridad de stock, B) Credibilidad del dashboard y del CSV, C) Abuso de permisos / seguridad básica de UI."*

3. **Prompt de análisis de riesgos (`prompts/01_analisis_riesgos.md`):**
   > Utilizado para estructurar la matriz inicial de riesgos técnicos y de negocio priorizando impacto en el almacén institucional, de donde surgieron las hipótesis de validación de entradas, salidas, permisos por rol y seguridad.

## 2. Qué acertó la IA
- **Detección exacta de vulnerabilidad XSS almacenado (`BUG-01` / TC-27):** La IA sugirió probar el payload `<img src=x onerror=alert(1)>` en el campo Nombre del producto; al ejecutarlo en `http://localhost:3080`, el navegador ejecutó el JavaScript y lanzó la alerta emergente `1`, confirmando el incumplimiento de RNF-02.
- **Identificación de fallos de integridad de datos (`BUG-02` y `BUG-03`):** Acertó al incluir casos negativos para SKUs repetidos (`ARD-UNO-01`) y valores numéricos negativos (`-$ 1.500` en precio y `-1` en stock), los cuales la aplicación aceptó sin validación.
- **Estructuración rápida de artefactos de QA:** Permitió generar en minutos una matriz de 33 casos con cobertura funcional, negativa, de seguridad y frontera, acelerando la fase de diseño.

## 3. Qué alucinó o inventó sin evidencia
- **Datos semilla y SKUs inexistentes:** Antes de abrir la aplicación, la IA propuso casos con códigos de inventario inventados (`PROTO-830`, `SENS-ULT-04`, `MULT-DIG-02`) que no existían en la base de datos inicial de StockPascual (donde los reales eran `CAB-USB-01`, `MOU-WL-02`, `MON-24-04`, etc.).
- **Suposiciones sobre la arquitectura interna de autenticación:** Durante la Misión C, sugirió buscar un token JWT en `localStorage.getItem('token')` y probar rutas API específicas sin haber inspeccionado previamente el código fuente ni la pestaña Network del navegador.
- **Módulos fuera del alcance del MVP:** En el análisis de riesgos incluyó una hipótesis sobre "falta de trazabilidad en la bitácora de auditoría de cambios", funcionalidad que no estaba especificada en los requisitos base del MVP.

## 4. Riesgos o bugs que la IA no vio y el equipo sí encontró
- **Ambigüedad de usabilidad (UX) entre Edición de Producto y Movimientos:** La IA asumió que el flujo para incrementar o disminuir existencias era evidente en la interfaz. En la ejecución real, el equipo detectó que el modal **Editar** bloquea la modificación de stock (cumpliendo RF-02) sin indicar visualmente al usuario que debe ir al botón **`+ Movimiento`**, generando bloqueos operativos iniciales (`TC-06` a `TC-08`).
- **Impacto visual y persistencia del XSS en cada recarga:** La IA planteó el XSS como una prueba puntual, pero al ejecutarlo en vivo el equipo observó que el `alert(1)` bloquea la navegación cada vez que se renderiza la tabla de Productos hasta eliminar el registro afectado.
- **Renderizado contable de cifras negativas:** El equipo evidenció directamente en la interfaz cómo el sistema formatea valores corruptos (`-$ 1.500` y stock `-1`) junto al estado `Agotado`, afectando la lectura inmediata del catálogo.

## 5. Falsos positivos: la IA dijo “bug” y no lo era
- **Bloqueo de edición de stock en el formulario de Productos:** Al reportar que el sistema "no permitía incrementar ni disminuir el stock" desde el botón Editar, inicialmente se interpretó como un fallo funcional en `TC-06`, `TC-07` y `TC-08`; al contrastar con `Requisitos_StockPascual_MVP.md` (RF-02), se confirmó que es el comportamiento esperado porque el stock solo cambia mediante movimientos (`IN`, `OUT`, `ADJUST`).
- **Sospecha de controles CRUD ocultos en el DOM para el rol `operador`:** En la Misión C se planteó como riesgo probable que los botones de crear/editar/eliminar estuvieran simplemente ocultos por CSS para `operador`; al validar en la app (`TC-25`), el perfil restringió correctamente el acceso al catálogo.

## 6. Momento de mayor valor frente a mayor pérdida de tiempo

| Aspecto | Descripción en el laboratorio |
| :--- | :--- |
| **Mayor valor** | El diseño de casos negativos y payloads de seguridad (especialmente `<img src=x onerror=alert(1)>` y las pruebas de frontera con precios/stocks negativos y SKUs duplicados), que permitieron descubrir los 3 defectos P0 (`BUG-01`, `BUG-02`, `BUG-03`) en pocos minutos. |
| **Mayor pérdida de tiempo** | La fricción al trasladar tablas Markdown con saltos de línea internos hacia Excel/CSV (desordenando filas y columnas) y la generación de casos con SKUs ficticios que obligaron a adaptar manualmente los datos contra el catálogo real de la aplicación. |

## 7. Reflexión
No sería viable ni responsable contratar un proceso de QA 100 % reemplazado por inteligencia artificial en la Institución Universitaria Pascual Bravo. Aunque la IA demostró gran velocidad para estructurar matrices de prueba y proponer vectores de ataque como el XSS almacenado (`BUG-01`) o las validaciones de valores negativos (`BUG-03`), carece de criterio contextual para distinguir entre un defecto real y una regla de negocio intencional, como ocurrió con el bloqueo de stock en la edición de productos (RF-02). Además, la IA no ejecuta la aplicación por sí sola ni percibe problemas reales de experiencia de usuario, fricciones de navegación o el impacto institucional de que un almacén universitario pierda trazabilidad por SKUs duplicados (`BUG-02`). Un modelo generativo puede alucinar endpoints o datos inexistentes si no hay un ingeniero que contraste cada salida contra el sistema real y sus requisitos. En un entorno académico y administrativo, la IA funciona como un excelente copiloto que multiplica la cobertura y velocidad del tester, pero la validación crítica, la priorización de riesgos y la decisión final de salida a producción deben seguir bajo responsabilidad humana.