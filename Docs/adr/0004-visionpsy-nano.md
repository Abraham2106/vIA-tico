# ADR 0004 — VisionPsy Nano solo en el celular

## Estado

Aceptada (enmendada: ya no corre en Electron).

## Contexto

VisionPsy Nano (~460M, una imagen) está pensado para el teléfono. El LLM pesado no.

## Decisión

- Default móvil: **Flash** + mmproj homónimo + `image_no_upscale: 'on'`.
- Base (`*_1`) como perfil opcional.
- Plugin: `llamacpp-completion`.
- Desktop **no** carga VisionPsy; consume el DTO de `packages/contracts/vision-result`.
- El dominio no nombra GGUF ni mmproj.

## Consecuencias

- Salida en inglés a validar en el adaptador/contrato.
- Sin multi-imagen. Sin `ggml-ocr` en el scaffold.
