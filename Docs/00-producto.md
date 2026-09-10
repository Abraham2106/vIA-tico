# Producto: tesis + cuña

**Tesis (lo que es el producto):** un sistema de **excepciones documentales financieras**. En una empresa el trabajo no es leer un PDF. Es interpretar documentos heterogéneos, validarlos contra otro registro, dejar pasar lo normal y concentrar humanos en lo que no cuadra — con trazabilidad, sin que la IA autorice dinero.

**Cuña (lo que se construye ahora):** **viáticos**. Un viaje es el primer «otro registro» (como más adelante lo será una orden de compra). El demo, las carpetas y el hackathon son esa cuña. No son el techo.

```
TESIS                          CUÑA (etapa 1)                 DESPUÉS (sin carpetas)
excepciones documentales  →    liquidar un viaje         →    gastos → facturas/OC → ERP
financieras                    centro de ⚠                     matching
```

Filosofía: *la IA interpreta; el sistema verifica; el humano decide cuando existe incertidumbre.*

Veredicto de dominio (no del modelo): `PROCEDE | REVISIÓN | NO PROCEDE`. En UI, PROCEDE puede leerse «aprobado».

El scaffold en `packages/core` **mapea la cuña**. Etapas 2–3 no tienen paquetes (ADR 0013). Los §§1–18 de abajo explican la tesis; cada ejemplo de viaje es instancia, no definición.

---

## 1. El problema no es «leer facturas»

En una empresa pequeña, una factura parece: recibir, leer proveedor/fecha/monto, registrar.

En una grande el proceso es el de **cualquier documento financiero**, no solo un ticket de peaje:

```
recibir → interpretar → validar → comparar → excepciones → aprobar → registrar → auditar
```

Cientos o miles de documentos, proveedores y formatos distintos. El cuello de botella es no saber **cuáles** requieren atención.

La **cuña** aplica esa misma cadena a la liquidación de un viaje: combustible, peajes, alimentación, hospedaje, estacionamiento, representación. Los papeles pueden estar deteriorados o en formatos distintos. El ancla de comparación hoy es el viaje; mañana puede ser una OC — el centro de excepciones no cambia.

**Solución (flujo de producto):**

```
captura → comprensión documental → extracción → validación → conciliación → excepción → reporte
```

La IA interpreta lo difícil de estructurar. Las decisiones de dinero son reglas deterministas.

---

## 2. El principal problema: las excepciones

Los casos normales deben pasar solos. Las personas ven cuando algo no coincide: ilegible, falta dato, el documento no encaja con **el registro de contexto** (en la cuña: período del viaje; después: una OC), duplicado, motivo ambiguo, monto vs declaración, tipo vs política, datos contradictorios.

**Solución:** centro de excepciones (`apps/desktop/.../features/exceptions`, caso `open-exception` / `resolve-exception`).

```
LIQUIDACIÓN DEL VIAJE — 8 comprobantes

✓ Combustible          PROCEDE
✓ Hospedaje            PROCEDE
✓ Peaje                PROCEDE
✓ Alimentación         PROCEDE
✓ Estacionamiento      PROCEDE
⚠ Alimentación         REVISIÓN
⚠ Documento            REVISIÓN
✓ Combustible          PROCEDE
```

No se busca eliminar al humano. Se busca que no revise los ocho.

---

## 3. El documento no existe aislado

En compras: factura ↔ orden de compra. Ese es el patrón de la tesis (matching contra otro registro).

**Cuña:** el ancla es el **viaje** (`domain/trip`): empleado, fecha inicio/fin, destino, motivo del viaje, presupuesto/adelanto. Viaje 10–14 sep + ticket 25 sep, aunque VisionPsy lo lea perfecto → **⚠ Fecha fuera del período** (`validate-policy`).

La pregunta no es solo «¿qué dice?» sino «¿tiene sentido contra este registro?». Matching factura↔OC es etapa 3: no hay carpetas para eso.

---

## 4. Documentos heterogéneos → comprensión, no solo caracteres

Diseño, calidad, idioma, foto, térmico, manuscrito. Un OCR de caracteres pregunta «¿qué letras vi?». El producto pregunta «¿qué representa esto?».

**Solución:** VisionPsy Nano en el teléfono (`analyze-receipt` → `contracts/vision-result`):

```json
{
  "proveedor": "…",
  "fecha": "YYYY-MM-DD",
  "monto": 0,
  "tipo_documento": "recibo",
  "confianza_lectura": "alta",
  "raw_text": "…"
}
```

Tether anuncia VisionPsy como document understanding / OCR de su clase. La IA **no** decide si el gasto se acepta. Puede decir «creo que son ₡25 000, confianza media»; el código dice si entra en política.

---

## 5. Duplicados

Misma carga por otro canal, otro scan, segunda liquidación. Señal: proveedor + fecha + monto [+ identificador electrónico si existe] (`detect-duplicates`). → **⚠ Posible duplicado**.

---

## 6. Conciliación

Adelanto ₡150 000 vs comprobantes ₡130 000 → diferencia ₡20 000. Relación `viaje → comprobantes → gastos → total → adelanto` (`reconcile-advance`, `settle-trip`).

La liquidación muestra: declarado, respaldado, aprobado (`PROCEDE`), en revisión, pendiente. No basta con leer tickets: hay que reconciliar.

---

## 7. Clasificar el motivo del gasto (etapa 1)

El ticket no explica «almorcé con el cliente». El empleado escribe lenguaje natural (`declare-motive` en captura móvil). Qwen Instruct clasifica (`classify-motive` → `contracts/motive-classification`):

