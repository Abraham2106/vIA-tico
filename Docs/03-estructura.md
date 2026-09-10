# Estructura de carpetas

Solo carpetas con `.gitkeep`. `package.json`, workspaces npm/pnpm, `app.json` y `qvac.config.json` van en un PR de implementación.

```
vIA-tico/
├── Docs/
├── packages/
│   ├── core/                              # HEXÁGONO — prohibido Expo/Electron/QVAC
│   │   ├── domain/{traveler,trip,receipt,policy,settlement,shared}/
│   │   └── application/
│   │       ├── ports/{inbound,outbound}/
│   │       └── use-cases/
│   │           ├── register-trip/
│   │           ├── attach-receipt/
│   │           ├── analyze-receipt/       # visión (se ejecuta en móvil)
│   │           ├── ingest-vision-result/  # desktop recibe el DTO
│   │           ├── analyze-with-llm/      # LLM pesado (desktop)
│   │           ├── validate-policy/
│   │           ├── settle-trip/
│   │           ├── export-report/
│   │           └── pair-devices/
│   └── contracts/                         # handshake; ambas apps pueden importar
│       ├── vision-result/
│       ├── analysis-job/
│       ├── pairing/
│       └── export-formats/
├── apps/
│   ├── desktop/                           # APP Electron (UI + LLM + export)
│   │   ├── src/
│   │   │   ├── main/                      # electron-vite (relativo a esta app)
│   │   │   ├── preload/
│   │   │   ├── renderer/src/
│   │   │   │   ├── features/{inbox,receipts,trips,settlements,export}/
│   │   │   │   └── {assets,components,hooks,pages,styles}/
│   │   │   ├── adapters/
│   │   │   │   ├── driven/
│   │   │   │   │   ├── qvac-llm/
│   │   │   │   │   ├── qvac-provider/
│   │   │   │   │   ├── exporters/{pdf,csv,xlsx,json}/
│   │   │   │   │   └── {filesystem,persistence,clock}/
│   │   │   │   └── driving/{ipc,renderer-bridge}/
│   │   │   └── composition/{electron,bare}/
│   │   ├── config/qvac/
│   │   ├── qvac/                          # worker.bundle.js de ESTA app
│   │   ├── resources/{icons,models}/
│   │   └── tests/{e2e,integration/qvac}/
│   └── mobile/                            # APP Expo Android
│       ├── app/{capture,preview,pairing}/ # Expo Router
│       ├── src/
│       │   ├── adapters/
│       │   │   ├── driven/{qvac-visionpsy,camera,filesystem}/
│       │   │   └── driving/screens/
│       │   └── composition/expo/
│       ├── config/qvac/
│       ├── qvac/
│       ├── resources/samples/receipts/
│       └── tests/{e2e,integration/qvac}/
└── tests/unit/{domain,application}/       # hexágono, sin GPU
```

## Por qué monorepo (y no un solo paquete)

Expo y electron-vite pelean: Metro vs Vite, React Native vs `react-dom`, `expo-plugin` vs `QvacForgePlugin`, `minSdk` vs `asar: false`. Un `package.json` único obliga a esa pelea. Dos repos romperían el pin 0.18.2 y los DTOs.

Workspaces (npm o pnpm) se declaran cuando existan los manifiestos. Este scaffold solo reserva las carpetas.

## Por qué `apps/desktop/src/main|preload|renderer`

El tutorial QVAC y `QvacForgePlugin` asumen esa forma **dentro del paquete Electron**. Mover el shell a `apps/desktop` no rompe el tutorial: el `cwd` de Forge/Vite es esa app. `dist/main|preload|renderer` sigue evitando el choque con `out/` de Forge.

## Por qué `app/` en móvil

Expo Router monta rutas desde `app/` en la raíz del paquete. `src/adapters` queda al lado, no dentro del router.

## Bundles QVAC separados

Cada app tiene `qvac/` y `config/qvac/`. El worker del teléfono no debe arrastrar el GGUF del LLM de escritorio, ni al revés.

## Compositions

**Desktop `composition/electron`:** LLM pesado, persistencia, exporters, `startQVACProvider`, `--no-sandbox` en Linux.

**Desktop `composition/bare`:** `bare-process` + `plugins([llmPlugin])` si el proceso *es* Bare.

**Mobile `composition/expo`:** `expo-plugin`, VisionPsy, cámara, transporte del DTO. Device físico; Expo Go no carga los addons C++.
