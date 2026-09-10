---
name: qvac-sdk
description: >
  Tether QVAC JS/TS SDK 0.18.2, Bare worker, plugins llamacpp, VisionPsy Nano
  y empaquetado. Úsala al importar @qvac/sdk o @qvac/inference, loadModel,
  completion, qvac.config, QvacForgePlugin, expo-plugin, GGUF, mmproj o Bare.
---

# QVAC SDK 0.18.2 (ViáticoCero)

Pin **`@qvac/sdk@0.18.2`**. In-process Bare: **`@qvac/inference@0.18.2`**. `@qvac/bare-sdk` está deprecado (último release 0.18.2): no lo añadas.

## Dónde puede vivir el SDK

| Sí | No |
| --- | --- |
| `apps/mobile/src/adapters/driven/qvac-visionpsy` | `packages/core/**` |
| `apps/desktop/src/adapters/driven/qvac-llm` | `packages/contracts/**` |
| `apps/desktop/src/adapters/driven/qvac-provider` | `apps/desktop/src/renderer/**` |
| Composition roots de cada app | Tests unitarios de dominio |

El adaptador llama al SDK **directo**. Sin fachada “por si acaso”. Un bump de versión es un cambio de `package.json`, no un shim.

## Plugin

Ambos modelos (VisionPsy y Qwen Instruct) usan llama.cpp:

```json
{ "plugins": ["@qvac/sdk/llamacpp-completion/plugin"] }
```

JSON por app en `apps/*/config/qvac` (válido en Node, Bare y Expo). No `qvac.config.ts` en móvil. No listes TTS/ASR/diffusion “por si acaso”.

Bare in-process: registrar `llmPlugin` **antes** de la primera llamada (`plugins([llmPlugin])` + `bare-process` como `globalThis.process`).

## Modelos en este producto

- **Móvil:** VisionPsy Nano, una imagen, path en disco (`attachments[].path`). Document understanding / OCR on-device (Tether).
  - Tickets densos: **Base** (`*_1`, **sin** `image_no_upscale`).
  - Latencia / RAM justa: **Flash** + `VISIONPSY_NANO_460M_MULTIMODAL_Q8_0` + mmproj homónimo + `image_no_upscale: 'on'`.
  - Mezclar flag y par degrada calidad y pasa validación: no lo hagas.
- **Desktop:** `QWEN3_4B_INST_Q4_K_M` (Instruct). **No** `QWEN3_4B_Q4_K_M` (difusión). El adaptador `qvac-llm` nombra la constante; el dominio no. El modelo no emite `PROCEDE`.

Detalle de pares: `Docs/04-qvac-visionpsy-bare.md`.

## Empaquetado

- Desktop: `QvacForgePlugin`, `asar: false`, Vite `dist/main|preload|renderer`, no universal macOS, Linux `--no-sandbox`.
- Móvil: `@qvac/sdk/expo-plugin`, `minSdkVersion` 29, **device físico**, no Expo Go, no emulador.

Docs oficiales: [JS/TS SDK](https://docs.qvac.tether.io/js-ts-sdk/), [Electron](https://docs.qvac.tether.io/tutorials/electron/), [Expo](https://docs.qvac.tether.io/tutorials/expo/), [Multimodal](https://docs.qvac.tether.io/ai-capabilities/multimodal/), [Plugins](https://docs.qvac.tether.io/configuration/plugins/).
