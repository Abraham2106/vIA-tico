# ViáticoCero

**Tesis:** excepciones documentales financieras — interpretar documentos sensibles on-device, validar con reglas, y que el humano solo vea lo que no cuadra.

**Cuña (lo que hay en este repo):** liquidación de **viáticos**. Un viaje es el primer contexto contra el que se compara un comprobante (después: otros gastos, facturas, OC). El nombre ViáticoCero es esa cuña, no el techo.

> La IA interpreta; el sistema verifica; el humano decide cuando existe incertidumbre.

No es «una IA que lee facturas». No es «una IA que reemplaza al contador». Si el modelo se vuelve loco, como máximo abre una ⚠: **nunca autoriza un pago**.

Este repositorio, ahora mismo, es **scaffold**: carpetas hexagonales (`.gitkeep`) y la justificación en [`Docs/`](./Docs/README.md). No hay `package.json` todavía.

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

`packages/core` no conoce Expo, Electron ni `@qvac/sdk`. Ahí vive la autoridad (`PROCEDE | REVISIÓN | NO PROCEDE`). `packages/contracts` es el handshake teléfono ↔ escritorio.

## Stack (fijo)

- TypeScript, `@qvac/sdk@0.18.2` — sin inferencia cloud
- Móvil: Expo ≥ 54 + VisionPsy Nano (local). **No Flutter** (ADR 0009)
- Escritorio: electron-vite + Qwen3-4B-Instruct (postproceso + clasificar motivo) + Bare
- Autoridad: código (schema, dígitos, duplicados, contexto del documento, política, conciliación)

## Cómo se trabaja

Un clone. Cambias el paquete que toca. Skills: `.cursor/skills/` y `apps/*/.cursor/skills/`. Guía: [`Docs/06-como-trabajar-monorepo.md`](./Docs/06-como-trabajar-monorepo.md).

```
packages/core         hexágono (excepciones, veredicto, auditoría; hoy: viaje)
packages/contracts    visión + motivo + veredicto + audit
apps/desktop          centro de excepciones + conciliación + auditoría
apps/mobile           captura + motivo + VisionPsy
Docs/                 tesis (00) y ADRs
```

## Base preexistente

Repo original de este hackathon. No hay producto previo ni fork. El scaffold (hexágono, monorepo, skills) es trabajo de este equipo sobre `@qvac/sdk@0.18.2` y los tutoriales oficiales de Tether. JarvisQ / Beacon se citan solo como **forma** (puertos, pairing), no como código copiado.
