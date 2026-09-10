# Stack de ViáticoCero

Versiones y runtime **fijados**. Un hexágono, dos toolchains; no se mezcla un segundo motor de inferencia ni una API cloud.

## Matriz

| Capa | Elección | Versión / nota |
| --- | --- | --- |
| Lenguaje | TypeScript | `packages/*` y ambas apps |
| Inferencia | Tether **QVAC** JS/TS SDK | **`@qvac/sdk@0.18.2`** en móvil y desktop |
| Motor in-process Bare | `@qvac/inference` | Misma línea **0.18.2** (`@qvac/bare-sdk` deprecado) |
| Visión (solo celular) | **VisionPsy Nano** | Document understanding / OCR on-device (Tether); una imagen por query |
| Postproceso (solo escritorio) | **Qwen3-4B-Instruct** vía llama.cpp | Constante `QWEN3_4B_INST_Q4_K_M`. **No** `QWEN3_4B_Q4_K_M` (esa entrada es difusión) |
| Autoridad | Código en `packages/core` | Schema, dígitos, duplicados, viaje, política — no el modelo |
| Worker | **Bare** | Bundle por app (`apps/*/qvac/`); `asar: false` en Electron |
| App escritorio | Electron + React + Vite | `electron-vite` `react-ts` **dentro de** `apps/desktop` |
| App móvil | **Expo + React Native** (no Flutter) | Expo **≥ 54**, `react-native-bare-kit`, `@qvac/sdk/expo-plugin` |
| Empaquetado desktop | Electron Forge + `QvacForgePlugin` | Tutorial QVAC Electron |
| Empaquetado móvil | Prebuild nativo Expo | `npx expo run:android --device` — no Expo Go, no emulador |
| Host Node (desktop / CI) | Node.js **≥ 22.17**, npm **≥ 10.9** | Requisito del SDK |
| Android | API 31+ / `minSdkVersion` 29, **arm64 físico** | Requisito QVAC; Vulkan/OpenCL si hay GPU |

`18.2` es **QVAC SDK 0.18.2**, no React 18.2. Cada app trae la UI que dicta su tutorial (electron-vite vs Expo 54).

## Por qué este split

1. VisionPsy Nano cabe en el bolsillo y es el modelo que Tether posiciona para documentos en el teléfono. Un Instruct 4B no.
2. Expo y electron-vite **no caben en un solo `package.json`**. Por eso monorepo.
3. Electron es **sistema de registro**: centro de excepciones, liquidación, export. No es un daemon ni un chat del LLM.
4. El SDK se llama **directo** en cada adaptador driven. Subir de 0.18.2 es un bump, no un shim.
5. `llamacpp-completion` sirve al VLM y al Instruct. Config JSON **por app**.

## Qué queda fuera

- **Flutter.** Ver ADR 0009.
- Kotlin/Jetpack como app (Android Studio es toolchain: `adb`, SDK).
- Python `tetherto-qvac-sdk`.
- OCR `ggml-ocr` en el scaffold: VisionPsy cubre el comprobante (document understanding / OCR de su clase). Un segundo motor de OCR sería otro adaptador, no un reemplazo del Psy.
- Inferencia cloud (visión o LLM) para features de producto.
- UI compartida React ↔ React Native (solo tipos y dominio).

## Plugins QVAC por app (cuando existan los JSON)

Móvil (`apps/mobile/config/qvac`):

```json
{ "plugins": ["@qvac/sdk/llamacpp-completion/plugin"] }
```

Escritorio (`apps/desktop/config/qvac`): el mismo plugin; el **modelo** es Qwen Instruct, no VisionPsy. Listar TTS/diffusion/ASR hincha el worker.
