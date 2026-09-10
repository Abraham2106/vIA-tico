# Estructura de carpetas

Solo carpetas versionadas con `.gitkeep`. Los archivos de implementación (`package.json`, `*.ts`, `qvac.config.json`) se añaden en un PR posterior.

```
vIA-tico/
├── Docs/                          # Este justificante (sí hay Markdown)
├── config/qvac/                   # Futuro qvac.config.json (JSON: Node + Bare + Expo)
├── qvac/                          # Salida de bundle: worker.bundle.js (Bare, asar:false)
├── resources/
│   ├── icons/
│   ├── models/                    # Caché local de GGUF (no commitear pesos)
│   └── samples/receipts/          # Fixtures de imagen para tests
├── src/
│   ├── core/                      # HEXÁGONO — prohibido importar Electron/QVAC/React
│   │   ├── domain/
│   │   │   ├── traveler/
│   │   │   ├── trip/
│   │   │   ├── receipt/
│   │   │   ├── policy/
│   │   │   ├── settlement/
│   │   │   └── shared/
│   │   └── application/
│   │       ├── ports/
│   │       │   ├── inbound/       # Casos de uso como interfaz (driving)
│   │       │   └── outbound/      # IVisionInference, IFileSystem, IReceiptStore…
│   │       └── use-cases/
│   │           ├── register-trip/
│   │           ├── attach-receipt/
│   │           ├── analyze-receipt/
│   │           ├── validate-policy/
│   │           ├── settle-trip/
│   │           └── export-report/
│   ├── adapters/
│   │   ├── driven/                # Infraestructura
│   │   │   ├── qvac-visionpsy/    # @qvac/sdk 0.18.2 + constantes VisionPsy
│   │   │   ├── qvac-bare/         # @qvac/inference + plugins([...])
│   │   │   ├── filesystem/
│   │   │   ├── persistence/
│   │   │   └── clock/
│   │   └── driving/
│   │       ├── ipc/               # ipcMain.handle → casos de uso
│   │       └── renderer-bridge/   # tipos del API expuesto al renderer
│   ├── composition/
│   │   ├── electron/              # registerPlatform() para escritorio
│   │   └── bare/                  # process global + registro de llmPlugin
│   ├── main/                      # electron-vite — composition root
│   ├── preload/                   # contextBridge
│   └── renderer/src/              # React + Vite (solo UI)
│       ├── assets/
│       ├── components/
│       ├── features/{receipts,trips,settlements}/
│       ├── hooks/
│       ├── pages/
│       └── styles/
└── tests/
    ├── unit/{domain,application}/
    ├── integration/qvac/
    └── e2e/
```

## Convenciones de nombre

- Carpetas de código en **inglés** (alineado a QVAC, electron-vite y JarvisQ).
- Dominio en el lenguaje del producto: *trip* = comisión / viático; *receipt* = comprobante; *settlement* = liquidación; *policy* = tope y reglas.

## Por qué `src/main|preload|renderer` y no `apps/desktop`

El tutorial QVAC y el e2e `packages/sdk/e2e/tests/electron` asumen esa forma. `QvacForgePlugin` espera `dist/main`, `dist/preload`, `dist/renderer` (para no chocar con `out/` de Forge). Mover el shell a `apps/` obligaría a pelear con el toolchains desde el día uno.

El hexágono vive **al lado**, no dentro del renderer.

## Qué irá en cada composición

**`src/composition/electron`**

- Instancia adaptadores Node (`filesystem`, `persistence`, `qvac-visionpsy`).
- `loadModel` / `completion` / `unloadModel` desde `@qvac/sdk`.
- Flag Linux: `--no-sandbox` (requisito QVAC en el tutorial Electron).

**`src/composition/bare`**

```ts
// Intención (aún no hay archivos de código):
import process from 'bare-process'
import { plugins } from '@qvac/inference'
import { llmPlugin } from '@qvac/inference/llamacpp-completion/plugin'
globalThis.process = process
const sdk = plugins([llmPlugin])
```

Bare no spawnea worker y **no auto-registra** plugins. Esa es la única razón de `adapters/driven/qvac-bare` como carpeta distinta de `qvac-visionpsy`.
