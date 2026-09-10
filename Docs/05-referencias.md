# Referencias de código QVAC

Consultadas para este scaffold. Fuentes oficiales de QVAC y tutoriales Tether.

## Oficiales Tether

| Recurso | Uso |
| --- | --- |
| [tetherto/qvac](https://github.com/tetherto/qvac) | Monorepo SDK; worker Bare; addons |
| [Docs: Build an Electron app](https://docs.qvac.tether.io/tutorials/electron/) | `electron-vite` + `react-ts`; `src/main|preload|renderer`; IPC `loadModel` / `completion` stream; `--no-sandbox`; Forge + `QvacForgePlugin`; `dist/*` vs `out/` |
| [Docs: JS/TS SDK](https://docs.qvac.tether.io/js-ts-sdk/) | Node ≥ 22.17; Bare ≥ 1.24; `qvac.config.json` en Bare; quickstart Bare con `@qvac/inference` |
| [Docs: Multimodal](https://docs.qvac.tether.io/ai-capabilities/multimodal/) | Pares VisionPsy Flash/Base + `image_no_upscale` |
| [Docs: Plugin system](https://docs.qvac.tether.io/configuration/plugins/) | `llamacpp-completion`; registro runtime en Bare; deprecación `@qvac/bare-sdk` @ 0.18.2 |
| [Changelog 0.18.2](https://qvac.tether.io/changelog/sdk-v0-18-2) | Pin de versión |
| [Changelog 0.18.0](https://qvac.tether.io/changelog/sdk-v0-18-0) | Constantes VisionPsy Nano |
| [packages/sdk/e2e/tests/electron/main.ts](https://github.com/tetherto/qvac/blob/main/packages/sdk/e2e/tests/electron/main.ts) | Consumer Electron real: `no-sandbox`, bootstrap en main |
| [packages/sdk/examples/plugins.ts](https://github.com/tetherto/qvac/blob/main/packages/sdk/examples/plugins.ts) | Selección explícita de plugins |
| Commit [6536b03](https://github.com/tetherto/qvac/commit/6536b0329c5adb3737adc079cdf86dc2722b79f1) | `QvacForgePlugin`, `asar: false`, tree-shake de addons |

## Producto hexagonal sobre QVAC

| Recurso | Uso |
| --- | --- |
| [Helldez/JarvisQ](https://github.com/Helldez/JarvisQ) | `core` platform-free; puertos; `@qvac/sdk` **sin** fachada; Electron main hospeda inferencia; renderer solo I/O |
| [Helldez/Resonance `docs/DESKTOP.md`](https://github.com/Helldez/Resonance/blob/main/docs/DESKTOP.md) | Mismo núcleo hexagonal + worker Bare distinto por target (Electron vs Expo) |

JarvisQ usa voz (STT/TTS) y `@qvac/sdk` 0.9.x. ViáticoCero **no** hereda ese pipeline ni esa versión: hereda el recorte hexagonal y sube a **0.18.2** + VisionPsy.

## Tutorial → carpetas nuestras

| Tutorial QVAC Electron | ViáticoCero |
| --- | --- |
| `src/main/index.ts` | `src/main/` + `src/composition/electron/` + `src/adapters/driven/qvac-visionpsy/` |
| `src/preload/index.ts` | `src/preload/` + `src/adapters/driving/renderer-bridge/` |
| `src/renderer/src/App.tsx` | `src/renderer/src/{pages,features,components}/` |
| `qvac.config.json` | `config/qvac/` (JSON, válido en Bare) |
| `qvac/worker.bundle.js` | carpeta `qvac/` |
| `forge.config.cjs` + plugin | decisión ADR-0003; archivo aún no creado |

## Lectura de producto VisionPsy

- [VisionPsy-Nano (blog Tether)](https://qvac.tether.io/blog/visionpsy-nano-state-of-the-art-vision-ai-in-its-weight-class-small-enough-to-run-on-your-phone/)
- [Models — QVAC VisionPsy](https://qvac.tether.io/models/)
