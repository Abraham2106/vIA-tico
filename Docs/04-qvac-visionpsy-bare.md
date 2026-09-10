# QVAC, VisionPsy, LLM pesado y Bare

## SDK 0.18.2

- npm: [`@qvac/sdk@0.18.2`](https://www.npmjs.com/package/@qvac/sdk/v/0.18.2)
- Changelog: [QVAC SDK v0.18.2](https://qvac.tether.io/changelog/sdk-v0-18-2)
- Móvil y desktop hablan el **mismo** cliente; el worker Bare va empaquetado **por app**.

`@qvac/bare-sdk` muere en 0.18.2. In-process Bare = `@qvac/inference`.

## Dónde corre cada modelo

| Modelo | App | Cómo se carga |
| --- | --- | --- |
| VisionPsy Nano | `apps/mobile` | `loadModel` local + `projectionModelSrc` + adjunto en disco |
| LLM pesado | `apps/desktop` | `loadModel` local en main; la UI no importa el SDK |

No se delega VisionPsy al PC. El teléfono extrae; el PC analiza el DTO.

### VisionPsy Nano (móvil)

| Perfil | Weights | mmproj | `image_no_upscale` |
| --- | --- | --- | --- |
| **Flash** (default) | `VISIONPSY_NANO_460M_MULTIMODAL_Q8_0` o `_Q4_K_M` | `MMPROJ_VISIONPSY_NANO_460M_MULTIMODAL_Q8_0` | `'on'` |
| **Base** | sufijo `_1` | `MMPROJ_VISIONPSY_NANO_460M_MULTIMODAL_Q8_0_1` | no setear |

Mezclar flag y par **pasa validación y degrada calidad**. Solo el adaptador `qvac-visionpsy` conoce las constantes.

VisionPsy está optimizado en **inglés** y **una imagen**. El DTO se valida en `contracts`; el dominio sigue en español.

Adjuntos: `history[].attachments: [{ path }]`. Por eso `filesystem` + `resources/samples/receipts` en móvil.

### LLM pesado (desktop)

La constante concreta se elige en implementación (GGUF llama.cpp vía el mismo plugin). El hexágono solo ve `ILanguageModel`. Ese proceso además puede `startQVACProvider()` para delegated inference.

## Bare y empaquetado

**Electron** (tutorial + commit `6536b03`):

1. Bundle en `apps/desktop/qvac/worker.bundle.js`.
2. `asar: false` (addons `.bare` no cargan desde `app.asar`).
3. Sin build universal macOS.
4. Vite → `dist/main|preload|renderer`.
5. Linux: `--no-sandbox`.

**Expo:** `react-native-bare-kit` + `@qvac/sdk/expo-plugin`, `minSdkVersion` 29, **dispositivo físico** (llama.cpp no corre en emulador). `qvac.config.json` (no `.ts`: Bare/Expo no lo leen igual).

## Transporte teléfono → escritorio

Camino de producto: DTO `vision-result` envuelto en `analysis-job`, inbox en Electron.

Camino opcional QVAC: [delegated inference](https://docs.qvac.tether.io/p2p-capabilities/delegated-inference/) — `loadModel({ delegate: { providerPublicKey } })` desde el celular hacia el LLM del PC. Cold DHT 15–45 s. Eso **no** sustituye guardar/exportar en la UI desktop.

## Dónde **no** va QVAC

- `apps/desktop/src/renderer/**`
- `packages/core/**`
- `packages/contracts/**` (solo datos)
- Tests unitarios (`tests/unit`) — se mockean los puertos

Integración real: `apps/*/tests/integration/qvac`.
