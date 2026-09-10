# Autoridad y pipeline

Cómo se pasa de una foto a `PROCEDE | REVISIÓN | NO PROCEDE` sin que el modelo tenga la última palabra. El dibujo usa un comprobante de viaje (cuña); el patrón es cualquier documento financiero vs reglas vs excepciones.

## Cadena (única)

```
foto + motivo libre (opcional)
  → VisionPsy (móvil)           RAW + JSON candidato
  → schema / grammar            si no parsea → REVISIÓN
  → Qwen Instruct (desktop)     postproceso lingüístico + classify-motive
  → validador de dígitos        si 12.50 ≠ 1.50 → se queda el RAW, needsReview
  → política + viaje + duplicados + confianza
  → contracts/verdict (solo core)
  → humano solo si REVISIÓN
  → conciliación + auditoría
```

El LLM de escritorio **no** es un segundo OCR y **no** autoriza. Postproceso: acentos, etiquetas, campos. `classify-motive`: categoría + `confianza_clasificacion` + razón. **Ningún** DTO de IA lleva `veredicto`. Cualquier cambio de dígito, fecha o moneda invalida el postproceso.

El RAW de VisionPsy **no se borra** (auditoría).

## Schema (contrato)

`packages/contracts/vision-result` es la boca de VisionPsy. `motive-classification` es la boca del clasificador de motivo. `verdict` solo lo escribe `packages/core`.

```json
{
  "proveedor": "…",
  "fecha": "YYYY-MM-DD",
  "monto": 0,
  "moneda": "CRC",
  "tipo_documento": "recibo",
  "confianza_lectura": "alta",
  "raw_text": "…"
}
```

- Output restringido (JSON / grammar si el runtime lo permite). Texto libre del modelo no entra al dominio.
- `confianza_lectura` baja o media **fuerza** `REVISIÓN`, aunque el resto «cuadre».
- Campos imposibles de parsear → excepción, no relleno inventado.

`motive-classification` (sin `veredicto`):

```json
{
  "categoria": "representacion",
  "razon": "Gasto asociado a reunión con cliente.",
  "confianza_clasificacion": "alta"
}
```

## Qué decide el código (`packages/core`)

| Señal | Veredicto típico |
| --- | --- |
| Fecha fuera de la ventana del viaje | REVISIÓN |
| Posible duplicado (proveedor + fecha + monto [+ id]) | REVISIÓN |
| Confianza baja / documento ilegible | REVISIÓN |
| Motivo ambiguo o `confianza_clasificacion` baja | REVISIÓN |
| Dígitos alterados por el postproceso | se descarta el postproceso; REVISIÓN |
| Tope de política excedido | NO PROCEDE o REVISIÓN según regla |
| Todo cuadra, confianza alta | PROCEDE |

`validate-policy` es autoridad. `analyze-with-llm` es interpretación. Mezclarlos en el adaptador QVAC está prohibido.

## Daño acotado

Igual que Warden no deja autorizar al modelo, Al Toque no envía dinero sin confirmar y Parking no dice PARK sin evidencia:

- VisionPsy no aprueba el gasto.
- Qwen no liquida.
- No hay tool de «pagar» ni de «marcar PROCEDE» expuesta al modelo.
- El peor caso de una alucinación es **una fila ⚠** en el centro de excepciones.

## Conciliación (código, no IA)

Adelanto vs suma de comprobantes vs suma **PROCEDE** vs pendiente de revisión (`reconcile-advance`, `settle-trip`). El modelo no suma la liquidación.

## Auditoría

`record-audit` guarda RAW, JSON, confianzas, categoría, reglas, veredicto, intervención humana, timestamps (ejemplo tipo comprobante #0042 en `Docs/00-producto.md` §10). Pregunta: «¿por qué este gasto terminó aprobado?»

## Test de QVAC

Sustituir VisionPsy por regex/Tesseract en un ticket sucio **rompe** la comprensión documental. Sustituirlo por Gemini **rompe** privacidad y el track. Sustituir el motor de reglas por «el LLM dice que procede» **rompe** el producto aunque el modelo sea local.
