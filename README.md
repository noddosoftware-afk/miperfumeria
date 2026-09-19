# miperfumeria — maquetado del sitio

Maquetado completo y navegable de la tienda en línea, construido con la misma
estructura que usa El Palacio de Hierro en su sitio: barra de avisos rotativa,
cintillo de servicios, header con logo centrado y buscador, mega-menú por
categoría, carruseles de producto, cintillos editoriales, franja de servicio,
newsletter y footer en columnas (acordeón en móvil).

No hay base de datos ni pasarela de pago: el objetivo es que el cliente vea y
recorra cómo se va a sentir su sitio terminado.

## Cómo verlo

Abre `index.html` con doble clic. Funciona sin servidor.

Si prefieres servirlo en local:

```bash
cd miperfumeria && python3 -m http.server 8899
```

Luego abre http://localhost:8899

## Páginas incluidas

| Archivo | Qué es |
|---|---|
| `index.html` | Home: carrusel, más vendidos, categorías, editoriales, ofertas, newsletter |
| `catalogo.html` | Listado con filtros (género, familia, marca, precio), orden y búsqueda |
| `producto.html` | Ficha: galería, notas olfativas, presentaciones, acordeones, relacionados |
| `carrito.html` | Bolsa completa con resumen y sugerencias |
| `checkout.html` | Cuenta de transferencia, resumen de productos y envío de comprobante por WhatsApp |
| `mayoreo.html` | Tabla de inventario con tres precios, condiciones y solicitud de lista |
| `autenticidad.html` | Garantía de originalidad, quiénes somos y guía para elegir perfume |
| `ayuda.html` | Envíos, pagos, rastreo, preguntas frecuentes, devoluciones, legales |
| `contacto.html` | Canales de contacto y formulario |
| `cuenta.html` | Acceso a la bolsa, atención por WhatsApp y demostración del panel |
| `admin.html` | Inventario, pedidos, pagos, agenda, clientes y resumen de ventas |

## Lo que sí funciona en la demo

- Navegación completa entre todas las páginas y el mega-menú.
- Buscador: filtra el catálogo por marca, nombre y notas.
- Filtros, orden y etiquetas activas en el catálogo.
- Bolsa de compra real (se guarda en el navegador): agregar, cambiar cantidad,
  eliminar, barra de progreso de envío gratis y aviso de precio de mayoreo.
- Precios de mayoreo a partir de $4,000 de compra calculada a precio normal; límites de cantidad para el inventario confirmado.
- Botones de WhatsApp en catálogo, ficha, bolsa y panel de bolsa, con producto, presentación, cantidad y precios.
- Vista de transferencia para un producto o toda la bolsa. Los campos bancarios quedan en blanco por indicación del cliente.
- Carruseles, acordeones, menú móvil y diseño responsivo.

## Lo que está simulado

- Los formularios muestran un aviso y no envían nada.
- La compra se coordina por WhatsApp. Los enlaces preparan un mensaje; el visitante decide enviarlo y adjuntar su comprobante. El sitio no cobra ni verifica pagos.
- Instagram y TikTok usan los perfiles del negocio. Facebook se retiró.
- No hay confirmación automática de pedidos ni de pagos al abrir WhatsApp. El dueño registra la venta manualmente en el panel de demostración.

## Qué hay que reemplazar antes de publicar

Todo lo editable vive en **`assets/js/data.js`**:

1. **`TIENDA`** (al final del archivo): número de WhatsApp, correo, monto de
   mayoreo y piezas para envío gratis. `TIENDA.transferencia` recibe banco, beneficiario, cuenta y tipo de identificador cuando el dueño los proporcione. El botón de copiar cuenta aparece cuando esos datos estén completos.
2. **`PRODUCTOS`**: 11 productos tienen los 33 precios y las 26 unidades
   proporcionadas por el cliente. Se identifican con `datosDemo: false`.
   Los otros 27 productos conservan los datos de demostración del catálogo anterior.
   El inventario confirmado también está en `docs/inventario-confirmado.json`.
