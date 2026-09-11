# Persistencia local (SQLite 3)

Auditoría 2026-09-11 y el adaptador que la cierra. El expediente **no sale de la máquina**. No hay API cloud ni Postgres.

## Qué había (antes de este cambio)

No existía un backend HTTP de producto. Eso es correcto para la tesis local-first. El hueco era **dónde vive el expediente**.

| Pieza | Estado real | Efecto |
| --- | --- | --- |
| Puertos `ITripRepository`, `IReceiptRepository`, … | Sí, en `packages/core` | El dominio ya no habla de SQL ni de `localStorage` |
| Implementación de esos puertos | `Map` en memoria (`testing/memory-store.ts`) usada **en producción** del escritorio | Un F5 en Electron re-sembraba el demo |
| Persistencia desktop | Un JSON blob en `localStorage` (`viaticocero.desktop.v1`) | Solo el preview Vite (`desktop:web`) |
| Electron main | `typeof localStorage === 'undefined'` | **Nada se guardaba.** Cada arranque = demo fresco |
| `rotatePairing` | No estaba en el monkey-patch de persistencia | El código de emparejamiento se perdía incluso en web |
| `IAuditLog` (Docs/02) | Documentado, no implementado | La auditoría vive hoy en `receipt.audit` (JSON) |
| `IJobTransport` | `InMemoryJobTransport` | El inbox pega el DTO en el proceso; no hay cola en disco aparte de `jobs` |
| Móvil | Cache de foto, no expediente | Sigue siendo captura; el registro es el escritorio |

`Docs/02` ya nombraba `IReceiptStore` → «SQLite / JSON local». El JSON ganó por ser el atajo del scaffold.

## Decisión

SQLite 3, archivo local, mismo esquema en los dos runtimes del escritorio.

| Runtime | Motor | Dónde queda el `.sqlite` |
| --- | --- | --- |
| Electron (producto) | `node:sqlite` (`DatabaseSync`, Node ≥ 22.14) | `app.getPath('userData')/viaticocero.sqlite` (override `VIATICOCERO_SQLITE`) |
| Preview Vite | sql.js (SQLite 3 compilado a WASM) | IndexedDB `viaticocero` / store `sqlite` |
| Tests | `node:sqlite` `:memory:` o archivo temporal | CI sin GPU ni navegador |

`packages/core` no importa `fs` ni `sql.js`. El adaptador está en `apps/desktop/src/adapters/driven/persistence/`.

## Qué no es

- No hay servidor. No hay usuario/contraseña. No hay sync a la nube.
- El móvil no abre esta base. El DTO `analysis-job` entra por inbox y el escritorio lo inserta.
- Nested JSON (`vision-result`, reglas, auditoría del recibo) va en columnas TEXT. Las FKs y los filtros (viaje, excepción abierta) sí son columnas.

## Migración

Si el preview web aún tiene `viaticocero.desktop.v1` y SQLite está vacío, se importa una vez y se borra la clave. Electron nunca tuvo ese blob.

## Cómo comprobarlo

```bash
npm test                                    # incluye apps/desktop/tests/sqlite-persistence.test.ts
npm run desktop:web                         # Ajustes → Expediente; recarga y el viaje sigue
sqlite3 "$HOME/.config/ViáticoCero/viaticocero.sqlite" ".tables"   # ruta real = userData de Electron
```
