# ViáticoCero

Sistema *local-first* de liquidación de viáticos. VisionPsy Nano comprende el comprobante **en el dispositivo**; reglas deterministas deciden; el humano solo ve excepciones.

> La IA interpreta; el sistema verifica; el humano decide cuando existe incertidumbre.

No es «una IA que lee facturas». No es «una IA que reemplaza al contador». Si el modelo se vuelve loco, la arquitectura limita el daño: **nunca autoriza un pago**.

Este repositorio, ahora mismo, es **scaffold**: carpetas hexagonales (`.gitkeep`) y la justificación en [`Docs/`](./Docs/README.md). No hay `package.json` todavía.

## Por qué QVAC tiene que estar

El comprobante no puede salir a una API de visión. Las reglas no leen un ticket térmico borroso ni un «almorcé con el cliente». Quitar VisionPsy rompe la captura on-device; quitar el validador convertiría una predicción en verdad financiera.

Test permanente (ADR 0010):

*Si reemplazo QVAC por reglas, ML clásico o una API cloud, ¿el producto vale casi lo mismo?*  
Si la respuesta es sí, QVAC está pegado encima.

## Demo que debe entenderse en segundos

Viaje 10–14 sep. Foto de un almuerzo del 25 sep → **⚠ Fecha fuera del período → REVISIÓN**.  
Ocho comprobantes: seis ✓ PROCEDE, dos ⚠. Contabilidad no revisa los ocho.

Detalle: [`Docs/00-producto.md`](./Docs/00-producto.md) · [`Docs/08-demo-evals.md`](./Docs/08-demo-evals.md)

## Dos apps, un hexágono

| App | Dónde | Qué hace |
| --- | --- | --- |
| `apps/mobile` | Android (**Expo / React Native**, no Flutter) | Cámara + **VisionPsy Nano** (document understanding / OCR on-device) + DTO |
| `apps/desktop` | Electron | Inbox, **centro de excepciones**, política, conciliación, export, LLM local opcional |

`packages/core` no conoce Expo, Electron ni `@qvac/sdk`. Ahí vive la autoridad (`PROCEDE | REVISIÓN | NO PROCEDE`). `packages/contracts` es el handshake teléfono ↔ escritorio.

## Stack (fijo)

- TypeScript, `@qvac/sdk@0.18.2` — sin inferencia cloud
- Móvil: Expo ≥ 54 + VisionPsy Nano (local). **No Flutter** (ADR 0009)
- Escritorio: electron-vite + Qwen3-4B-Instruct (local, postproceso lingüístico) + Bare
- Autoridad: código (schema, dígitos, duplicados, fechas del viaje, política)

## Cómo se trabaja

Un clone. Cambias el paquete que toca. Skills de Cursor: `.cursor/skills/` y `apps/*/.cursor/skills/`. Guía: [`Docs/06-como-trabajar-monorepo.md`](./Docs/06-como-trabajar-monorepo.md).

```
packages/core         hexágono (política, excepciones, liquidación)
packages/contracts    DTO visión → job → export
apps/desktop          excepciones + registro + export
apps/mobile           captura + VisionPsy
Docs/                 producto y ADRs
```

## SDK

Repo original de este hackathon. No hay producto previo ni fork de otra app de viáticos. El scaffold (hexágono, monorepo, skills) es trabajo de este equipo sobre `@qvac/sdk@0.18.2` y los tutoriales oficiales de Tether. JarvisQ / Beacon se citan solo como **forma** (puertos, pairing), no como código copiado.
