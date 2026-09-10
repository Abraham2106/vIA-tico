# ADR 0012 — Schema, RAW y evals golden

## Estado

Aceptada.

## Contexto

Sin output restringido ni casos repetibles, el pipeline vuelve a ser un chat sobre una foto. Tether mide VisionPsy en document understanding / OCR de su clase; el dominio CR/MX y el dinero siguen pidiendo un contrato y un golden set.

## Decisión

- `packages/contracts/vision-result` es schema estricto (proveedor, fecha, monto, moneda, tipo, confianza, raw). Texto libre del modelo no entra al dominio.
- Se conserva RAW. Un segundo modelo no es fuente de verdad numérica.
- Golden set: al menos período inválido, duplicado, ticket denso, ilegible, y varios PROCEDE.
- Tests de política/duplicados/dígitos en `tests/unit` (sin GGUF). Integración VisionPsy en device físico.
- Perfil **Base** para comprobantes densos si la RAM del teléfono da; **Flash** cuando el criterio es latencia. No mezclar mmproj y `image_no_upscale`.

## Consecuencias

- Enmenda el default «siempre Flash» de ADR 0004 para este dominio.
- Sin golden set no hay demo creíble ni log de calidad de dominio.
