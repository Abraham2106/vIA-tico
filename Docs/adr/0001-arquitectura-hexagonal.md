# ADR 0001 — Arquitectura hexagonal

## Estado

Aceptada.

## Contexto

ViáticoCero combina un dominio de gastos con un runtime nativo (Electron + worker Bare + addons QVAC) y una UI React. Esos tres mundos cambian a ritmos distintos.

## Decisión

Puertos y adaptadores. El dominio y los casos de uso no importan frameworks ni `@qvac/sdk`.

## Consecuencias

- Añadir Bare in-process o un futuro móvil es un adaptador nuevo.
- Más carpetas al inicio; menos reescritura cuando QVAC cambie el worker.
- Tests de política/liquidación sin GPU ni GGUF.
