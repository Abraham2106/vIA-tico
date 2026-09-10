# Arquitectura hexagonal

El dominio de viáticos no depende de Expo, Electron, Bare ni de las constantes de modelo. **El veredicto financiero tampoco**: vive en `packages/core`, no en el adaptador QVAC.

## Regla de dependencia

```
móvil: cámara + motivo libre
        → analyze-receipt (VisionPsy)     → vision-result
        → declare-motive                  → texto
                      ↓
desktop: ingest → postproceso lingüístico
       → classify-motive                  → motive-classification (sin veredicto)
       → validate-extraction / policy / duplicates
       → verdict en core: PROCEDE | REVISIÓN | NO PROCEDE
       → excepciones / conciliación / auditoría / export
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
| `IAuditLog` | desktop persistencia | eventos `audit-event` |
| `IClock` | ambas | reloj de sistema |

El dominio habla de *hechos de un recibo*, *motivo*, *excepciones* y *liquidar un viaje*, no de `projectionModelSrc` ni de «el modelo dijo que procede». `ILanguageModel` sirve al postproceso **y** a `classify-motive`; nunca escribe `contracts/verdict`.

## Flujo de un comprobante

1. El usuario dispara en Android. El adaptador de cámara deja un archivo en disco.
2. `analyze-receipt` llama `IVisionInference` (una imagen; Base si el ticket es denso). Sale un DTO de `packages/contracts/vision-result` (schema + confianza + RAW).
3. `pair-devices` ya emparejó. `IJobTransport` entrega un `analysis-job`.
4. Electron persiste con `ingest-vision-result`. El postproceso (`analyze-with-llm`) es lingüístico; el validador de dígitos puede descartarlo.
5. Si hay texto de motivo, `classify-motive` produce categoría + confianza (sin veredicto).
6. `validate-policy` + `detect-duplicates` + confianza emiten `verdict`. `record-audit` deja el rastro.
7. UI: **centro de excepciones**, conciliación, auditoría. `export-report` por `IReportExporter`.

Delegated inference (`loadModel({ delegate })`) es un **extra**. El expediente y el veredicto viven en desktop + core.

## Electron es app de registro, no chat

| Proceso en `apps/desktop` | Rol |
| --- | --- |
| `src/main` | Composition + Qwen + persistencia + exporters + provider |
| `src/preload` | `contextBridge` estrecho |
| `src/renderer` | Excepciones, viaje, liquidación, auditoría, export |
| `src/adapters/driving/ipc` | `ipcMain` → casos de uso |

QVAC no entra al renderer. La UI no es un log de tokens.

## Móvil es captura, no liquidación

Pantallas Expo Router (`apps/mobile/app/{capture,motive,preview,pairing}`): foto, motivo libre, preview del DTO, envío. Sin PDF ni política pesada en el teléfono.

## Referencias de forma (no de feature)

- [JarvisQ](https://github.com/Helldez/JarvisQ): core platform-free, SDK directo, adaptadores por target. No copiamos voz ni SDK 0.9.
- [Beacon](https://github.com/edycutjong/beacon): pairing QR + provider. Nosotros priorizamos el DTO hacia la **app** desktop.

## Límites

- Un bounded context **implementado**: liquidación de viáticos (cuña). La tesis (excepciones documentales financieras, etapas 2–3) no tiene paquetes.
- VisionPsy solo en móvil; Instruct (postproceso + `classify-motive`) solo en desktop; `verdict` solo en core.
- Un recibo = una imagen (límite de VisionPsy).
