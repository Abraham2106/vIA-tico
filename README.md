# ViáticoCero

**Tesis:** excepciones documentales financieras — interpretar documentos sensibles on-device, validar con reglas, y que el humano solo vea lo que no cuadra.

**Cuña (lo que hay en este repo):** liquidación de **viáticos**. Un viaje es el primer contexto contra el que se compara un comprobante (después: otros gastos, facturas, OC). El nombre ViáticoCero es esa cuña, no el techo.

> La IA interpreta; el sistema verifica; el humano decide cuando existe incertidumbre.

No es «una IA que lee facturas». No es «una IA que reemplaza al contador». Si el modelo se vuelve loco, como máximo abre una ⚠: **nunca autoriza un pago**.

Este repositorio ya tiene el **producto no-QVAC**: workspaces, contratos, motor de reglas, centro de excepciones, liquidación, export e inbox DTO. VisionPsy / Qwen / Hyperswarm quedan como **puertos** (`IVisionInference`, `ILanguageModel`, `IQvacProvider`) sin cablear el SDK. Justificación en [`Docs/`](./Docs/README.md).

## Instalar el escritorio

Sin clonar el repo ni correr Vite. El expediente queda en tu equipo (SQLite 3). No hay cuenta ni servidor.

**[Descargar instaladores (Releases)](https://github.com/Abraham2106/vIA-tico/releases)** — si esa lista está vacía, el primer empaquetado todavía corre en [Actions → Desktop installers](https://github.com/Abraham2106/vIA-tico/actions/workflows/desktop-installers.yml). Los enlaces `/download/…` dan 404 hasta que ese job termina.

| Sistema | Archivo en Releases |
| --- | --- |
| **Windows** (x64) | `ViaticoCero-win-x64-setup.exe` |
| **Linux** (x64) | `ViaticoCero-linux-x64.AppImage` |
| **macOS** (Apple Silicon) | `ViaticoCero-mac-arm64.dmg` |
| **macOS** (Intel) | `ViaticoCero-mac-x64.dmg` |

En Linux: `chmod +x ViaticoCero-linux-x64.AppImage && ./ViaticoCero-linux-x64.AppImage`.

En Mac el instalador no está firmado con Apple Developer: la primera vez, clic derecho → **Abrir**. No hay binario universal (QVAC es por arquitectura).

También se publica un `.deb` y un `.exe` portable. Qwen Instruct se carga después, desde Ajustes, si quieres postproceso en este equipo.

## Por qué QVAC tiene que estar

El documento financiero no puede salir a una API de visión. Las reglas no comprenden un ticket térmico ni un «almorcé con el cliente». Quitar VisionPsy rompe la captura on-device; quitar el validador convertiría una predicción en verdad financiera.

Test permanente (ADR 0010):

*Si reemplazo QVAC por reglas, ML clásico o una API cloud, ¿el producto vale casi lo mismo?*  
Si la respuesta es sí, QVAC está pegado encima.

## Demo (cuña, 10 segundos)

Viaje 10–14 sep. Foto de un almuerzo del 25 sep → **⚠ Fecha fuera del período → REVISIÓN**.  
Ocho comprobantes: seis ✓ PROCEDE, dos ⚠. Contabilidad no revisa los ocho.

Eso instancia la tesis (cola de excepciones). No es «el producto solo hace viajes».

Detalle: [`Docs/00-producto.md`](./Docs/00-producto.md) (tesis + cuña, 18 puntos) · [`Docs/08-demo-evals.md`](./Docs/08-demo-evals.md)

## Dos apps, un hexágono

| App | Dónde | Qué hace |
| --- | --- | --- |
| `apps/mobile` | Android (**Expo / React Native**, no Flutter) | Cámara + motivo libre + **VisionPsy Nano** + DTO |
| `apps/desktop` | Electron | **Centro de excepciones**, conciliación, auditoría, política, export, Qwen Instruct |

`packages/core` no conoce Expo, Electron ni `@qvac/sdk`. Ahí vive la autoridad (`PROCEDE | REVISIÓN | NO PROCEDE`). `packages/contracts` es el handshake teléfono ↔ escritorio. Desktop usa Carbon / IBM Products; `packages/ui-tokens` cubre fechas, categorías y color del móvil (no componentes React).

## Stack (fijo)

- TypeScript, `@qvac/sdk@0.18.2` — sin inferencia cloud
- Móvil: Expo ≥ 54 + VisionPsy Nano (local). **No Flutter** (ADR 0009)
- Escritorio: electron-vite + Qwen3-4B-Instruct (postproceso + clasificar motivo) + Bare
- Expediente: SQLite 3 en el equipo (Electron: archivo en userData; preview web: sql.js + IndexedDB). No hay backend HTTP.
- Autoridad: código (schema, dígitos, duplicados, contexto del documento, política, conciliación)

## Cómo correr (sin modelos)

```bash
npm install
npm test
npm run typecheck
npm run desktop:web         # centro de excepciones en Vite (localhost:5173)
npm run desktop:dev         # Electron en desarrollo
npm run desktop:dist:linux  # AppImage + .deb en apps/desktop/release/
npm run desktop:dist:win    # instalador NSIS (mejor en Windows)
npm run desktop:dist:mac    # .dmg arm64 + x64 (hace falta un Mac)
```

Móvil: `npm run mobile:start` (Expo). Cámara y DTO manual; VisionPsy no está cableado.

El escritorio siembra el viaje demo Liberia 10–14 sep (6 PROCEDE + 2 REVISIÓN) **solo si SQLite está vacío**. Recargar no borra viajes ni excepciones. Detalle: [`Docs/12-persistencia-sqlite.md`](./Docs/12-persistencia-sqlite.md).

## Cómo se trabaja

Un clone. Cambias el paquete que toca. Skills: `.cursor/skills/` y `apps/*/.cursor/skills/`. Guía: [`Docs/06-como-trabajar-monorepo.md`](./Docs/06-como-trabajar-monorepo.md).

```
packages/core         hexágono (excepciones, veredicto, auditoría; hoy: viaje)
packages/contracts    visión + motivo + veredicto + audit
packages/ui-tokens    fechas/categorías; color para móvil (ADR 0014)
apps/desktop          centro de excepciones + conciliación + auditoría
apps/mobile           captura + motivo + VisionPsy
Docs/                 tesis (00) y ADRs
```

## SDK

`@qvac/sdk@0.18.2`. Tutoriales oficiales de Tether para Electron y Expo.
