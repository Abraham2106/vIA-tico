# ADR 0002 — Pin `@qvac/sdk` 0.18.2

## Estado

Aceptada.

## Contexto

El usuario pidió la línea **18.2**. VisionPsy Nano llega en 0.18.0; 0.18.2 es el parche publicado de esa línea. `@qvac/bare-sdk` queda deprecado en 0.18.2.

## Decisión

- Dependencia de aplicación: `@qvac/sdk@0.18.2`.
- Camino Bare: `@qvac/inference@0.18.2`, no `bare-sdk`.
- Sin capa wrapper: el adaptador driven importa el SDK.

## Consecuencias

- Addons nativos y prebuilds Bare quedan acoplados a 0.18.2 hasta un bump consciente.
- No se usa la API Python.
