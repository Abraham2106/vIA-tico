# ADR 0011 — Centro de excepciones como UX principal

## Estado

Aceptada.

## Contexto

Revisar todos los documentos extraídos es el proceso manual que el producto dice eliminar. Eso vale para cualquier cola documental financiera. La primera cola es la liquidación de un viaje.

## Decisión

- La pantalla primaria de `apps/desktop` es el **centro de excepciones** (filas ⚠ / `REVISIÓN` y `NO PROCEDE`).
- Enmienda 2026-09-11: la **ruta por defecto** es `Inicio` (resumen + flujo). La cola humana sigue siendo **Por revisar**; no se revisan los `PROCEDE` como trabajo diario.
- Los `PROCEDE` se consolidan en la liquidación; no son la cola de trabajo.
- El demo de hackathon (cuña): viaje + comprobante inconsistente → excepción visible, sin explicar arquitectura.
- El móvil captura, toma motivo libre y muestra preview del DTO; **no** liquida.

## Consecuencias

- Features UI desktop: `exceptions` (primaria), `audit`, `inbox`, `settlements`.
- Contabilidad no confirma cada extracción «por si acaso»; solo las excepciones.
- Enmenda ADR 0007: el escritorio no se define solo como «mostrar el análisis del LLM».
