# Referencias de código QVAC

ViáticoCero no copia archivos de esos repos; copia **formas**.

## Oficiales Tether

| Recurso | Qué se tomó |
| --- | --- |
| [tetherto/qvac](https://github.com/tetherto/qvac) | Monorepo SDK; worker Bare |
| [Docs: Build an Electron app](https://docs.qvac.tether.io/tutorials/electron/) | electron-vite `react-ts`; `src/main\|preload\|renderer`; Forge; `asar: false` |
| [Docs: Build an Expo app](https://docs.qvac.tether.io/tutorials/expo/) | Expo 54, `expo-plugin`, `minSdkVersion` 29, device físico |
| [Docs: JS/TS SDK](https://docs.qvac.tether.io/js-ts-sdk/) | Node ≥ 22.17; Bare; JSON de config |
| [Docs: Multimodal](https://docs.qvac.tether.io/ai-capabilities/multimodal/) | Pares VisionPsy + `image_no_upscale` |
| [Docs: Delegated inference](https://docs.qvac.tether.io/p2p-capabilities/delegated-inference/) | `startQVACProvider` / `loadModel({ delegate })` |
| [Docs: Plugin system](https://docs.qvac.tether.io/configuration/plugins/) | `llamacpp-completion`; Bare in-process |
| [System requirements](https://docs.qvac.tether.io/system-requirements/) | Android 12+ arm64; sin emulador |
| [Changelog 0.18.2](https://qvac.tether.io/changelog/sdk-v0-18-2) | Pin |
| [e2e electron/main.ts](https://github.com/tetherto/qvac/blob/main/packages/sdk/e2e/tests/electron/main.ts) | `no-sandbox` |
| Commit [6536b03](https://github.com/tetherto/qvac/commit/6536b0329c5adb3737adc079cdf86dc2722b79f1) | `QvacForgePlugin` |

## Productos que ya combinan hexagonal / P2P / Expo

| Recurso | Qué se tomó | Qué no |
| --- | --- | --- |
| [Helldez/JarvisQ](https://github.com/Helldez/JarvisQ) | core platform-free; SDK sin fachada; desktop + móvil | Voz, SDK 0.9, un solo `src/` |
| [Helldez/Resonance DESKTOP.md](https://github.com/Helldez/Resonance/blob/main/docs/DESKTOP.md) | mismo hexágono, worker Bare por target | su P2P de agentes |
| [edycutjong/beacon](https://github.com/edycutjong/beacon) | QR pairing; provider en laptop; `delegate` | vision SmolVLM; UI desktop mínima |

## Tutorial → carpetas nuestras

| Origen | ViáticoCero |
| --- | --- |
| Electron `src/main` | `apps/desktop/src/main` + `composition/electron` + `qvac-llm` |
| Electron `src/renderer` | `apps/desktop/src/renderer` (excepciones, liquidación, export) |
| Electron `qvac/` | `apps/desktop/qvac/` |
| Expo `app.json` plugins | `apps/mobile` (manifiesto aún no creado) |
| Expo pantallas | `apps/mobile/app/{capture,motive,preview,pairing}` |
| Expo VisionPsy | `apps/mobile/src/adapters/driven/qvac-visionpsy` |
| DTOs | `packages/contracts/*` |
| Dominio | `packages/core` |

## VisionPsy (producto)

Tether lo anuncia como líder de su clase ~0.5B en **document understanding and OCR** (y en las otras tres categorías que midieron). ViáticoCero lo usa para eso, en el teléfono. El motor de reglas no es una disculpa del Psy: es la tapa de autoridad sobre dinero.

- [Blog VisionPsy-Nano](https://qvac.tether.io/blog/visionpsy-nano-state-of-the-art-vision-ai-in-its-weight-class-small-enough-to-run-on-your-phone/)
- [Models — QVAC VisionPsy](https://qvac.tether.io/models/)
