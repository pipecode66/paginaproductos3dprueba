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

La eliminación es lógica: el producto se retira de la tienda y de nuevas compras, pero permanece en la base de datos para conservar la integridad de pedidos anteriores.

## Integración pendiente con Cloudflare

Hasta conectar el almacenamiento, el editor admite rutas bajo `public` y URL HTTPS. La carga directa de archivos se conectará cuando estén disponibles las credenciales y el dominio público de Cloudflare; no se guardan imágenes Base64 dentro de PostgreSQL.
