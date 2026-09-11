---
name: metro-expo
description: >
  Metro bundler y Expo en apps/mobile. Úsala al configurar babel, metro.config,
  prebuild, bare-pack, Hermes, Fast Refresh, o si alguien propone Vite/electron-vite
  dentro del paquete móvil.
---

# Metro (apps/mobile)

El móvil se empaqueta con **Metro** (Expo). Vite es solo `apps/desktop`.

## Reglas

1. No añadas `electron-vite`, `@vitejs/plugin-react` ni `react-dom` a `apps/mobile`. Tampoco Flutter (`flutter`, `dart`).
2. No mezcles componentes del renderer Electron (div/className) con View de React Native.
3. Alias de `packages/core` y `packages/contracts` vía workspaces/babel.
4. QVAC en Expo necesita `bare-pack` (devDependency del tutorial) y el plugin nativo; el bundle JS de Metro **no** sustituye el worker Bare.
5. `qvac.config.json` (no `.ts`): Metro/Bare no cargan `qvac.config.ts`.
6. Hermes: el release APK debe incluir el bundle (`index.android.bundle`). Tras cambiar `app.json` o plugins nativos: `npx expo prebuild --platform android`.

## Dev

- Fast Refresh: UI RN sí; nativos QVAC no — un cambio de addon implica rebuild nativo.
- Expo Go: **no**. Development build / `expo run:android`.

## Monorepo

Cuando existan workspaces, Metro debe ver los paquetes `packages/*` (watchFolders / `unstable_enableSymlinks` según Expo 54). No publiques `core` a npm solo para el móvil.
