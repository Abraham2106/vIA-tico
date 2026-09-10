---
name: delegated-inference
description: >
  Inferencia QVAC local vs delegada (P2P Hyperswarm, startQVACProvider,
  loadModel delegate). Úsala al emparejar celular y PC, hablar de provider,
  DHT, fallbackToLocal, o si el teléfono debe “usar el modelo del desktop”.
---

# Inferencia local vs delegada

Dos caminos. **El de producto no es el delegate.**

## Camino de producto (sistema de registro)

```
VisionPsy local (móvil) → contracts/vision-result → analysis-job
    → inbox Electron → ingest-vision-result → postproceso ILanguageModel (opcional)
    → validate-policy en core → centro de excepciones / liquidación / export
```

Puerto: `IJobTransport`. El desktop **muestra, guarda y exporta**. ADR 0008.

## Camino opcional QVAC (tokens en el celular)

[Delegated inference](https://docs.qvac.tether.io/p2p-capabilities/delegated-inference/):

- Desktop: `startQVACProvider()` en `apps/desktop/.../qvac-provider`.
- Móvil: `loadModel({ delegate: { providerPublicKey, timeout: 60_000, fallbackToLocal } })` y luego `completion()` igual que local.
- Conexión directa `dht.connect(publicKey)`. Cold start DHT **15–45 s**.
- Si el provider reinicia, el consumer no reconecta solo: hay que re-emparejar/reintentar.
- Firewall opcional por clave del consumer.

Esto **no** crea el expediente ni dispara PDF/CSV. Si el usuario quiere “verlo en el PC”, usa el DTO + inbox, no solo el stream en el teléfono.

## Qué no hacer

- Delegar **VisionPsy** al PC. El Nano corre en el celular.
- Hacer del `delegate` la única fuente de verdad.
- `fallbackToLocal: true` en el celular para el LLM **pesado**: el teléfono no lo tiene; fallaría o intentaría bajar un GGUF enorme.
- Bloquear la UI del inbox a la espera del DHT si el job ya llegó por `IJobTransport`.

Pairing (QR / clave) es `pair-devices` + `packages/contracts/pairing`.
