# Cómo trabajar el monorepo

ViáticoCero es **un repo, dos apps, un hexágono**. Las reglas cortas para humanos y agentes están también en skills de Cursor (se cargan solas o con `/nombre`).

## Día a día

1. Clona **un** Git. No hay segundo remoto para el celular.
2. Elige superficie:
   - Dominio / veredictos / excepciones / motivo / auditoría → `packages/core` (ADR 0010, 0013)
   - JSON teléfono ↔ PC → `packages/contracts` (schema, no texto libre)
   - Cámara, motivo libre o VisionPsy → `apps/mobile` (Expo/RN, **no Flutter**)
   - Centro de excepciones, conciliación, auditoría, PDF/Excel → `apps/desktop`
   - Color, spacing, tema → `packages/ui-tokens` (ADR 0014). Componentes React se quedan en cada app.
3. Un PR puede tocar varios paquetes si el DTO o un caso de uso cruza dispositivos.
4. Workspaces npm en la raíz (`packages/*` + `apps/*`). Expo y Electron **no** comparten un solo manifiesto de app; cada una tiene el suyo. `.npmrc` usa `install-strategy=nested` para no pelear React DOM vs React Native.

## Skills en este repo

Cursor las descubre en `.cursor/skills/` y en `apps/*/.cursor/skills/` (estas últimas solo al trabajar esa app).

| Skill | Dónde | Para qué |
| --- | --- | --- |
| `viaticocero-monorepo` | raíz | Dónde poner cada cambio |
| `qvac-sdk` | raíz | `@qvac/sdk@0.18.2`, plugins, Bare |
| `local-ai` | raíz | Nada de APIs cloud de recibos |
| `delegated-inference` | raíz | DTO vs `loadModel({ delegate })` |
| `electron-qvac` | `apps/desktop` | App Electron de producto |
| `android-sdk` | `apps/mobile` | Expo, device físico, minSdk |
| `metro-expo` | `apps/mobile` | Metro ≠ Vite |

En el chat del Agent: `/viaticocero-monorepo`, `/qvac-sdk`, etc.

## Relación con Docs/

`Docs/` justifica **por qué**. Empieza por [00-producto.md](./00-producto.md): **tesis** (excepciones documentales financieras) y **cuña** (viáticos). Las skills dicen **cómo debe comportarse el agente**. Si chocan, gana el ADR (0013 scaffold; 0010–0012 producto; 0014 UI; 0001–0009 runtime).

No revivas `src/` en la raíz (scaffold de una sola app, PR #1).
