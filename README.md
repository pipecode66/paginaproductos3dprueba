# Joyería Querubim

Tienda web de Joyería Querubim con catálogo, secciones institucionales, contacto, canasta y pagos en línea mediante Bold Embedded Checkout.

## Ejecución local

1. Instala las dependencias con `npm install`.
2. Crea `.env.local` a partir de `.env.example` y configura únicamente llaves de prueba.
3. Inicia frontend y servidor con `npm run dev`.
4. Abre `http://localhost:4173`.

## Comandos

```bash
npm run dev
npm test
npm run test:browser
npm run test:payment
npm run build
npm start
```

`npm run test:payment` realiza una compra simulada aprobada en el ambiente de pruebas de Bold. No usa dinero real.

## Pagos

La llave secreta permanece exclusivamente en el servidor. El navegador envía referencias y medidas; el servidor consulta su propio catálogo, valida existencias, recalcula el total, crea la orden y genera la firma de integridad.

Consulta el procedimiento completo en [Integración Bold](docs/BOLD.md).