3. **Imágenes**: 38 imágenes de producto y 6 editoriales generadas con IA,
   guardadas localmente en WebP dentro de `assets/img/`. Son ilustrativas,
   no fotografías oficiales. Para sustituir una imagen, reemplaza su archivo
   o modifica `imagen` en el producto. Los prompts y archivos de origen están
   en `docs/image-manifest.json`. Se utilizó la herramienta integrada de generación
   de imágenes y Sharp para optimizar los archivos.
4. **Logotipo**: hoy se reconstruye en SVG dentro de `assets/js/layout.js`
   (función `logoSVG`). Si nos pasan el archivo vectorial original, se cambia
   ahí en un solo lugar.

Los textos legales (términos, aviso de privacidad, devoluciones) son un borrador
de referencia y los debe revisar el negocio.

## Paleta y tipografía

- Azul marino `#101C3A`, negro `#0A0F1C`, blanco y grises.
- Rojo `#9B1B30` únicamente para marcar descuentos.
- Playfair Display (títulos en itálicas), Montserrat (logotipo y etiquetas),
  Inter (texto).

## Estructura de archivos

```
miperfumeria/
├── index.html · catalogo.html · producto.html · carrito.html · checkout.html
├── mayoreo.html · autenticidad.html · ayuda.html · contacto.html · cuenta.html
└── assets/
    ├── css/styles.css   → todo el diseño
    ├── img/            → imágenes de productos y editoriales en WebP
    └── js/
        ├── data.js      → catálogo, datos del negocio e ilustraciones
        ├── layout.js    → header, navegación, footer, iconos, logotipo
        └── app.js       → carrito, filtros, carruseles e interacciones
```


## Panel y entrega (actualización del 18 de septiembre de 2026)

Abre `admin.html`. Es un panel de demostración sin autenticación ni conexión a servicios.
Los pedidos y clientes iniciales son ficticios y están identificados como ejemplos.
Sus ventas sirven para ilustrar los indicadores y no descuentan el inventario inicial.

- Editar y agregar productos, cargar una imagen local de hasta 1 MB y modificar tres precios y stock.
- Registrar un pedido con varios productos, canal de venta, destinatario y dirección; al guardar se descuentan unidades del inventario local. Los pedidos pendientes también descuentan disponibilidad en esta demo. La regla definitiva de apartados debe acordarse con el dueño.
- Revisar pagos, asignar repartidor o paquetería, capturar guía y confirmar fecha y horario.
- Consultar clientes, productos vendidos con cobro confirmado y alertas de dos unidades o menos.
- Copiar un mensaje de agradecimiento o de seguimiento desde el detalle del pedido. No se envía automáticamente.

Las ediciones del catálogo se guardan en `mp_catalog_edits` y los pedidos en `mp_admin_orders` de localStorage. Al recargar la tienda en el mismo navegador y origen, toma las ediciones del catálogo. No existe sincronización entre dispositivos. No utilizar este panel público de demostración para guardar información real de clientes.

El comprador puede indicar modalidad, dirección, persona que recibe y horario solicitado. Las preferencias duran la sesión del navegador (`mp_delivery` en sessionStorage) y se incluyen en el mensaje de WhatsApp. Para entrega personal, el costo y el horario quedan pendientes de confirmación. Para paquetería se mantiene $199 y gratis desde 3 piezas. Abrir WhatsApp no registra un pedido ni descuenta stock.

Pendientes para producción: cuenta bancaria; cobertura, costo y horarios de entrega personal; regla de apartados; requisitos de distribuidor; política unificada de cambios/reembolsos/saldo; dominio, acceso privado y almacenamiento compartido. Se conserva el logo actual. No se incluyeron claves de API, dirección de recolección ni correo privado del administrador en el sitio.
