# QVAC, VisionPsy, Qwen Instruct y Bare

## SDK 0.18.2

- npm: [`@qvac/sdk@0.18.2`](https://www.npmjs.com/package/@qvac/sdk/v/0.18.2)
- Changelog: [QVAC SDK v0.18.2](https://qvac.tether.io/changelog/sdk-v0-18-2)
- Móvil y desktop hablan el **mismo** cliente; el worker Bare va empaquetado **por app**.

`@qvac/bare-sdk` muere en 0.18.2. In-process Bare = `@qvac/inference`.

## Dónde corre cada modelo

| Modelo | App | Rol |
| --- | --- | --- |
| VisionPsy Nano | `apps/mobile` | Document understanding / OCR on-device; una imagen; `projectionModelSrc` |
| Qwen3-4B-Instruct (`QWEN3_4B_INST_Q4_K_M`) | `apps/desktop` | Postproceso lingüístico del DTO. No autoriza. No usar `QWEN3_4B_Q4_K_M` (difusión) |

No se delega VisionPsy al PC. El teléfono comprende el documento; el PC no es un segundo OCR.

Tether anuncia VisionPsy-Nano como SOTA de su clase de peso en *document understanding and OCR* (y el resto de categorías que midieron). Ese es el Psy del flujo principal. El validador de dígitos no niega el anuncio: evita convertir una predicción en asiento (ADR 0010).

### VisionPsy Nano (móvil)

| Perfil | Weights | mmproj | `image_no_upscale` | Cuándo |
| --- | --- | --- | --- | --- |
| **Base** | sufijo `_1` | `MMPROJ_VISIONPSY_NANO_460M_MULTIMODAL_Q8_0_1` | no setear | Comprobante denso (ticket térmico, mucho texto) |
| **Flash** | `VISIONPSY_NANO_460M_MULTIMODAL_Q8_0` o `_Q4_K_M` | `MMPROJ_VISIONPSY_NANO_460M_MULTIMODAL_Q8_0` | `'on'` | Latencia / RAM justa (64 tokens visuales) |

Mezclar flag y par **pasa validación y degrada calidad**. Solo el adaptador `qvac-visionpsy` conoce las constantes.

Una imagen por query. El DTO se valida en `contracts` (schema + confianza + RAW). El dominio sigue en español: las etiquetas se alinean en desktop; los números no se reescriben a ciegas.

Adjuntos: `history[].attachments: [{ path }]`. Por eso `filesystem` + `resources/samples/receipts` en móvil.

### Qwen Instruct (desktop)

El hexágono solo ve `ILanguageModel`. Ese proceso además puede `startQVACProvider()` para delegated inference (opcional, ADR 0008).

## Bare y empaquetado

**Electron** (tutorial + commit `6536b03`):

1. Bundle en `apps/desktop/qvac/worker.bundle.js`.
2. `asar: false` (addons `.bare` no cargan desde `app.asar`).
3. Sin build universal macOS.
4. Vite → `dist/main|preload|renderer`.
5. Linux: `--no-sandbox`.

**Expo:** `react-native-bare-kit` + `@qvac/sdk/expo-plugin`, `minSdkVersion` 29, **dispositivo físico**. `qvac.config.json` (no `.ts`).

## Transporte teléfono → escritorio

Camino de producto: DTO `vision-result` envuelto en `analysis-job`, inbox + excepciones en Electron.

Camino opcional QVAC: [delegated inference](https://docs.qvac.tether.io/p2p-capabilities/delegated-inference/). Cold DHT 15–45 s. Eso **no** sustituye el veredicto en core ni el export.

## Dónde **no** va QVAC

- `apps/desktop/src/renderer/**`
- `packages/core/**` (incluido `validate-policy`)
- `packages/contracts/**` (solo datos)
- Tests unitarios (`tests/unit`) — se mockean los puertos

Integración real: `apps/*/tests/integration/qvac`.
