# ADR 0005 — Bare como entorno de inferencia

## Estado

Aceptada.

## Contexto

El worker QVAC corre en **Bare**. Node/Electron hablan con ese worker; un proceso Bare usa `@qvac/inference` in-process y debe registrar plugins a mano (`bare-process` como `globalThis.process`).

## Decisión

- Carpeta `qvac/` reservada al bundle del worker.
- `src/composition/bare` + `src/adapters/driven/qvac-bare` para el camino in-process.
- `config/qvac` usará **JSON** (válido en Node y Bare; `qvac.config.ts` no corre en Bare).

## Consecuencias

- Dos compositions, un solo hexágono.
- Sin `asar`. Prebuilds por arch.
