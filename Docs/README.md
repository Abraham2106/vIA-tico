# ViáticoCero — documentación

Índice del approach actual. El texto que describía «app de escritorio que lee un recibo y exporta» quedó sustituido por producto + autoridad + demo (00, 07, 08, ADRs 0010–0012). El hexágono, el monorepo y el pin QVAC 0.18.2 **se mantienen**.

**No hay código de aplicación todavía**: carpetas + `.gitkeep` y estas decisiones.

| Documento | Qué responde |
| --- | --- |
| [00-producto.md](./00-producto.md) | Problema, filosofía, etapa 1, por qué QVAC |
| [01-stack.md](./01-stack.md) | QVAC **0.18.2**, VisionPsy en el celular, Qwen Instruct en desktop, Expo + Electron |
| [02-arquitectura-hexagonal.md](./02-arquitectura-hexagonal.md) | Puertos; el veredicto vive en `packages/core` |
| [03-estructura.md](./03-estructura.md) | Monorepo `apps/` + `packages/` |
| [04-qvac-visionpsy-bare.md](./04-qvac-visionpsy-bare.md) | Modelos, Flash/Base, Bare, P2P opcional |
| [05-referencias.md](./05-referencias.md) | Tutoriales Tether; JarvisQ/Beacon solo como forma |
| [06-como-trabajar-monorepo.md](./06-como-trabajar-monorepo.md) | Día a día + skills |
| [07-autoridad-pipeline.md](./07-autoridad-pipeline.md) | Schema, dígitos, política, daño acotado |
| [08-demo-evals.md](./08-demo-evals.md) | Demo de 10 s, golden set, tracks Psy / edge |
| [adr/](./adr/) | 0001–0009 (runtime) y 0010–0012 (producto) |

## Producto (una línea)

Teléfono: VisionPsy comprende el comprobante on-device. Escritorio: reglas + centro de excepciones + liquidación. El modelo no autoriza dinero.
