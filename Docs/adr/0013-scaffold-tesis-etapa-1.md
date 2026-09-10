# ADR 0013 — Scaffold = cuña de viáticos, no toda la tesis

## Estado

Aceptada.

## Contexto

La tesis (`Docs/00-producto.md`) es **excepciones documentales financieras**. El nombre y el demo son la **cuña**: liquidar un viaje. El scaffold se leía solo como app de viáticos.

## Decisión

1. Docs de portada (README, `00`, `Docs/README`) nombran **tesis y cuña** en ese orden.
2. El árbol hexagonal **reserva carpetas solo para la cuña** (etapa 1):

| Tesis (patrón) | Cuña (carpeta) |
| --- | --- |
| Centro de excepciones | `domain/exception`, `open-exception`, `resolve-exception`, `features/exceptions` |
| Documento vs otro registro | `domain/trip`, `validate-policy` (viaje = primer ancla; OC no se scaffoldea) |
| Comprensión documental | `analyze-receipt`, `contracts/vision-result` |
| Duplicados | `detect-duplicates` |
| Conciliación | `reconcile-advance`, `settle-trip`, `features/settlements` |
| Lenguaje / motivo | `declare-motive`, `classify-motive`, `domain/category`, `contracts/motive-classification` |
| Veredicto | `contracts/verdict` — solo `packages/core` |
| Confianza | campos en `vision-result` y `motive-classification` |
| Auditoría | `domain/audit`, `record-audit`, `contracts/audit-event`, `features/audit` |
| Export | `export-report`, `export-formats` |
| Etapas 2–3 | **sin** paquetes ni features |

El modelo **no** incluye `veredicto` en ningún DTO de IA.

## Consecuencias

- Un README que solo diga «app de viáticos» está desalineado.
- Omitir motivo, auditoría o conciliación en la cuña está incompleto.
- Crear `apps/erp` o matching OC contradice este ADR (eso es etapa 3).
