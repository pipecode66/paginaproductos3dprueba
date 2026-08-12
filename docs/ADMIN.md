# Panel administrativo Querubim

## Configuración privada en Vercel

Registra estas variables en `Project Settings > Environment Variables` para Production, Preview y Development:

```text
ADMIN_EMAIL=correo elegido por el responsable
ADMIN_PASSWORD=contraseña fuerte y exclusiva
ADMIN_SESSION_SECRET=secreto aleatorio de 32 caracteres o más
```

Después de guardar las variables, crea un nuevo despliegue. Las credenciales se validan únicamente en el servidor y la sesión se entrega mediante una cookie `HttpOnly`, `SameSite=Strict` y `Secure` bajo HTTPS. La sesión expira después de 15 minutos de inactividad.

En desarrollo local deben declararse las mismas tres variables dentro de `.env.local`, archivo que está excluido de Git.

## Datos administrados

- Catálogo público y catálogo premium.
- Nombre, categoría, precio, existencias, material y descripción.
- Metal, pureza, gema, grabado y medidas.
- Galería de hasta 12 rutas públicas o URL HTTPS.
- Productos destacados y premium.
- Órdenes, clientes, ingresos y estados recibidos desde Bold.
- Búsqueda, filtros y paginación de pedidos.
- Estados operativos de preparación, entrega y cancelación.
- Transportadora, número de guía, notas internas e historial de cambios.
- Banner principal, campañas temporales, invitación Premium y portada Premium.
- Carga de imágenes comerciales y de productos mediante Cloudflare R2.
- Bandeja de solicitudes internacionales con condiciones, transporte, costo estimado y aceptación del cliente.
- Generación de una orden Bold y un enlace seguro de pago únicamente después de acordar la exportación.

El estado financiero es de solo lectura y únicamente cambia mediante los webhooks firmados de Bold. El seguimiento operativo se administra por separado para evitar que una acción interna pueda falsificar un pago.

La eliminación es lógica: el producto se retira de la tienda y de nuevas compras, pero permanece en la base de datos para conservar la integridad de pedidos anteriores.

## Almacenamiento de imágenes con Cloudflare

La carga directa requiere las credenciales privadas del bucket R2 y su URL pública en las variables de Vercel. Las imágenes se almacenan como objetos en Cloudflare y PostgreSQL conserva sus URL; no se guardan imágenes Base64 dentro de la base de datos.

Los cambios de contenido comercial se publican desde el módulo `Portadas, campañas y vitrinas`. El banner de campaña puede activarse o desactivarse sin eliminar su configuración.

## Solicitudes internacionales

1. El cliente selecciona entrega fuera de Colombia y registra su solicitud.
2. El panel la muestra sin crear cobro ni reservar inventario.
3. El administrador define transporte, valor estimado, plazo y condiciones.
4. Después de confirmar la aceptación del cliente, genera la orden Bold.
5. El sistema reserva inventario y prepara un enlace protegido para enviarlo por WhatsApp.
6. Cuando Bold confirma el pago, la solicitud aparece como pago confirmado y la orden continúa en seguimiento operativo.
