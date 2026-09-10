# Demo, evals y tracks

El jurado ve el vídeo primero (máx. 5 min). Si hace falta explicar hexagonal, el demo falló.

## Historia de 10 segundos

1. Hay un viaje (10–14 sep).
2. Foto de un comprobante **fuera de fechas** (o duplicado, o ilegible).
3. El sistema marca **⚠ REVISIÓN** con la regla en claro.
4. El resto de tickets nítidos y dentro de política pasan a ✓ PROCEDE.
5. Liquidación: respaldado vs adelanto vs excepciones abiertas.

Eso es el equivalente local de *texto peligroso → bloquea* / *PARK o REFUSE*.

## Qué no mostrar como demo principal

- Veinte minutos de puertos y Bare.
- Un JSON bonito de un ticket inglés nítido sin veredicto.
- Etapa 2–3 (ERP, matching OC).
- El modelo «aprobando» en chat.

## Evals repetibles

Golden set en `apps/mobile/resources/samples/receipts/` (y fixtures de viaje en tests de dominio):

- Tickets CR/MX reales o realistas (español, colones/pesos, IVA).
- Al menos un **fuera de período**.
- Al menos un **duplicado**.
- Al menos uno **denso / térmico** (perfil Base).
- Al menos uno **ilegible** → REVISIÓN, no invento.

Métricas de producto (dominio, sin GPU):

- ¿El veredicto coincide con el golden? (`PROCEDE` / `REVISIÓN` / `NO PROCEDE`)
- ¿El validador de dígitos rechazó un postproceso que cambió el monto?

Métricas QVAC (log de rendimiento del track Psy): carga, prompt, tokens, TTFT, throughput. Nombres de modelo y quant honestos (VisionPsy-Nano Flash vs Base; `QWEN3_4B_INST_Q4_K_M`, no la constante de difusión).

CI unitaria **no** descarga GGUF. Los evals de visión viven en `apps/mobile/tests/integration/qvac` en device físico.

## Track Psy

VisionPsy Nano es **central** en el flujo de usuario (foto → estructura). Corre en teléfono, que es el hardware para el que Tether dimensionó los ~460M.

No basta con «tener el Psy en el repo». Si la captura real corre solo en un tower, el track se debilita.

TranslatePsy no es el camino de etapa 1 (el dominio es español de negocio; el postproceso es Qwen Instruct acotado). MedPsy no aplica.

Divulgar: benches de OCR/DocVQA de Tether son de **clase ~0.5B**; el dominio CR/MX pide schema + excepciones. Eso es ingeniería, no una disculpa del modelo.

## Track «donde la nube no llega»

Inferencia de las features juzgadas: **solo QVAC local**. Cloud de visión/LLM descalifica.

Datos sensibles (comprobantes) + campo / offline = la razón de existir. P2P (`startQVACProvider`) es extra, no el sistema de registro (ADR 0008).

Entregables: repo accesible, vídeo ≤ 5 min, README con base preexistente, log de rendimiento.

## Hardware declarado (reproducibilidad)

- Android **físico** arm64, API 31+ / minSdk 29. No emulador, no Expo Go.
- Desktop: Node ≥ 22.17; Electron con `asar: false`; Linux `--no-sandbox`.
