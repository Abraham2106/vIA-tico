# Arquitectura hexagonal

El dominio de viáticos no depende de Expo, Electron, Bare ni de las constantes de modelo.

## Regla de dependencia

```
móvil (cámara)  →  analyze-receipt (VisionPsy)  →  DTO (contracts)
                                                      ↓
desktop inbox  →  ingest-vision-result → analyze-with-llm → UI / exporters
                 ↑
              packages/core
```

- `packages/core` no importa `expo`, `react-native`, `electron`, `react`, `@qvac/sdk`, `@qvac/inference`, `fs` ni Vite.
- `packages/contracts` es el único paquete que ambas apps pueden importar además del core (DTOs, no I/O).
- Adaptadores driven viven **dentro de cada app** (toolchains distintos).
- Composition roots: `apps/mobile/src/composition/expo` y `apps/desktop/src/composition/electron`.

## Puertos outbound (previsto)

| Puerto | Quién lo implementa | Runtime |
| --- | --- | --- |
| `IVisionInference` | `apps/mobile/.../qvac-visionpsy` | Expo + `@qvac/sdk` + VisionPsy local |
| `ILanguageModel` | `apps/desktop/.../qvac-llm` | Electron main + LLM pesado local |
| `IJobTransport` | móvil envía / desktop recibe | DTO por canal propio; P2P QVAC no es el dueño del expediente |
| `IQvacProvider` | `apps/desktop/.../qvac-provider` | `startQVACProvider()` — opcional, si el celular pide tokens del LLM |
| `ICamera` | `apps/mobile/.../camera` | Expo |
| `IFileSystem` | cada app | Nano exige `attachments[].path` en disco |
| `IReceiptStore` | desktop (sistema de registro); móvil puede cachear | SQLite / JSON local |
| `IReportExporter` | `apps/desktop/.../exporters/{pdf,csv,xlsx,json}` | solo escritorio |
| `IClock` | ambas | reloj de sistema |

El dominio habla de *hechos de un recibo* y *liquidar un viaje*, no de `projectionModelSrc` ni de `delegate.providerPublicKey`.

## Flujo de un comprobante

1. El usuario dispara en Android. El adaptador de cámara deja un archivo en disco.
2. `analyze-receipt` llama `IVisionInference` (VisionPsy Flash, una imagen). Sale un DTO de `packages/contracts/vision-result`.
3. `pair-devices` ya emparejó (QR con la clave del desktop). `IJobTransport` entrega un `analysis-job`.
4. Electron **inbox** muestra el job. `ingest-vision-result` lo persiste. `analyze-with-llm` llama `ILanguageModel` en el PC.
5. El renderer (React) enseña el análisis: aceptar, editar, guardar, exportar.
6. `export-report` usa `IReportExporter` (PDF, CSV, XLSX, JSON).

Delegated inference (`loadModel({ delegate })`) es un **extra**: el teléfono puede pedir al LLM del PC sin pasar por la UI. El expediente que se guarda y se convierte vive en desktop.

## Electron es app, no worker

| Proceso en `apps/desktop` | Rol |
| --- | --- |
| `src/main` | Composition + QVAC LLM + persistencia + exporters + provider |
| `src/preload` | `contextBridge` estrecho |
| `src/renderer` | Producto: inbox, detalle, guardar, formatos |
| `src/adapters/driving/ipc` | `ipcMain` → casos de uso |

QVAC no entra al renderer (igual que el tutorial). La UI sí es de usuario final.

## Móvil es captura, no liquidación

Pantallas Expo Router (`apps/mobile/app/{capture,preview,pairing}`): foto, preview del DTO, estado de envío. Sin PDF ni políticas pesadas en el teléfono.

## Referencias de forma (no de feature)

- [JarvisQ](https://github.com/Helldez/JarvisQ): core platform-free, SDK directo, adaptadores por target. No copiamos voz ni SDK 0.9.
- [Beacon](https://github.com/edycutjong/beacon): pairing QR + provider en laptop + `loadModel({ delegate })`. Nosotros priorizamos el DTO hacia la **app** desktop.

## Límites

- Un bounded context: liquidación de viáticos.
- VisionPsy solo en móvil; LLM pesado solo en desktop.
- Un recibo = una imagen (límite de VisionPsy).
