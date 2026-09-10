# QVAC, VisionPsy y Bare

## SDK 0.18.2

- npm: [`@qvac/sdk@0.18.2`](https://www.npmjs.com/package/@qvac/sdk/v/0.18.2)
- Changelog: [QVAC SDK v0.18.2](https://qvac.tether.io/changelog/sdk-v0-18-2) (26 ago 2026)
- El cliente JS corre el worker **in-process sobre Bare** (RPC `bare-rpc` en Node/Electron; `@qvac/inference` si el proceso *es* Bare).

Pin 0.18.2 porque:

1. Es la línea que el usuario pidió.
2. VisionPsy Nano entra en 0.18.0; 0.18.2 es un parche de addons (`@qvac/diffusion-cpp`) sobre esa familia de constantes.
3. `@qvac/bare-sdk` muere en 0.18.2 — el scaffold **no** crea carpeta para ese paquete.

## VisionPsy Nano (modelo de visión)

Familia PSY de Tether, ~460M, una imagen por query. Para viáticos: un recibo por inferencia.

Pares oficiales (docs Multimodal):

| Perfil | Weights | mmproj | `image_no_upscale` |
| --- | --- | --- | --- |
| **Flash** (default) | `VISIONPSY_NANO_460M_MULTIMODAL_Q8_0` o `_Q4_K_M` | `MMPROJ_VISIONPSY_NANO_460M_MULTIMODAL_Q8_0` | `'on'` |
| **Base** | mismas constantes con sufijo `_1` | `MMPROJ_VISIONPSY_NANO_460M_MULTIMODAL_Q8_0_1` | no setear |

Las constantes **sin** `_1` son Flash; **con** `_1` son Base. Mezclar el flag con el par equivocado **pasa validación y degrada calidad** (los dos mmproj declaran el mismo `preproc_image_size`).

El adaptador `qvac-visionpsy` es el único sitio que puede conocer esas constantes. El caso de uso recibe `AnalyzeReceiptResult`.

Limitación relevante para ViáticoCero: VisionPsy está **optimizado en inglés**. El dominio sigue en español; el adaptador deberá fijar el prompt y validar el JSON extraído. No se cambia de modelo en el scaffold.

Adjuntos: `history[].attachments: [{ path: "/abs/recibo.jpg" }]`. Por eso existe el puerto de filesystem y `resources/samples/receipts`.

## Bare en Electron

Del tutorial y de `QvacForgePlugin` (commit `6536b03` en `tetherto/qvac`):

1. `qvac bundle sdk` (o el plugin Forge) escribe `qvac/worker.bundle.js`.
2. **`asar: false` es forzado**: el worker Bare no carga addons nativos desde `app.asar`.
3. Builds **universal macOS bloqueados** (prebuilds `darwin-arm64.bare` vs `darwin-x64.bare`).
4. `electron.vite.config` debe emitir a `dist/main|preload|renderer`, no a `out/`.
5. Plugin de config: solo `llamacpp-completion` para no arrastrar TTS/diffusion/ASR.

Linux: `electron-vite dev -- --no-sandbox`. El e2e oficial (`packages/sdk/e2e/tests/electron/main.ts`) hace `app.commandLine.appendSwitch('no-sandbox')`.

## Dónde **no** va QVAC

- Renderer React.
- `src/core/**`.
- Tests unitarios de dominio (se mockea `IVisionInference`).

Los tests de verdad del SDK viven en `tests/integration/qvac` (máquina con addons nativos), no en el hexágono.
