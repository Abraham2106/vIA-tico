# Arquitectura hexagonal

El dominio de viáticos no depende de Expo, Electron, Bare ni de las constantes de modelo. **El veredicto financiero tampoco**: vive en `packages/core`, no en el adaptador QVAC.

## Regla de dependencia

```
móvil (cámara)  →  analyze-receipt (VisionPsy)  →  DTO schema (contracts)
                                                      ↓
desktop  →  ingest-vision-result → postproceso LLM (opcional)
         →  validate-extraction / validate-policy / duplicates
         →  PROCEDE | REVISIÓN | NO PROCEDE
         →  centro de excepciones / liquidación / export
                 ↑
              packages/core
```

- `packages/core` no importa `expo`, `react-native`, `electron`, `react`, `@qvac/sdk`, `@qvac/inference`, `fs` ni Vite.
- `packages/contracts` es el único paquete que ambas apps pueden importar además del core (DTOs, no I/O).
- Adaptadores driven viven **dentro de cada app**.
- Composition roots: `apps/mobile/src/composition/expo` y `apps/desktop/src/composition/electron`.

## Puertos outbound (previsto)

| Puerto | Quién lo implementa | Runtime |
| --- | --- | --- |
| `IVisionInference` | `apps/mobile/.../qvac-visionpsy` | Expo + `@qvac/sdk` + VisionPsy local |
| `ILanguageModel` | `apps/desktop/.../qvac-llm` | Electron main + Qwen Instruct local |
| `IJobTransport` | móvil envía / desktop recibe | DTO; P2P QVAC no es dueño del expediente |
| `IQvacProvider` | `apps/desktop/.../qvac-provider` | `startQVACProvider()` — **opcional** |
| `ICamera` | `apps/mobile/.../camera` | Expo |
| `IFileSystem` | cada app | Nano exige `attachments[].path` en disco |
| `IReceiptStore` | desktop (registro); móvil puede cachear | SQLite / JSON local |
| `IReportExporter` | `apps/desktop/.../exporters/{pdf,csv,xlsx,json}` | solo escritorio |
| `IClock` | ambas | reloj de sistema |

El dominio habla de *hechos de un recibo*, *excepciones* y *liquidar un viaje*, no de `projectionModelSrc` ni de «el modelo dijo que procede».

## Flujo de un comprobante

1. El usuario dispara en Android. El adaptador de cámara deja un archivo en disco.
2. `analyze-receipt` llama `IVisionInference` (una imagen; Base si el ticket es denso). Sale un DTO de `packages/contracts/vision-result` (schema + confianza + RAW).
3. `pair-devices` ya emparejó. `IJobTransport` entrega un `analysis-job`.
4. Electron **inbox** persiste con `ingest-vision-result`. El postproceso (`analyze-with-llm`) es lingüístico; el validador de dígitos puede descartarlo.
5. `validate-policy` (viaje, duplicados, topes, confianza) emite el veredicto.
6. El renderer muestra el **centro de excepciones** y la liquidación. `export-report` sale por `IReportExporter`.

Delegated inference (`loadModel({ delegate })`) es un **extra**. El expediente y el veredicto viven en desktop + core.

## Electron es app de registro, no chat

| Proceso en `apps/desktop` | Rol |
| --- | --- |
| `src/main` | Composition + Qwen + persistencia + exporters + provider |
| `src/preload` | `contextBridge` estrecho |
| `src/renderer` | Excepciones, viaje, liquidación, export |
| `src/adapters/driving/ipc` | `ipcMain` → casos de uso |

QVAC no entra al renderer. La UI no es un log de tokens.

## Móvil es captura, no liquidación

Pantallas Expo Router (`apps/mobile/app/{capture,preview,pairing}`): foto, preview del DTO, envío. Sin PDF ni política pesada en el teléfono.

## Arquitectura de referencia

- [JarvisQ](https://github.com/Helldez/JarvisQ): core platform-free, SDK directo, adaptadores por target. Pin `@qvac/sdk@0.18.2`.
- [Beacon](https://github.com/edycutjong/beacon): pairing QR + provider. Nosotros priorizamos el DTO hacia la **app** desktop.

## Límites

- Un bounded context de hackathon: **liquidación de viáticos** (etapa 1).
- VisionPsy solo en móvil; Instruct solo en desktop; autoridad solo en core.
- Un recibo = una imagen (límite de VisionPsy).
