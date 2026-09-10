# ADR 0001 — Arquitectura hexagonal

## Estado

Aceptada.

## Contexto

ViáticoCero combina un dominio de gastos con **dos** runtimes nativos (Expo/BareKit en Android, Electron/Bare en desktop) y dos UIs (RN vs React DOM). Esos mundos cambian a ritmos distintos.

## Decisión

Puertos y adaptadores. `packages/core` no importa frameworks ni `@qvac/sdk`. Los adaptadores viven en cada app.

## Consecuencias

- Añadir un target es un paquete de app, no un rewrite del dominio.
- Tests de política/liquidación sin GPU ni GGUF (`tests/unit`).
