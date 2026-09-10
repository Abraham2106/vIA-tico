# Producto: ViáticoCero

Documento canónico de **qué es** el producto. El scaffold anterior describía «una app de escritorio que lee un recibo y exporta». Eso queda sustituido por este approach.

## Qué no es

- Una IA que lee facturas y ya.
- Una IA que aprueba o paga.
- Un ERP, un SAP, ni la etapa 3 (documentos financieros genéricos).

## Qué es

Un sistema de automatización y control de **gastos de viaje** que usa:

1. **IA** para comprender documentos y lenguaje (lo ambiguo).
2. **Código** para validar fechas, montos, duplicados, política y conciliación (lo determinista).
3. **Humanos** solo en excepciones (cuando no hay certeza).
4. **Trazabilidad** para responder «¿por qué se aprobó esto?».

Filosofía: *la IA interpreta; el sistema verifica; el humano decide cuando existe incertidumbre.*

## El problema real

En una empresa el flujo no es «abrir un PDF y copiar el monto». Es:

```
recibir → interpretar → validar → comparar → excepciones → aprobar → registrar → auditar
```

El cuello de botella no es leer el ticket nítido. Es **no saber cuáles de cien documentos requieren atención**.

ViáticoCero arranca en un caso concreto: el empleado vuelve con combustible, peajes, comida, hospedaje, estacionamiento, representación. Los papeles están sucios, mal iluminados o en formatos distintos. Cada uno debe tener sentido **dentro de ese viaje**, no en el vacío.

## Flujo de producto (etapa 1 — hackathon)

```
EMPLEADO
   │
   ▼
📷 comprobante (una imagen)
   │
   ▼
VisionPsy Nano / QVAC     →  JSON acotado + confianza   (RAW se conserva)
   │
   ▼
postproceso lingüístico   →  español, etiquetas; NUNCA cambia dígitos/fechas/moneda
   │
   ▼
validador determinista    →  schema, dígitos, duplicado, fechas vs viaje, política
   │
   ├── PROCEDE      → automático
   ├── REVISIÓN     → centro de excepciones (humano)
   └── NO PROCEDE   → justificación
   │
   ▼
conciliación (adelanto vs respaldado vs aprobado)
   │
   ▼
liquidación + reporte + auditoría
```

Etapas 2–3 (gastos generales, matching OC/factura, API ERP) **no son el demo**. Quedan como visión; no se implementan ahora.

## Centro de excepciones

La superficie principal del escritorio no es «revisar todo lo que la IA extrajo». Es la lista ⚠.

```
LIQUIDACIÓN DEL VIAJE — 8 comprobantes

✓ Combustible          PROCEDE
✓ Hospedaje            PROCEDE
✓ Peaje                PROCEDE
✓ Alimentación         PROCEDE
✓ Estacionamiento      PROCEDE
⚠ Alimentación         REVISIÓN   (confianza baja / fecha)
⚠ Documento            REVISIÓN   (posible duplicado)
✓ Combustible          PROCEDE
```

No se busca eliminar al humano. Se busca que no revise los ocho.

## El comprobante vive en un viaje

Viaje 10–14 sep + ticket 25 sep, aunque VisionPsy lo lea perfecto → **⚠ Fecha fuera del período**.  
La pregunta no es solo «¿qué dice?» sino «¿tiene sentido aquí?».

Equivalentes empresariales (factura ↔ OC) se dejan para más adelante. En etapa 1 el ancla es el **viaje** (empleado, ventana, destino, adelanto).

## VisionPsy no es un disfraz de OCR

Tether publica VisionPsy-Nano como VLM on-device que **lidera su clase de peso** en *document understanding and OCR* (junto a percepción, razonamiento e instruction following). El caso de uso anunciado incluye leer documentos y sacar texto de una escena, con post-entrenamiento sobre precios mal leídos.

ViáticoCero usa ese modelo para lo que Tether lo vende: **documento visual → estructura**, en el teléfono, sin API cloud.

Lo que Tether **no** vende: que el modelo liquide dinero. Eso es el motor de reglas (ADR 0010).

## Tareas de IA (pequeñas, no un agente libre)

| Tarea | Modelo | Output |
| --- | --- | --- |
| Comprender el comprobante | VisionPsy Nano (móvil) | JSON schema + `confianza_lectura` + RAW |
| Alinear etiquetas al español | Qwen3-4B-Instruct (desktop) | mismo schema; dígitos intocables |
| Clasificar motivo libre («almorcé con el cliente») | mismo LLM, más tarde | categoría + confianza; si es ambigua → REVISIÓN |

Sin tools que paguen. Sin «el agente decide PROCEDE».

## Confianza ≠ verdad financiera

`monto: 35000` + `confianza: baja` no es un gasto inválido: es una **excepción**. Una predicción no se convierte en asiento.

## Privacidad

```
CLOUD (no)                         EDGE (sí)
Teléfono → Internet → API          Teléfono → QVAC → VisionPsy → DTO
```

Offline-first para interpretar. La red es emparejamiento entre **sus** dispositivos, no requisito para leer el ticket.

## Integración

Ahora: reporte, CSV/Excel, JSON.  
No ahora: SAP, bancos, API ERP.

## Fórmula que hay que perseguir

```
problema donde la IA local es necesaria
    → tarea generativa concreta
    → output restringido (schema)
    → autoridad en código
    → fallo seguro
    → evals repetibles
    → demo obvio
```

Si el modelo alucina ₡35 000, el sistema abre una excepción; no liquida ₡35 000 en silencio.