```json
{
  "categoria": "representacion",
  "razon": "Gasto asociado a reunión con cliente.",
  "confianza_clasificacion": "alta"
}
```

Categorías: combustible, hospedaje, alimentación, peaje, representación, otro.

**La IA clasifica; las reglas determinan.** El JSON **no** lleva `veredicto`. «Compré unas cosas para el viaje» + confianza baja → `REVISIÓN`, no una categoría inventada.

---

## 8. Automatización sin pagar porque lo dijo el modelo

```
                    IA
                     │
                     ▼
              Extrae / clasifica
                     │
                     ▼
             Evidencia estructurada
                     │
                     ▼
             Motor de validación (core)
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       PROCEDE    REVISIÓN   NO PROCEDE
          │          │          │
          ▼          ▼          ▼
      Automático   Humano    Justificación
```

Contrato `verdict`. No hay tool de pago ni de «marcar PROCEDE» en el modelo.

---

## 9. Confianza ≠ verdad financiera

₡35 000 + confianza alta ≠ ₡35 000 + confianza baja. Baja = persona comprueba, no «gasto inválido». `confianza_lectura` / `confianza_clasificacion` media o baja **fuerzan** `REVISIÓN`.

---

## 10. Auditoría

Cada decisión se reconstruye (`domain/audit`, `record-audit`, `contracts/audit-event`, UI `features/audit`):

```
Comprobante #0042
Proveedor: XYZ
Monto extraído: ₡25 000
Confianza: media
Categoría: alimentación
Regla: dentro del período del viaje
Resultado: REVISIÓN
Motivo: monto extraído con confianza media
Intervención: revisado por usuario
Fecha: …
```

Pregunta objetivo: «¿por qué este gasto terminó aprobado?»

---

## 11. Privacidad / edge

```
CLOUD (no)                    EDGE (sí)
Teléfono → API cloud          Teléfono → QVAC → VisionPsy → DTO
```

Offline-first para interpretar. La red es emparejamiento entre dispositivos del usuario (DTO al desktop), no requisito para leer el ticket. Qwen Instruct en el PC es postproceso y clasificación de motivo; **no** es API cloud.

---

## 12. Integración

Ahora: reporte, CSV, Excel, JSON (`export-formats`, `export-report`).  
No ahora: SAP, bancos, API ERP. No hay carpetas de conectores ERP.

---

## 13. Cuello de botella y métrica

El problema no es «no podemos leer la factura». Es «no sabemos cuáles de cien requieren atención».

Ejemplo conceptual (no es un SLA): 100 documentos → ~85 automáticos → ~15 excepciones. La métrica de producto:

*¿Cuántos pasan solos y cuántos necesitan humano?*

Evals: golden set de veredictos (`Docs/08-demo-evals.md`).

---

## 14. Escalabilidad (visión; sin carpetas)

| Etapa | Qué es | ¿Scaffold? |
| --- | --- | --- |
| **1 — cuña ViáticoCero** | Instantánea de la tesis en un viaje | Sí |
| **2 — tesis se ensancha** | Expense management más allá de viajes | No |
| **3 — tesis completa** | Facturas, OC, matching, ERP | No |

---

## 15. Qué es (y qué no)

No: «una IA que lee facturas».  
No: «una IA que reemplaza al contador».

Sí: sistema de **excepciones documentales financieras** (automatización y control de gastos) que usa IA para documentos y lenguaje, reglas para validar, y humanos para las excepciones. La primera cuña es viáticos; el problema que resuelve no se agota en viajes.

Convierte: documentos desordenados + texto libre + proceso manual  
en: estructura + validación + conciliación + excepciones + trazabilidad.

---

## 16. Cadena conceptual (misma tesis; dibujo de la cuña)

```
                  EMPLEADO
                     │
                     ▼
             📷 COMPROBANTE  +  motivo libre (opcional)
                     │
                     ▼
          VISIONPSY-NANO / QVAC
                     │
                     ▼
          INFORMACIÓN ESTRUCTURADA
                     │
             ┌───────┴────────┐
             │                │
             ▼                ▼
       DATOS VISUALES    MOTIVO DEL GASTO
       vision-result     classify-motive
             │                │
             └───────┬────────┘
                     ▼
              VALIDACIÓN (core)
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    PROCEDE        REVISIÓN     NO PROCEDE
       │             │             │
       │             ▼             │
       │           HUMANO          │
       │             │             │
       └─────────────┼─────────────┘
                     ▼
               CONCILIACIÓN
                     │
                     ▼
                LIQUIDACIÓN
                     │
                     ▼
              REPORTE / AUDITORÍA
```

---

## 17. Cuatro principios

1. **IA** para lo ambiguo (imagen, documento, lenguaje).
2. **Código** para lo determinista (fechas, montos, duplicados, política, conciliación).
3. **Humanos** para excepciones (si no hay certeza, no inventa).
4. **Trazabilidad** para cada decisión.

---

## 18. Visión a largo plazo (la tesis, no el vídeo)

```
CUÑA                         TESIS
viáticos          →    gestión de gastos    →    documentos financieros
liquidar viaje         (no solo viajes)          facturas, OC, matching
                                               excepciones → integración ERP
```

El valor diferencial no es digitalizar viáticos. Es que la IA interprete el documento **y** que el código + el humano manden sobre el dinero, en una cola de excepciones que escala a más tipos de documento.

El vídeo y el scaffold demuestran eso **con un viaje**. No redefinen el producto como «una app de viáticos».

Mapa carpeta ↔ cuña: [`03-estructura.md`](./03-estructura.md). Autoridad: [`07-autoridad-pipeline.md`](./07-autoridad-pipeline.md). ADR 0013.
