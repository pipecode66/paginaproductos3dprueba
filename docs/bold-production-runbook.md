# Paso a producción de Bold y Vercel

Este procedimiento evita activar cobros reales antes de comprobar las credenciales, la base de datos y el webhook.

## 1. Requisitos antes del cambio

- Revocar y generar nuevamente las llaves de producción de Bold que hayan sido compartidas fuera de un canal seguro.
- Confirmar que los precios y los ajustes comerciales incluyen IVA del 19 %.
- Confirmar que la cuenta Bold del comercio esté activa y que sus límites permitan los precios del catálogo.
- Conservar las llaves de prueba únicamente en Preview y Development. No mezclar llaves de prueba y producción.

## 2. Preparar Vercel con ventas bloqueadas

Configurar estas variables solamente para el entorno Production:

```text
BOLD_ENVIRONMENT=production
BOLD_IDENTITY_KEY=<nueva llave de identidad de producción>
BOLD_SECRET_KEY=<nueva llave secreta de producción>
PUBLIC_BASE_URL=https://joyeriaquerubim.vercel.app
ALLOW_BOLD_PRODUCTION=false
```

La aplicación envía automáticamente `vat-19`. No se configura `BOLD_TAX` en Vercel.

No modificar `DATABASE_URL`, las variables administrativas ni las de Cloudflare R2. Después de guardar las variables, hacer un redeploy de Production.

Verificar el despliegue bloqueado:

```powershell
npm run test:production-readiness -- https://joyeriaquerubim.vercel.app production_locked
```

El resultado correcto debe indicar `launchStage: production_locked`, `readyToActivate: true` y `canReceiveWebhooks: true`.

## 3. Configurar el webhook de producción en Bold

- URL: `https://joyeriaquerubim.vercel.app/api/payments/bold/webhook`
- Seleccionar venta aprobada, venta rechazada, anulación aprobada y anulación rechazada.
- No marcar la opción que identifica el webhook como prueba.
- El endpoint verifica `X-Bold-Signature` antes de procesar cualquier evento.

El bloqueo de ventas no bloquea los webhooks. Esto permite seguir recibiendo resultados de pagos que ya estuvieran en curso.

## 4. Activar cobros reales

Cuando el preflight bloqueado y el webhook estén confirmados:

1. Cambiar `ALLOW_BOLD_PRODUCTION` a `true` únicamente en Production.
2. Hacer un nuevo redeploy de Production.
3. Ejecutar:

```powershell
npm run test:production-readiness -- https://joyeriaquerubim.vercel.app production_live
```

4. Realizar una compra real de monto bajo con una tarjeta autorizada por el comercio.
5. Confirmar en Bold, en la página de resultado y en el panel administrativo que la orden figure como pagada.

## 5. Reversión inmediata

Si el checkout presenta un comportamiento incorrecto:

1. Cambiar `ALLOW_BOLD_PRODUCTION=false` en Vercel Production.
2. Hacer redeploy inmediatamente.
3. No retirar el webhook de Bold: debe continuar confirmando transacciones iniciadas antes del bloqueo.
4. Verificar que `/api/payments/health` informe `production_locked`.

Nunca reemplazar las llaves por valores de prueba para detener ventas reales. El interruptor correcto es `ALLOW_BOLD_PRODUCTION`.
