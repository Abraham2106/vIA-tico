# Stack de ViáticoCero

Versiones y runtime **fijados**. Un hexágono, dos toolchains; no se mezcla un segundo motor de inferencia.

## Matriz

| Capa | Elección | Versión / nota |
| --- | --- | --- |
| Lenguaje | TypeScript | `packages/*` y ambas apps |
| Inferencia | Tether **QVAC** JS/TS SDK | **`@qvac/sdk@0.18.2`** en móvil y desktop |
| Motor in-process Bare | `@qvac/inference` | Misma línea **0.18.2** (`@qvac/bare-sdk` deprecado) |
| Visión (solo celular) | **VisionPsy Nano** | Constantes multimodales 0.18.x; una imagen por query |
| LLM (solo escritorio) | Modelo pesado vía QVAC llama.cpp | No corre en el teléfono |
| Worker | **Bare** | Bundle por app (`apps/*/qvac/`); `asar: false` en Electron |
| App escritorio | Electron + React + Vite | `electron-vite` template `react-ts` **dentro de** `apps/desktop` |
| App móvil | Expo + React Native | Expo **≥ 54**, `react-native-bare-kit`, `@qvac/sdk/expo-plugin` |
| Empaquetado desktop | Electron Forge + `QvacForgePlugin` | Tutorial QVAC Electron |
| Empaquetado móvil | Prebuild nativo Expo | `npx expo run:android --device` — no Expo Go, no emulador |
| Host Node (desktop / CI) | Node.js **≥ 22.17**, npm **≥ 10.9** | Requisito del SDK |
| Android | API 31+ / `minSdkVersion` 29, **arm64 físico** | Requisito QVAC; Vulkan/OpenCL si hay GPU |

`18.2` es **QVAC SDK 0.18.2**, no React 18.2. Cada app trae la UI que dicta su tutorial (electron-vite vs Expo 54).

## Por qué este split

1. VisionPsy Nano cabe en el bolsillo; un LLM pesado no. El celular extrae; el PC razona.
2. Expo y electron-vite **no caben en un solo `package.json`** (Metro vs Vite, RN vs React DOM, plugin Expo vs Forge). Por eso monorepo, no paquete único.
3. Electron **sigue siendo producto**: inbox, detalle, guardar, exportar. No es un daemon sin UI.
4. El SDK se llama **directo** en cada adaptador driven. Subir de 0.18.2 es un bump, no un shim.
5. `llamacpp-completion` es el plugin de ambos modelos (VLM y LLM). Config JSON **por app**, porque el bundle nativo debe ser distinto.

## Qué queda fuera

- Kotlin/Jetpack como app (Android Studio es toolchain: `adb`, SDK).
- Python `tetherto-qvac-sdk`.
- OCR `ggml-ocr` (VisionPsy cubre el comprobante).
- UI compartida React ↔ React Native (solo tipos y dominio).

## Plugins QVAC por app (cuando existan los JSON)

Móvil (`apps/mobile/config/qvac`):

```json
{ "plugins": ["@qvac/sdk/llamacpp-completion/plugin"] }
```

Escritorio (`apps/desktop/config/qvac`): el mismo plugin; el **modelo** cargado es el LLM pesado, no VisionPsy. Listar de más hincha el worker (TTS, diffusion, ASR).
