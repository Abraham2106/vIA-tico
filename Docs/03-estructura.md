# Estructura de carpetas

Solo `.gitkeep`. Manifiestos (`package.json`, workspaces, `app.json`, `qvac.config.json`) van en un PR de implementación.

El árbol **es la cuña** (viáticos, ADR 0013), no toda la tesis. La tesis es excepciones documentales financieras; etapas 2–3 (gastos genéricos, matching OC, ERP) **no** tienen paquetes.

```
vIA-tico/
├── Docs/                                  # 00 = tesis 18 puntos
├── packages/
│   ├── core/                              # HEXÁGONO — prohibido Expo/Electron/QVAC
│   │   ├── domain/
│   │   │   ├── traveler/
│   │   │   ├── trip/                      # §3 contexto + adelanto
│   │   │   ├── receipt/
│   │   │   ├── category/                  # §7 categorías de gasto
│   │   │   ├── policy/
│   │   │   ├── exception/                 # §2
│   │   │   ├── settlement/                # §6 liquidación
│   │   │   ├── audit/                     # §10
│   │   │   └── shared/
│   │   └── application/
│   │       ├── ports/{inbound,outbound}/
│   │       └── use-cases/
│   │           ├── register-trip/
│   │           ├── attach-receipt/
│   │           ├── declare-motive/        # §7 texto libre (móvil)
│   │           ├── analyze-receipt/       # §4 VisionPsy (móvil)
│   │           ├── ingest-vision-result/
│   │           ├── analyze-with-llm/      # postproceso lingüístico (desktop)
│   │           ├── classify-motive/       # §7 Instruct; SIN veredicto
│   │           ├── validate-extraction/   # schema / dígitos
│   │           ├── validate-policy/       # §3 viaje, topes, confianza
│   │           ├── detect-duplicates/     # §5
│   │           ├── open-exception/        # §2
│   │           ├── resolve-exception/
│   │           ├── reconcile-advance/     # §6
│   │           ├── settle-trip/
│   │           ├── record-audit/          # §10
│   │           ├── export-report/         # §12
│   │           └── pair-devices/
│   └── contracts/
│       ├── vision-result/                 # §4 JSON + confianza + RAW
│       ├── motive-classification/         # §7 categoría + confianza; no veredicto
│       ├── verdict/                       # §8 solo lo emite core
│       ├── audit-event/                   # §10
│       ├── analysis-job/
│       ├── pairing/
│       └── export-formats/
│   └── ui-tokens/                         # fechas/categorías; color para móvil (desktop = Carbon)
├── apps/
│   ├── desktop/
│   │   ├── src/
│   │   │   ├── main/ | preload/
│   │   │   ├── renderer/src/
│   │   │   │   ├── features/{inbox,exceptions,audit,receipts,trips,settlements,export}/
│   │   │   │   └── {assets,components,hooks,pages,styles}/
│   │   │   ├── adapters/driven/{qvac-llm,qvac-provider,exporters/{pdf,csv,xlsx,json},filesystem,persistence,clock}/
│   │   │   ├── adapters/driving/{ipc,renderer-bridge}/
│   │   │   └── composition/{electron,bare}/
│   │   ├── config/qvac/ | qvac/
│   │   ├── resources/{icons,models}/
│   │   └── tests/{e2e,integration/qvac}/
│   └── mobile/
│       ├── app/{capture,motive,preview,pairing}/
│       ├── src/adapters/driven/{qvac-visionpsy,camera,filesystem}/
│       ├── src/adapters/driving/screens/
│       ├── src/composition/expo/
│       ├── config/qvac/ | qvac/
│       ├── resources/samples/receipts/
│       └── tests/{e2e,integration/qvac}/
└── tests/unit/{domain,application}/
```

La raíz **`src/`** del scaffold de una sola app (PR #1) no se revive.

## Tesis → carpeta

| § | Capacidad | Scaffold |
| --- | --- | --- |
| 2 | Centro de excepciones | `exception`, `open-exception`, `resolve-exception`, `features/exceptions` |
| 3 | Viaje como contexto | `trip`, `validate-policy` |
| 4 | Documento → JSON | `analyze-receipt`, `vision-result` |
| 5 | Duplicados | `detect-duplicates` |
| 6 | Conciliación | `reconcile-advance`, `settle-trip`, `features/settlements` |
| 7 | Motivo libre | `declare-motive`, `classify-motive`, `category`, `motive-classification`, `app/motive` |
| 8 | PROCEDE / REVISIÓN / NO PROCEDE | `verdict` (solo core) |
| 9 | Confianza | campos en `vision-result` y `motive-classification` |
| 10 | Auditoría | `audit`, `record-audit`, `audit-event`, `features/audit` |
| 12 | CSV / Excel / JSON | `export-report`, `export-formats` |
| 14–18 | Etapas 2–3 | ninguna carpeta |

## Por qué monorepo

Expo y electron-vite pelean. Workspaces cuando existan manifiestos.

## Por qué `apps/desktop/src/main|preload|renderer`

Tutorial QVAC + `QvacForgePlugin` dentro del paquete Electron.

## Por qué `app/` en móvil

Expo Router. `motive` es la pantalla del texto libre (§7), no liquidación.

## Bundles QVAC

Cada app: `qvac/` + `config/qvac/`. El teléfono no arrastra Qwen.
