# Estructura de carpetas

Solo carpetas con `.gitkeep`. `package.json`, workspaces npm/pnpm, `app.json` y `qvac.config.json` van en un PR de implementación.

```
vIA-tico/
├── Docs/
├── packages/
│   ├── core/                              # HEXÁGONO — prohibido Expo/Electron/QVAC
│   │   ├── domain/{traveler,trip,receipt,policy,exception,settlement,shared}/
│   │   └── application/
│   │       ├── ports/{inbound,outbound}/
│   │       └── use-cases/
│   │           ├── register-trip/
│   │           ├── attach-receipt/
│   │           ├── analyze-receipt/       # visión (móvil)
│   │           ├── ingest-vision-result/  # desktop recibe el DTO
│   │           ├── analyze-with-llm/      # postproceso lingüístico (desktop)
│   │           ├── validate-extraction/   # dígitos / schema — código
│   │           ├── validate-policy/       # viaje, topes — código
│   │           ├── detect-duplicates/
│   │           ├── open-exception/
│   │           ├── settle-trip/
│   │           ├── export-report/
│   │           └── pair-devices/
│   └── contracts/                         # handshake; ambas apps pueden importar
│       ├── vision-result/                 # schema + confianza + RAW
│       ├── analysis-job/
│       ├── pairing/
│       └── export-formats/
├── apps/
│   ├── desktop/                           # registro + excepciones
│   │   ├── src/
│   │   │   ├── main/
│   │   │   ├── preload/
│   │   │   ├── renderer/src/
│   │   │   │   ├── features/{inbox,exceptions,receipts,trips,settlements,export}/
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
│   │   ├── qvac/
│   │   ├── resources/{icons,models}/
│   │   └── tests/{e2e,integration/qvac}/
│   └── mobile/                            # captura + VisionPsy
│       ├── app/{capture,preview,pairing}/
│       ├── src/
│       │   ├── adapters/
│       │   │   ├── driven/{qvac-visionpsy,camera,filesystem}/
│       │   │   └── driving/screens/
│       │   └── composition/expo/
│       ├── config/qvac/
│       ├── qvac/
│       ├── resources/samples/receipts/    # golden set (ADR 0012)
│       └── tests/{e2e,integration/qvac}/
└── tests/unit/{domain,application}/       # veredictos, sin GPU
```

La raíz **`src/`** del scaffold de una sola app (PR #1) no se revive.

## Por qué monorepo (y no un solo paquete)

Expo y electron-vite pelean: Metro vs Vite, React Native vs `react-dom`, `expo-plugin` vs `QvacForgePlugin`. Dos repos romperían el pin 0.18.2 y los DTOs.

Workspaces se declaran cuando existan los manifiestos.

## Por qué `apps/desktop/src/main|preload|renderer`

El tutorial QVAC y `QvacForgePlugin` asumen esa forma **dentro del paquete Electron**. `cwd` de Forge/Vite = esa app. `dist/main|preload|renderer` evita el choque con `out/` de Forge.

## Por qué `app/` en móvil

Expo Router monta rutas desde `app/` en la raíz del paquete.

## Bundles QVAC separados

Cada app tiene `qvac/` y `config/qvac/`. El worker del teléfono no arrastra el GGUF de Qwen.

## Compositions

**Desktop `composition/electron`:** Qwen Instruct, persistencia, exporters, provider opcional, `--no-sandbox` en Linux.

**Desktop `composition/bare`:** `bare-process` + `plugins([llmPlugin])` si el proceso *es* Bare.

**Mobile `composition/expo`:** `expo-plugin`, VisionPsy, cámara, transporte del DTO. Device físico; Expo Go no carga los addons C++.
