# ADR 0011 — Centro de excepciones como UX principal

## Estado

Aceptada.

## Contexto

Revisar todos los comprobantes extraídos es el proceso manual que el producto dice eliminar. Una inbox de «análisis LLM» reproduce ese trabajo.

## Decisión

- La pantalla primaria de `apps/desktop` es el **centro de excepciones** (filas ⚠ / `REVISIÓN` y `NO PROCEDE`).
- Los `PROCEDE` se consolidan en la liquidación; no son la cola de trabajo.
- El demo de hackathon es: viaje + comprobante inconsistente → excepción visible, sin explicar arquitectura.
- El móvil captura y muestra preview del DTO; **no** liquida ni resuelve política pesada.

## Consecuencias

- Features UI desktop: `exceptions` al mismo nivel que `inbox` / `settlements`.
- Contabilidad no confirma cada extracción «por si acaso»; solo las excepciones.
- Enmenda ADR 0007: el escritorio no se define solo como «mostrar el análisis del LLM».
