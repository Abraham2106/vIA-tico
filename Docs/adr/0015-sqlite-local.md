# ADR 0015 — Expediente en SQLite 3 local

## Estado

Aceptada.

## Contexto

El hexágono ya tenía repositorios. El escritorio los implementaba con `Map` + un JSON en `localStorage`. En Electron main no hay `localStorage`, así que el producto de registro **no persistía**. La arquitectura (Docs/02) ya apuntaba a SQLite local. Un backend HTTP contradice ADR 0008 / local-first: el recibo no viaja a un servidor propio «temporal».

## Decisión

1. El expediente del escritorio es **SQLite 3** en el equipo del usuario.
2. Electron usa `node:sqlite` sobre `userData/viaticocero.sqlite`. Electron 37 / Node ≥ 22.14.
3. El preview web usa **sql.js** (el mismo motor) y guarda el binario en IndexedDB.
4. Los puertos siguen en `packages/core`. El SQL vive solo en `apps/desktop/.../persistence`.
5. Nested DTOs (`vision-result`, reglas, audit del recibo) se serializan a JSON en columnas TEXT. Identificadores y FKs son columnas.

## Consecuencias

- Recargar Electron o el preview no re-siembra el demo si ya hay viajes.
- `rotatePairing` y `updatePolicy` persisten porque el `save` del repositorio escribe SQLite; no hay monkey-patch de `Workspace`.
- No se añade Postgres, SQLite en la nube, ni un `apps/api`.
- `IAuditLog` es tabla `audit_events` (ADR 0015 enmienda). `receipts.audit_json` sigue siendo el recorte por comprobante.
