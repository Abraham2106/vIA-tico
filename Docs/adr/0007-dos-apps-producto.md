# ADR 0007 — Dos apps de producto (móvil captura, desktop registro)

## Estado

Aceptada (enmendada: el desktop es excepciones + liquidación, no un visor del LLM).

## Contexto

El celular corre VisionPsy; el PC corre Qwen Instruct y es el sistema de registro. Un provider headless no muestra excepciones ni liquida.

## Decisión

- `apps/mobile`: cámara, preview del DTO, pairing, envío.
- `apps/desktop`: inbox, **centro de excepciones**, liquidación, persistencia, exporters (PDF, CSV, XLSX, JSON), provider P2P opcional.
- El desktop es el sistema de registro. El veredicto (`PROCEDE | REVISIÓN | NO PROCEDE`) sale de `packages/core`, no de la UI ni del LLM (ADR 0010, 0011).

## Consecuencias

- Emparejamiento (QR / clave del provider) es un caso de uso (`pair-devices`).
- Sin pantallas de export ni de política pesada en el teléfono.
- Kotlin nativo no es el stack de producto (sí el toolchain `adb`/SDK).
- **Flutter tampoco:** el móvil es Expo / React Native (ADR 0009).
