# ADR 0004 — VisionPsy Nano solo en el celular

## Estado

Aceptada (enmendada: ya no corre en Electron; perfil Base para tickets densos).

## Contexto

VisionPsy Nano (~460M, una imagen) es el VLM que Tether publica para edge: lidera su clase de peso en document understanding / OCR, percepción, razonamiento e instruction following. Cabe en el teléfono; Qwen Instruct 4B no.

## Decisión

- VisionPsy **solo** en `apps/mobile`. El desktop consume `packages/contracts/vision-result`.
- Comprobantes densos: perfil **Base** (`*_1`, sin `image_no_upscale`) si la RAM da.
- Latencia / RAM justa: **Flash** + mmproj homónimo + `image_no_upscale: 'on'`.
- Plugin: `llamacpp-completion`.
- El dominio no nombra GGUF ni mmproj.
- No se añade `ggml-ocr` en el scaffold: el Psy cubre el documento. Un segundo OCR sería un adaptador extra, no un reemplazo.

## Consecuencias

- Una imagen por query.
- El DTO lleva schema + confianza + RAW; el veredicto no sale del modelo (ADR 0010, 0012).
- Mezclar Flash/Base con el flag incorrecto degrada calidad y pasa validación.
