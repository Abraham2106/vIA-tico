# ADR 0014 — Design system: Carbon en desktop, tokens en móvil

## Estado

Aceptada (enmienda 2026-09-10).

## Contexto

La investigación UI/UX (2026-09-09) evaluó Material 3, Carbon, Tailwind UI y Ant Design. Un restyle propio (Inter + tokens hex) produjo un dashboard genérico. El escritorio es un centro de excepciones data-heavy (ADR 0011); Carbon for IBM Products es esa clase de producto.

## Decisión

1. **Desktop (`apps/desktop`):** Carbon 11 + `@carbon/ibm-products`. IBM Plex. Temas `g10` / `g90`. UI Shell (`Header`, `SideNav`), `preview__PageHeader`, `SidePanel`, `NoDataEmptyState`, `OptionsTile`, `DataTable`, `Tag`.
2. **Móvil (`apps/mobile`):** tokens en `packages/ui-tokens` + Expo. **No** se comparte React DOM ni Carbon con React Native.
3. Confianza de IA = banda `alta|media|baja` del contrato, no un porcentaje inventado.
4. Categorías visuales = `RECEIPT_CATEGORIES`. Excepciones = reglas de `packages/core`.
5. Light default (`g10`) con dark (`g90`) y `auto`. Offline sin banner de desconexión.

## Consecuencias

- No reintroducir Inter ni una paleta teal custom en el renderer.
- Añadir tabs de liquidación en el móvil requiere enmendar ADR 0011 primero.
- Un componente visual nuevo de escritorio se busca primero en Carbon / IBM Products, no se inventa un kit paralelo.
