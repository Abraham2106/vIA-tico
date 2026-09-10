# ADR 0005 — Bare como entorno de inferencia

## Estado

Aceptada (enmendada: un `qvac/` **por app**).

## Contexto

El worker QVAC corre en Bare. Electron lo spawnea; Expo lo embebe vía BareKit; un proceso Bare usa `@qvac/inference` y registra plugins a mano.

## Decisión

- `apps/desktop/qvac/` y `apps/mobile/qvac/` — bundles distintos.
- Config JSON en `apps/*/config/qvac` (válido en Node, Bare y Expo; no `.ts` en móvil).
- `apps/desktop/src/composition/bare` para in-process; `apps/mobile/src/composition/expo` para BareKit.

## Consecuencias

- El worker del teléfono no arrastra el LLM de escritorio.
- Electron: `asar: false`. Móvil: prebuild nativo, device físico.
