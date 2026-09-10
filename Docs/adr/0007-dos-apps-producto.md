# ADR 0007 — Dos apps de producto (móvil captura, desktop registro)

## Estado

Aceptada.

## Contexto

El celular corre VisionPsy; el PC corre el LLM pesado. El escritorio debe **mostrar** el análisis y **guardar/convertir**, no ser un proceso invisible.

## Decisión

- `apps/mobile`: cámara, preview del DTO, pairing, envío.
- `apps/desktop`: inbox, resultado del LLM, persistencia, exporters (PDF, CSV, XLSX, JSON), provider P2P opcional.
- El desktop es el sistema de registro de la liquidación.

## Consecuencias

- Emparejamiento (QR / clave del provider) es un caso de uso (`pair-devices`).
- Sin esas pantallas de export en el teléfono.
- Kotlin nativo no es el stack de producto (sí el toolchain `adb`/SDK).
