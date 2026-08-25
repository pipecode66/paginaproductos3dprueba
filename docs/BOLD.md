# Integración Bold

## Flujo implementado

1. El cliente añade joyas y medidas a la canasta.
2. El cliente selecciona recogida en tienda, domicilio nacional o entrega internacional.
3. Las compras nacionales usan `POST /api/payments/orders`; las internacionales crean primero una solicitud de coordinación sin cobro ni reserva.
4. El servidor reserva el inventario de la orden y aplica el ajuste comercial del 5 % para Colombia o del 6 % para entregas internacionales.
5. El total conserva el IVA del 19 % incluido, se crea una referencia única y se genera el hash SHA-256 con la llave secreta.
6. El navegador abre `BoldCheckout` con `renderMode: embedded`.
7. Bold envía el resultado a `POST /api/payments/bold/webhook`.
8. El servidor valida `x-bold-signature` sobre el cuerpo crudo, evita eventos duplicados y actualiza la orden.
9. `/pago/resultado` consulta el estado registrado por el servidor.

La reserva de inventario se confirma al aprobarse el pago. Se libera de manera idempotente cuando la venta es rechazada, anulada o cuando la orden vence tras 24 horas sin confirmación.

El costo del domicilio nacional no forma parte del monto enviado a Bold y se paga por separado al recibir. Para exportaciones, el administrador registra en la bandeja internacional las condiciones, transporte y costo estimado; el enlace Bold se genera solo después de que el cliente las acepte. El pago Bold cubre las joyas y el transporte internacional se gestiona según el acuerdo consignado.

En el ambiente de pruebas, Bold firma la notificación del botón `Probar el webhook` usando una clave vacía. En producción se utiliza la llave secreta del Botón de pagos.

La notificación manual del sandbox puede anonimizar el pago como `XXXX` y enviar montos de ejemplo. Esa excepción se reconoce solamente en `BOLD_ENVIRONMENT=test`; los webhooks de producción siempre deben coincidir con el monto y la moneda de la orden.

Estados internos: `CREATED`, `PAID`, `REJECTED`, `VOIDED` y `REVIEW_REQUIRED`.

## Variables

```dotenv
BOLD_ENVIRONMENT=test
BOLD_TEST_IDENTITY_KEY=
BOLD_TEST_SECRET_KEY=
BOLD_PRODUCTION_IDENTITY_KEY=
BOLD_PRODUCTION_SECRET_KEY=
DATABASE_URL=
PUBLIC_BASE_URL=http://localhost:4173
PORT=4173
ALLOW_BOLD_PRODUCTION=false
```

El IVA está fijado en `vat-19` dentro de la configuración de la aplicación. No requiere una variable adicional en Vercel. Los ajustes del 5 % y 6 % forman parte del total firmado y no se reportan como un impuesto independiente.

No se deben incluir llaves reales en Git, JavaScript del navegador, capturas, registros ni documentación. La llave de identidad se entrega al checkout desde el servidor; la llave secreta nunca sale del backend. Los pares separados impiden que Production seleccione por accidente las credenciales de Preview.

## Pruebas

`npm test` cubre firma de integridad, firma del webhook, manipulación de precios, medidas, existencias, idempotencia, discrepancias de monto, bloqueo de producción y endpoints HTTP.

`npm run test:browser` verifica que la librería oficial abra Embedded Checkout. `npm run test:payment` completa una venta aprobada con la tarjeta de sandbox publicada por Bold.

En el ambiente de pruebas Bold no envía el webhook automáticamente después de una venta simulada. Debe utilizarse la opción "Probar el webhook" del panel una vez exista una URL HTTPS pública.

## Configuración en Bold

Registrar como webhook:

```text
https://DOMINIO/api/payments/bold/webhook
```

La aplicación está preparada para ejecutarse como una función de Node.js en Vercel. En producción utiliza PostgreSQL mediante `DATABASE_URL`; los archivos de `var/` se reservan exclusivamente para desarrollo local.

## Paso a producción

1. Rotar las llaves que hayan sido compartidas por canales no destinados a secretos.
2. Conectar una base de datos PostgreSQL persistente al proyecto de Vercel.
3. Configurar las llaves de producción en `BOLD_PRODUCTION_IDENTITY_KEY` y `BOLD_PRODUCTION_SECRET_KEY` como secretos del proveedor de hosting.
4. Definir `BOLD_ENVIRONMENT=production` y la URL pública real.
5. Confirmar que el resumen muestre IVA del 19 % incluido y el ajuste correspondiente al destino.
6. Registrar y probar el webhook desde el panel Bold.
7. Confirmar los límites de monto habilitados para el comercio.
8. Ejecutar una compra real controlada de bajo valor.
9. Solo después de esas validaciones, establecer `ALLOW_BOLD_PRODUCTION=true`.

## Persistencia y panel administrativo

El registro de órdenes y el catálogo de pagos utilizan PostgreSQL en Vercel. Esta misma base queda preparada para conectar las altas, ediciones, precios, existencias y pedidos del panel administrativo al catálogo autoritativo que utiliza Bold. Consulta la guía [Puesta en marcha en Vercel](VERCEL.md).
