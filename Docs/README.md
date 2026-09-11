# ViáticoCero — documentación

**Tesis:** excepciones documentales financieras. **Cuña:** viáticos (etapa 1).  
Canónico: [`00-producto.md`](./00-producto.md). Carpetas de la cuña: [`03-estructura.md`](./03-estructura.md) + ADR 0013.

El hexágono, los contratos y las apps (sin motor QVAC) ya están en el árbol. Los ADRs siguen mandando.


| Documento | Qué responde |
| --- | --- |
| [00-producto.md](./00-producto.md) | Tesis + cuña (18 puntos). Léase el bloque inicial antes de los ejemplos de viaje |
| [01-stack.md](./01-stack.md) | QVAC **0.18.2**, VisionPsy en el celular, Qwen Instruct en desktop |
| [02-arquitectura-hexagonal.md](./02-arquitectura-hexagonal.md) | Puertos; `verdict` solo en core |
| [03-estructura.md](./03-estructura.md) | Árbol de la **cuña** (etapa 1); etapas 2–3 sin paquetes |
| [04-qvac-visionpsy-bare.md](./04-qvac-visionpsy-bare.md) | Modelos, Flash/Base, Bare |
| [05-referencias.md](./05-referencias.md) | Tutoriales Tether |
| [06-como-trabajar-monorepo.md](./06-como-trabajar-monorepo.md) | Día a día + skills |
| [07-autoridad-pipeline.md](./07-autoridad-pipeline.md) | Schema, motivo sin veredicto, dígitos, política |
| [08-demo-evals.md](./08-demo-evals.md) | Demo ⚠ de la cuña, golden set, tracks |
| [09-ui-ux.md](./09-ui-ux.md) | Desktop Carbon / IBM Products; móvil tokens; IA UX |
| [12-persistencia-sqlite.md](./12-persistencia-sqlite.md) | Auditoría del expediente: no hay backend HTTP; SQLite 3 local |
| [adr/](./adr/) | 0001–0009 runtime; 0010–0015 producto |

## Producto (una línea)

Sistema de excepciones sobre documentos financieros, on-device. Primera instancia: un viaje. El modelo no autoriza dinero.
