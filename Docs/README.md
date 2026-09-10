# ViáticoCero — documentación de arquitectura

Este directorio justifica el scaffold. **No hay código de aplicación todavía**: solo la estructura hexagonal (carpetas + `.gitkeep`) y estas decisiones.

| Documento | Qué responde |
| --- | --- |
| [01-stack.md](./01-stack.md) | QVAC **0.18.2**, VisionPsy en el celular, LLM pesado en desktop, Expo + Electron |
| [02-arquitectura-hexagonal.md](./02-arquitectura-hexagonal.md) | Puertos, dos compositions, flujo recibo → DTO → análisis → export |
| [03-estructura.md](./03-estructura.md) | Monorepo `apps/` + `packages/` |
| [04-qvac-visionpsy-bare.md](./04-qvac-visionpsy-bare.md) | Modelos, Bare, P2P, configs por app |
| [05-referencias.md](./05-referencias.md) | Tutorial Electron, Expo, delegated inference, JarvisQ/Beacon |
| [06-como-trabajar-monorepo.md](./06-como-trabajar-monorepo.md) | Día a día + skills de Cursor en el repo |
| [adr/](./adr/) | Decisiones numeradas (0001–0009) |

## Producto

**ViáticoCero** es un sistema de dos dispositivos, sin API cloud:

1. El **teléfono** fotografía el comprobante y lo entiende on-device con VisionPsy Nano.
2. El **escritorio** es una app de verdad: recibe el DTO, corre un LLM pesado, enseña el resultado y deja guardar / convertir a formatos.
