# Autoridad y pipeline

Cómo se pasa de una foto a `PROCEDE | REVISIÓN | NO PROCEDE` sin que el modelo tenga la última palabra.

## Cadena (única)

```
foto
  → VisionPsy (móvil)           RAW + JSON candidato
  → schema / grammar            si no parsea → REVISIÓN
  → Qwen Instruct (desktop)     postproceso lingüístico
  → validador de dígitos        si 12.50 ≠ 1.50 → se queda el RAW, needsReview
  → política + viaje + duplicados
  → veredicto de código
  → humano solo si REVISIÓN
```

El LLM de escritorio **no** es un segundo OCR y **no** autoriza. Puede acentuar, traducir etiquetas y ordenar campos. Cualquier cambio de dígito, separador decimal, fecha, moneda, RFC/IVA o monto invalida el postproceso.

El RAW de VisionPsy **no se borra** (auditoría).

## Schema (contrato)

`packages/contracts/vision-result` es la boca del modelo. Intención:

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

## Qué decide el código (`packages/core`)

| Señal | Veredicto típico |
| --- | --- |
| Fecha fuera de la ventana del viaje | REVISIÓN |
| Posible duplicado (proveedor + fecha + monto [+ id]) | REVISIÓN |
| Confianza baja / documento ilegible | REVISIÓN |
| Motivo ambiguo («compré unas cosas») | REVISIÓN |
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

Adelanto vs suma de comprobantes vs suma **aprobada** vs pendiente de revisión. Aritmética en el dominio (`settle-trip`). El modelo no suma la liquidación.

## Auditoría

Cada comprobante guarda: RAW, JSON extraído, confianza, reglas disparadas, veredicto, intervención humana, timestamps. Pregunta objetivo: «¿por qué este gasto terminó aprobado?»

## Test de QVAC

Sustituir VisionPsy por regex/Tesseract en un ticket sucio **rompe** la comprensión documental. Sustituirlo por Gemini **rompe** privacidad y el track. Sustituir el motor de reglas por «el LLM dice que procede» **rompe** el producto aunque el modelo sea local.
