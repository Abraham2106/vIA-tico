# Golden set (ADR 0012)

Fixtures JSON de dominio, sin JPEG: cada archivo contiene `extraction` y el
`expected` (veredicto + reglas) para el viaje demo 10–14 sep.

| Fixture | Resultado esperado |
| --- | --- |
| `procede-nitido.json` | PROCEDE |
| `revision-fuera-periodo.json` | REVISIÓN / FECHA_FUERA_PERIODO |
| `revision-duplicado.json` | REVISIÓN / DUPLICADO |
| `revision-confianza-baja.json` | REVISIÓN / CONFIANZA_BAJA + DOCUMENTO_ILEGIBLE |
| `no-procede-hospedaje-tope.json` | NO PROCEDE / TOPE_HOSPEDAJE |
| `revision-motivo-ambiguo.json` | REVISIÓN / MOTIVO_AMBIGUO |

`tests/unit/application/golden-receipts.test.ts` los ejecuta con dependencias
en memoria, sin GPU. Las fotos y la integración VisionPsy requieren device
físico.
