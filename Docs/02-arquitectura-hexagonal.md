# Arquitectura hexagonal

ViáticoCero usa **puertos y adaptadores** para que el dominio de viáticos no dependa de Electron, del worker Bare ni de las constantes de VisionPsy.

## Regla de dependencia

```
UI React  →  IPC (puerto driving)  →  casos de uso  →  puertos driven  →  adaptadores
                                      ↑
                                   dominio
```

- El **núcleo** (`src/core`) no importa `electron`, `react`, `@qvac/sdk`, `@qvac/inference`, `fs` ni Vite.
- Los **adaptadores driven** implementan puertos outbound (`IVisionInference`, `IReceiptStore`, `IFileSystem`, …).
- Los **adaptadores driving** (IPC + renderer) invocan puertos inbound (casos de uso).
- Las **raíces de composición** (`src/composition/*` + `src/main`) cablean implementaciones concretas.

## Por qué hexagonal aquí

QVAC **no puede vivir en el renderer**. Native addons y el worker Bare corren en el proceso main (o in-process Bare). Si el UI importara `@qvac/sdk`, el hexágono quedaría roto y el empaquetado (`asar`, prebuilds `.bare`) se filtraría a React.

Hexagonal convierte esa restricción de runtime en un puerto:

| Puerto (outbound) | Implementación prevista | Runtime |
| --- | --- | --- |
| `IVisionInference` | `adapters/driven/qvac-visionpsy` | Electron main → `@qvac/sdk` → worker Bare |
| `IVisionInference` (alt.) | `adapters/driven/qvac-bare` | `@qvac/inference` + `bare-process` |
| `IFileSystem` | `adapters/driven/filesystem` | `node:fs` — VisionPsy exige `attachments[].path` en disco |
| `IReceiptStore` / persistencia | `adapters/driven/persistence` | SQLite o JSON local |
| `IClock` | `adapters/driven/clock` | reloj de sistema |

El dominio habla de *analizar un recibo*, no de `loadModel({ projectionModelSrc })`.

## Mapa al proceso Electron

El tutorial oficial de QVAC separa tres procesos. En hexagonal:

| Proceso electron-vite | Rol hexagonal |
| --- | --- |
| `src/main` | Composition root + host del adaptador QVAC |
| `src/preload` | Driving adapter: `contextBridge` (superficie estrecha) |
| `src/renderer` | Driving adapter UI: React no conoce QVAC |
| `src/adapters/driving/ipc` | Handlers `ipcMain` que delegan a casos de uso |
| `src/core` | Independiente del proceso |

Flujo de un recibo:

1. El renderer elige un archivo y pide “analizar”.
2. Preload reenvía por IPC (sin Node integration en el renderer).
3. Main persiste una copia en disco (QVAC multimodal lee **paths**, no blobs del DOM).
4. El caso de uso `analyze-receipt` llama `IVisionInference`.
5. El adaptador VisionPsy hace `loadModel` + `completion` con el par weights + `mmproj`.
6. El dominio recibe un DTO (merchant, fecha, total, moneda), no tokens del modelo.

## Referencia de producto QVAC + hexagonal

[JarvisQ](https://github.com/Helldez/JarvisQ) es el proyecto público más cercano: núcleo hexagonal + `@qvac/sdk` directo + Electron en main + UI desacoplada. ViáticoCero copia **esas reglas**, no su pipeline de voz:

1. `src/core` libre de plataforma.
2. SDK sin wrapper.
3. Adaptadores por target (`electron` / `bare`).
4. Paths de modelos derivados de un puerto de filesystem, nunca hardcodeados.

## Límites del hexágono en este scaffold

- Un solo bounded context inicial: **liquidación de viáticos**.
- Un solo modelo de visión: VisionPsy Nano (Flash por defecto; Base como perfil).
- Un solo delivery: escritorio. Un futuro Expo reimplementaría puertos en `src/adapters` y una composición nueva; el dominio no se mueve.
