# ViáticoCero — documentación de arquitectura

Este directorio justifica el scaffold. **No hay código de aplicación todavía**: solo la estructura hexagonal (carpetas + `.gitkeep`) y estas decisiones.

| Documento | Qué responde |
| --- | --- |
| [01-stack.md](./01-stack.md) | Stack fijado: Tether QVAC **0.18.2**, VisionPsy, TypeScript, Bare, React + Vite, Electron |
| [02-arquitectura-hexagonal.md](./02-arquitectura-hexagonal.md) | Por qué hexagonal y cómo se mapea al runtime Electron/Bare |
| [03-estructura.md](./03-estructura.md) | Árbol de carpetas y responsabilidad de cada una |
| [04-qvac-visionpsy-bare.md](./04-qvac-visionpsy-bare.md) | Cómo entra QVAC, VisionPsy Nano y el worker Bare |
| [05-referencias.md](./05-referencias.md) | Código y docs oficiales consultados |
| [adr/](./adr/) | Decisiones arquitectónicas numeradas |

## Producto

**ViáticoCero** es una app de escritorio *local-first* para viáticos: el recibo se entiende en el dispositivo (visión + lenguaje), no en un API cloud. El núcleo de negocio (viaje, recibo, política, liquidación) no debe conocer Electron, Vite ni `@qvac/sdk`.
