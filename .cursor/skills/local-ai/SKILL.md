---
name: local-ai
description: >
  IA local-first de ViáticoCero: comprobantes on-device, sin API cloud de visión
  ni LLM. Úsala al elegir modelos, red, privacidad, HuggingFace, OpenAI, OCR
  cloud, o cuando el usuario pida “que no salga de la máquina”.
---

# IA local (ViáticoCero)

El producto existe para que el **recibo no viaje a un API de terceros**. Inferencia = QVAC en el hardware del usuario. El modelo **no autoriza dinero** (ADR 0010).

## Qué está permitido

| Dato | Dónde se procesa |
| --- | --- |
| Foto del comprobante | VisionPsy Nano **en el celular** (document understanding / OCR on-device, Tether) |
| Postproceso lingüístico | Qwen3-4B-Instruct **en el escritorio** (`QWEN3_4B_INST_Q4_K_M`) |
| Veredicto `PROCEDE / REVISIÓN / NO PROCEDE` | **Código** en `packages/core` |
| Expediente, PDF, Excel | Disco local del desktop |

Red: emparejamiento LAN/P2P entre **sus** dispositivos. Descarga inicial de pesos (registro QVAC / Hugging Face) es distribución de modelos, no envío de recibos.

## Qué está prohibido (salvo ADR nuevo)

- OpenAI, Anthropic, Gemini, vision APIs cloud, OCR SaaS.
- Subir la imagen o el DTO a un backend propio “temporal”.
- Correr VisionPsy en un servidor remoto *en lugar del teléfono*.
- Telemetría de contenido de recibos.
- Dejar que el LLM marque PROCEDE o dispare un pago.

## Diseño

1. Extrae en el borde (Nano, 1 imagen). Schema + confianza + RAW. El JPEG no es la fuente de verdad del asiento.
2. El Instruct ve el DTO; no puede cambiar dígitos, fechas ni moneda. Si lo hace, gana el RAW y `REVISIÓN`.
3. `unloadModel` cuando la pantalla ya no necesita el motor.
4. Tests de dominio con puertos mockeados: no descargues GGUF en CI unitaria.

Si una feature “necesita la nube”, para y propone un ADR. No lo cueles en un adaptador.

Test: *si reemplazo QVAC por reglas o una API cloud, ¿el producto vale lo mismo?* Si sí, QVAC está pegado encima.
