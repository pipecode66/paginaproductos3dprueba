# Puesta en marcha en Vercel

El repositorio ya contiene la función de pagos, el enrutamiento de Vercel y la persistencia PostgreSQL. Las tablas se crean y el catálogo inicial se carga automáticamente cuando la API se conecta por primera vez.

## Acciones en la cuenta de Vercel

1. Abre el proyecto de Querubim en Vercel.
2. Entra a `Storage` o `Marketplace` y selecciona `Neon`.
3. Instala `Neon Postgres`, elige el plan gratuito y conecta la base al proyecto de Querubim.
4. Selecciona una región de Estados Unidos Este para mantenerla cerca de la región predeterminada de las funciones de Vercel.
5. Confirma que Vercel haya creado `DATABASE_URL` para `Production` y `Preview`.
6. En `Settings > Environment Variables`, agrega las variables indicadas abajo.
7. En `Deployments`, abre el despliegue más reciente y selecciona `Redeploy` para aplicar las variables nuevas.

## Variables para las pruebas

```dotenv
BOLD_ENVIRONMENT=test
BOLD_IDENTITY_KEY=<llave de identidad de pruebas>
BOLD_SECRET_KEY=<llave secreta de pruebas>
PUBLIC_BASE_URL=https://DOMINIO-REAL
ALLOW_BOLD_PRODUCTION=false
```

`BOLD_SECRET_KEY` debe marcarse como variable sensible. No es necesario configurar `PORT` ni `BOLD_TAX` en Vercel: la aplicación envía `vat-19` de forma fija según la definición tributaria confirmada por el comercio.

Después del redespliegue, abre:

```text
https://DOMINIO-REAL/api/payments/health
```

La respuesta correcta debe incluir `"configured": true`, `"mode": "postgresql"` y `"ready": true`.

## Acción en Bold

En el panel del comercio registra esta URL para las notificaciones:

```text
https://DOMINIO-REAL/api/payments/bold/webhook
```

Ejecuta la prueba de webhook ofrecida por Bold. La API valida la firma del encabezado, registra el evento una sola vez y actualiza la orden correspondiente.

## Verificación automatizada

Con la base y las variables configuradas se puede comprobar la API pública con:

```bash
npm run test:deployment -- https://DOMINIO-REAL
```

La prueba consulta la salud del servicio, lee el catálogo, crea una orden técnica en el ambiente de pruebas y comprueba que permanezca guardada en PostgreSQL. No realiza cobros.

## Activación de producción

1. Solicita a Bold nuevas llaves de producción si las anteriores fueron compartidas por chat, correo o capturas.
2. Sustituye las variables de pruebas por las nuevas llaves de producción.
3. Cambia `BOLD_ENVIRONMENT=production`.
4. Confirma la URL pública, los impuestos y el límite de monto del comercio.
5. Realiza una compra real controlada de bajo valor.
6. Cambia `ALLOW_BOLD_PRODUCTION=true` únicamente al completar las validaciones anteriores.
