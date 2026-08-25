# Auditoría funcional de Joyería Querubim

Fecha de comprobación: 25 de agosto de 2026

## Resultado ejecutivo

- 66 cláusulas corresponden al funcionamiento actual de la plataforma.
- 4 cláusulas requerían actualización o corrección y quedaron atendidas: 2, 35, 41 y 50.
- 2 puntos siguen siendo parciales o externos al desarrollo: el dominio personalizado de la cláusula 1 y la visualización 360 de la cláusula 18.
- El despliegue informa `production_live`, PostgreSQL disponible, webhooks activos y Cloudflare R2 configurado.
- El catálogo desplegado contiene 18 productos, 2 de ellos Premium. Ninguno supera cuatro imágenes.
- Los 71 archivos de fotografía local tienen hashes SHA-256 diferentes; no existen duplicados exactos en los archivos publicados.
- La verificación técnica final ejecutó 44 pruebas automatizadas, la prueba integral del panel y la compilación de producción.

## Comprobación de cláusulas

| N.º | Estado | Comprobación |
|---:|---|---|
| 1 | Parcial, depende del cliente | El nombre visible es Joyería Querubim. El sitio funciona en `joyeriaquerubim.vercel.app`. `joyeriaquerubim.com` no existe actualmente en DNS; comprar y vincular un dominio propio requiere decisión, pago y acceso del cliente. Mientras tanto, el canonical quedó corregido al dominio real de Vercel. |
| 2 | Corregido | El navbar ya usa el archivo completo del logo oficial, incluida su tipografía original. Se comprobó en computador, tablet y celular. |
| 3 | Cumple | La interfaz pública no presenta textos de prueba, demostración, modelado 3D ni proyecto provisional. También se retiraron textos residuales de diagnóstico que hablaban de datos de ejemplo. |
| 4 | Cumple | El inicio contiene presentación comercial, llamados a la acción, colección, servicios y acceso al catálogo. |
| 5 | Cumple | Los filtros contemplan cadenas, dijes, herrajes, candongas, brazaletes, dijes para manillas, manillas, topos, pulsos, tobilleras, anillos, aros, rosarios, tejidos especiales, balines, argollas de matrimonio y fabricaciones. |
| 6 | Cumple | Hay 71 fotografías reales dentro del catálogo local y el panel permite añadir material autorizado mediante Cloudflare R2. |
| 7 | Cumple | Las fotografías están agrupadas por producto y cada publicación usa su propia galería. |
| 8 | Cumple | La comprobación por hash no encontró archivos exactamente duplicados. |
| 9 | Cumple | Las galerías actuales corresponden a la selección de fotografías de mejor iluminación realizada durante la organización del catálogo. |
| 10 | Cumple | Los 18 productos tienen nombres comerciales diferenciados. |
| 11 | Cumple con pendiente comercial | Todos los productos tienen precio, pero siguen siendo valores provisionales hasta que el cliente entregue la lista definitiva. En producción existe un producto con precio de $1.000 COP que debe ser confirmado por el cliente. |
| 12 | Cumple | Las tarjetas son adaptables y reservan espacio para nombre, material, precio y estado comercial. |
| 13 | Cumple | El detalle reúne galería, descripción, material, variantes, disponibilidad y medidas. El despliegue completará en PostgreSQL los datos base que antes dependían del respaldo incluido en el frontend. |
| 14 | Cumple | La selección de medida es obligatoria antes de añadir una joya a la canasta. |
| 15 | Cumple | La canasta administra productos, medidas, cantidades, subtotal, ajuste comercial y total. |
| 16 | Cumple | Cada producto puede cotizarse por WhatsApp con su referencia y medida. |
| 17 | Cumple | El botón flotante permanece a la derecha y despliega su texto al pasar el cursor en equipos compatibles. |
| 18 | Parcial | Existe una galería ordenable de fotografías, pero no un visor 360 activo. El nuevo límite de cuatro fotos por producto no permite una secuencia 360 de 36 tomas; una futura función 360 necesitaría un campo y almacenamiento independientes. |
| 19 | Cumple | Premium es una ruta y catálogo independientes. |
| 20 | Cumple | Premium modifica navbar, fondo, bordes y controles con una estética oscura y dorada. |
| 21 | Cumple | Las tarjetas Premium usan aparición progresiva y reacción de brillo al pasar el cursor. |
| 22 | Cumple | No quedan banners, fondos ni productos generados con IA dentro de los activos públicos actuales. |
| 23 | Cumple | Historia funciona como sección independiente. |
| 24 | Cumple | Misión y visión están incluidas completas, sin recortes. |
| 25 | Cumple, con gestión externa | Contacto es una ruta independiente con dirección, horarios, teléfono, correo y redes. Cambiar la ficha de Google Business requiere acceso del propietario a esa cuenta; no se realiza desde el código. |
| 26 | Cumple | Instagram, Facebook, TikTok y WhatsApp usan iconos reconocibles y enlaces externos. |
| 27 | Cumple | La ubicación real está integrada mediante Google Maps y tiene enlace para abrir la ficha. |
| 28 | Cumple | El pie de página contiene información comercial, navegación y contacto. |
| 29 | Cumple | No se encontraron NIT, razón social fiscal ni datos tributarios sensibles en la interfaz pública. |
| 30 | Cumple | Hay estilos adaptables para computador, tablet y celular. |
| 31 | Cumple | Las revisiones visuales no detectaron desbordamiento horizontal en los tamaños comprobados. |
| 32 | Cumple | La revisión UTF-8 no encontró caracteres corruptos; tildes y eñes están presentes en tienda y panel. |
| 33 | Cumple | `/admin` cuenta con autenticación privada, límite de intentos y cookie de sesión protegida. |
| 34 | Cumple | Tras ingresar, el navbar público se oculta y se utiliza una aplicación administrativa visualmente independiente. |
| 35 | Corregido en el texto contractual | El menú actual contiene Resumen, Catálogo, Pedidos, Internacional y Contenido. Diagnóstico fue eliminado por solicitud previa y no debe anunciarse como módulo disponible. |
| 36 | Cumple | Se muestran ingresos confirmados, pedidos, productos activos y solicitudes internacionales. |
| 37 | Cumple | El resumen incluye ingresos de los últimos seis meses y distribución de pagos. |
| 38 | Cumple | El administrador crea, edita y retira productos. |
| 39 | Cumple | El formulario administra nombre, categoría, precio, inventario, material, metal, pureza, piedra, grabado, medidas y descripción. |
| 40 | Cumple | Se puede marcar una pieza como Premium o destacada. |
| 41 | Corregido | El máximo quedó fijado en cuatro imágenes tanto en la interfaz como en la validación del servidor. Un intento con cinco imágenes es rechazado. |
| 42 | Cumple | Cloudflare R2 está configurado y reporta acceso público operativo para las imágenes subidas. |
| 43 | Cumple | El panel permite buscar y filtrar productos; cada fila muestra precio, stock y cantidad de imágenes. |
| 44 | Cumple | El resumen y el catálogo identifican productos agotados o con una sola unidad. |
| 45 | Cumple | Pedidos dispone de búsqueda, filtro por estado y paginación. |
| 46 | Cumple | El detalle muestra comprador, artículos, medidas, entrega, montos, inventario y pago. |
| 47 | Cumple | Se actualizan preparación, transportadora, guía y notas internas, respetando el flujo permitido. |
| 48 | Cumple | Contenido permite administrar portada, campaña, invitación Premium y portada Premium. |
| 49 | Cumple | El catálogo se descarga como `.xlsx` organizado en hojas de catálogo e imágenes. |
| 50 | Corregido | El módulo Diagnóstico ya no forma parte del panel. En su lugar se añadió una descarga de catálogo PDF con logo oficial, fotografías, precio, stock, descripción y medidas. |
| 51 | Cumple | Las solicitudes internacionales tienen bandeja independiente. |
| 52 | Cumple | Se consultan país, ciudad, dirección, productos y comprador. |
| 53 | Cumple | Se registran transportadora, costo estimado, plazo, condiciones y notas. |
| 54 | Cumple | La orden de pago internacional solo puede generarse después de marcar las condiciones como aceptadas. |
| 55 | Cumple | Bold se abre mediante Embedded Checkout dentro del flujo de compra. |
| 56 | Cumple y fue verificado en producción | El endpoint de salud informa `production_live`, `productionEnabled: true` y `live: true`. |
| 57 | Cumple | El servidor consulta el catálogo autoritativo y recalcula precios; no confía en montos enviados por el navegador. |
| 58 | Cumple | El servidor aplica 5 % a ventas nacionales y 6 % a internacionales. |
| 59 | Cumple | Bold recibe la configuración `vat-19` y la interfaz informa IVA del 19 % incluido. |
| 60 | Cumple | El comprador nacional elige recogida o domicilio. |
| 61 | Cumple | El domicilio nacional queda fuera del cobro Bold y se informa como pago al recibir. |
| 62 | Cumple | La compra internacional crea primero una solicitud de coordinación. |
| 63 | Cumple | La pantalla de resultado contempla aprobado, rechazado, anulado, pendiente, vencido y revisión. |
| 64 | Cumple | El webhook de Bold recibe y procesa confirmaciones automáticamente. |
| 65 | Cumple con precisión de redacción | El inventario se reserva al crear la orden para evitar sobreventa y se confirma al aprobarse el pago. El resultado comercial es que una venta aprobada conserva descontadas sus unidades. |
| 66 | Cumple | Rechazo, anulación o vencimiento liberan una sola vez las unidades reservadas. |
| 67 | Cumple | Los eventos Bold tienen identificador único y no se procesan dos veces. |
| 68 | Cumple | La llave secreta permanece en variables del servidor y no se entrega al navegador. |
| 69 | Cumple | Catálogo, órdenes, eventos de pago, contenido y solicitudes internacionales usan PostgreSQL; las imágenes usan R2. |
| 70 | Cumple | `@vercel/analytics` se inyecta en compilaciones de producción. |
| 71 | Cumple | Pasaron 44 pruebas automatizadas, la prueba integral del panel, la descarga Excel/PDF y revisiones visuales en tres tamaños de pantalla. |
| 72 | Cumple al publicar esta auditoría | El proyecto y sus cambios se conservan en el repositorio GitHub configurado. |

## Acciones que corresponden al cliente

1. Elegir, comprar y facilitar acceso al dominio personalizado que desee usar.
2. Confirmar todos los precios e inventarios definitivos; revisar especialmente el producto que actualmente figura en $1.000 COP.
3. Actualizar la dirección o cualquier dato de la ficha de Google Business desde la cuenta propietaria, si desean modificarla.
4. Definir si la visualización 360 seguirá en alcance. Con el máximo actual de cuatro fotos, debe manejarse como un módulo separado y requerirá secuencias fotográficas específicas.
5. Entregar nuevas fotografías Premium o comerciales autorizadas cuando quieran activar esas portadas; actualmente esos espacios no usan imágenes generadas con IA.

## Redacción que debe actualizarse en el listado entregado al cliente

- Cláusula 35: retirar “Diagnóstico” y dejar “Resumen, Catálogo, Pedidos, Ventas internacionales y Contenido comercial”.
- Cláusula 41: indicar expresamente “hasta cuatro fotografías por producto”.
- Cláusula 50: reemplazar el diagnóstico por “descarga de catálogo en PDF y exportación editable a Excel”.
- Cláusula 65: aclarar que el inventario se reserva antes del pago y se confirma cuando Bold aprueba la venta.
