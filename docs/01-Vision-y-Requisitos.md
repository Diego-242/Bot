# 01 - Vision y Requisitos - V1.3 Revision de Requisitos y Objetivos

---

## 01. Visión del producto

El sistema es un SaaS diseñado para automatizar la recepción y organización de pedidos a través de WhatsApp. Su alcance se limita a la gestión del flujo del pedido (recepción, encolamiento y despacho) y la exportación de datos en formato plano (CSV/Excel). El sistema delega expresamente la facturación electrónica, el procesamiento de pagos y la contabilidad a sistemas externos o gestión manual.

El sistema no guarda una base de datos de clientes ni ofrece fidelización o marketing: solo automatiza el pedido.

## 02. Problema

Los negocios que reciben pedidos a domicilio por WhatsApp tardan en contestar, sobre todo en horas pico. Esa espera genera descontento con el servicio y hace que el cliente migre a la competencia. Además, la falta de recursos visuales deja al negocio atrasado frente a la competencia, que ya ofrece chatbots con mejor organización y mayor velocidad. `[POR VALIDAR]`

**Problemas a validar con negocios reales:**

- Demora en responder en horas pico, con pérdida de pedidos.
- Se repite a mano el menú y los precios a cada cliente.
- Pedidos anotados a mano dentro del chat: errores, olvidos y desorden en la cola.
- Los clientes preguntan una y otra vez por el estado de su pedido.
- Falta de fotos o menú visual.

**Cómo se plantea validarlo:** entrevistas de unos 20 minutos a 5 a 8 negocios de Cuenca, y revisar con su permiso un chat de una tarde pico (mensajes sin respuesta tras 5 minutos, pedidos por día). Los datos de mercado, canal y competencia están en el archivo **Anexo A - Estudio de Mercado**.

## 03. Objetivos

Automatizar la interacción del cliente con el dueño del local y de esa manera evitar perder clientes por la demora al contestar los mensajes, y garantizar que las dos partes logren su objetivo sin perjudicar a nadie.

Proporcionar recursos visuales del negocio a los consumidores para resolver sus dudas.

- Tiempo de primera respuesta al cliente.
- Porcentaje de conversaciones que terminan en pedido, y pedidos perdidos por demora.
- Porcentaje de productos con imagen.
- Costo mensual por negocio frente al precio de suscripción. Tope: `[DECISIÓN PENDIENTE]`

## 04. Stakeholders

**Interno**

Yo como Dueño de Negocio: lanzar lo más pronto posible el SaaS con la menor inversión posible garantizando un buen funcionamiento.

Yo como Desarrollador: garantizar que el código sea lo más limpio y lo más eficiente evitando caídas en el mismo.

**Externo**

**El Usuario / Comprador Inicial (Early Adopter):** es el stakeholder externo más crítico. Es la persona que tiene el problema *hoy*, que está frustrada y que está dispuesta a pagar por una solución aunque el software sea feo o tenga errores al principio. Escuchar a este grupo es lo que le dará forma a los requerimientos.

Persona concreta: dueño o administrador de un negocio de comida a domicilio con 1 a 5 empleados que ya recibe pedidos por WhatsApp. `[POR VALIDAR]`

**Competidores:** indirectamente influyen en el proyecto. Lo que ellos hacen (o dejan de hacer) define las expectativas de los usuarios.

Otros stakeholders:

- **Cliente final:** quien escribe por WhatsApp para pedir.
- **Operador:** persona del negocio que atiende cuando el bot hace traspaso.
- **Meta (WhatsApp):** controla el canal, los precios y las políticas.
- **Proveedor de IA (por ejemplo Gemini):** solo si se usa un modelo de lenguaje; recibe el texto de los mensajes.

## 05. Alcance

### 5.1 Incluido

- Recibir, interpretar y responder mensajes de texto por WhatsApp.
- Toma de pedido guiada: ítems, cantidades, notas, domicilio o retiro, dirección si es domicilio, confirmar o cancelar.
- Catálogo de productos con estado Disponible / Agotado e imagen opcional.
- Turno secuencial por pedido, estados del pedido y consulta de estado.
- Panel web con pedidos en tiempo casi real, productos y estadísticas agregadas.
- Traspaso a operador humano.
- Exportación en CSV/Excel.
- Borrado automático de los datos personales del pedido pasado el período de retención.

### 5.2 Excluido

- Facturación electrónica, procesamiento de pagos y contabilidad (solo se anota la forma de pago que el cliente dice; no se cobra).
- **(cambio)** Base de datos de clientes, historial por cliente, fidelización y marketing.
- Gestión de repartidores o rutas, inventario avanzado y punto de venta.
- Mensajes entrantes de audio, imagen o ubicación en V1 (el bot pide que escriban). `[DECISIÓN PENDIENTE]`
- Otros canales distintos de WhatsApp.

## 06. Supuestos y restricciones

### Supuestos

En V1.1 el supuesto era "aumentar las ventas en un mínimo de 30 % - 40 %". Eso es una meta a medir después del piloto, no un supuesto, y no se le promete al negocio. Supuestos ahora:

- Los negocios objetivo ya reciben una parte importante de sus pedidos por WhatsApp. `[POR VALIDAR]`
- Los dueños pagarían una suscripción mensual por automatizar los pedidos. `[POR VALIDAR]`
- Los clientes finales aceptan pedir con un bot si pueden pasar a una persona. `[POR VALIDAR]`
- Se usa el canal oficial de WhatsApp (WhatsApp Business Platform). `[DECISIÓN PENDIENTE]`
- El negocio ya tiene sus propios sistemas de facturación, cobro y entrega.

### Restricciones

- El SaaS no se encarga de gestionar todo el negocio contable, ventas, productos ni marketing: eso se delega a personal o instrumentos externos. Es un medio que conecta con el sistema que el PROPIO negocio posea.
- El sistema no guarda base de clientes. Solo guarda los datos mínimos del pedido (número de WhatsApp para responder, nombre opcional, dirección o retiro, ítems y notas), con retención limitada.
- Solo WhatsApp y, en V1, solo texto.
- Una sola persona desarrolladora y presupuesto mínimo.
- Cumplir la Ley Orgánica de Protección de Datos Personales de Ecuador y los términos de WhatsApp Business Platform.
- Desligarse de cualquier actividad legal o económica que se vea involucrada en el negocio, o de la adición de nuevo personal: el negocio responde por sus obligaciones. Se formaliza en Términos de Servicio.

<aside>
⚠️

**Nota legal:** aunque no exista base de clientes, el sistema sigue tratando datos personales mientras dura el pedido (número, nombre, dirección). Quitar la base de clientes reduce la mayor parte del riesgo, pero no todo, y el desligue por contrato no elimina las obligaciones propias del SaaS. Términos de Servicio y aviso de privacidad: revisarlos con un abogado. `[DECISIÓN PENDIENTE]`

</aside>

### Dependencias externas (nuevo)

- **Precios de Meta:** según la documentación consultada, desde el 1-oct-2026 las respuestas libres dentro de la ventana de 24 h pasan a ser facturables, con 1.000 mensajes de servicio gratis por mes y por número. Un bot de pedidos envía varios mensajes por pedido, así que esto entra en el modelo de costos. Verificar en la página oficial de Meta antes de fijar precios. `[POR VALIDAR]`
- **Proveedor de IA:** costo por uso y envío del texto de los mensajes a un tercero (si se usa).

## 07. Requisitos funcionales

- **RF01 :** El sistema debe recibir, interpretar y responder mensajes de texto de los clientes en tiempo real a través de WhatsApp. **(cambio)** En V1 solo texto: ante audio, imagen o ubicación pide que escriban.
- **RF02 :**  El sistema debe atender a múltiples negocios, cada uno con su catálogo y sus pedidos aislados. *(Antes: "Manejar múltiples clientes y almacenarlos en una base de datos para su documentación": se quita por la decisión de no guardar clientes.)*
- **RF03 :** El administrador podrá consultar estadísticas, pedidos y productos desde un panel web. Sin "clientes": las estadísticas son agregadas, sin datos personales.
- **RF04 :** El administrador debe poder crear, editar, visualizar y deshabilitar los productos de su catálogo.
- **RF05 :** El sistema debe permitir transferir la conversación a un operador humano en caso de que el flujo automatizado no reconozca la intención del cliente.
- **RF06 :** Toma de pedido guiada: armar el pedido (ítems, cantidades, notas), elegir domicilio o retiro, pedir dirección solo si es domicilio, mostrar resumen con total y pedir confirmación o cancelación.
- **RF07 :** Cada pedido tiene un estado: Confirmado → En preparación → Listo / En camino → Entregado, o Cancelado. `[DECISIÓN PENDIENTE]`
- **RF08 :** Número de turno secuencial por negocio, sin repetirse.
- **RF09 :** Avisar al cliente los cambios de estado y responder consultas de estado.
- **RF10 :** Enviar imágenes de productos o del menú al cliente.
- **RF11 :** Exportar pedidos por rango de fechas en CSV/Excel.
- **RF12 :** Eliminar o anonimizar los datos personales de un pedido al terminar el período de retención, y permitir al administrador eliminarlos a solicitud del cliente. Período: `[DECISIÓN PENDIENTE]`

## 08. Requisitos no funcionales

- **RNF01 :** El backend debe implementar aislamiento lógico de datos; las consultas a la base de datos deben incluir siempre el identificador del negocio (`tenant_id`) para evitar la filtración de estados entre clientes.
- **RNF02 (Rendimiento Web):** El panel administrativo, construido mediante componentes de Astro, debe presentar un tiempo de carga inicial (LCP) inferior a 1.5 segundos. **(cambio)** `[PROVISIONAL]` hasta medirlo. Astro y las demás tecnologías van en Arquitectura y en los ADR.
- **RNF03 (Disponibilidad y Concurrencia):** El webhook de recepción debe ser capaz de encolar y procesar hasta 50 mensajes simultáneos sin pérdida de datos en el servidor Express. **(cambio)** `[PROVISIONAL]`: 50 probablemente supera lo que recibe un negocio pequeño. Lo crítico es no perder ni procesar dos veces un mensaje, porque Meta reintenta los webhooks.
- **RNF04 (Persistencia):** Las consultas de lectura de catálogo gestionadas a través del ORM (como Prisma) sobre la base de datos SQLite deben resolverse en menos de 200ms. **(cambio)** `[PROVISIONAL]`
- **RNF05 (Privacidad):** Solo se guardan datos mínimos del pedido, sin perfiles ni historial por cliente; se purgan al terminar la retención (respaldos incluidos); los registros técnicos (logs) no guardan mensajes ni datos personales.
- **RNF06 (Canal):** Usar solo el canal oficial de WhatsApp Business Platform y mantener el bot acotado a atender pedidos del negocio.
- **RNF07 (Costo):** El costo mensual por negocio (infraestructura, mensajería de Meta e IA) no supera un tope. `[DECISIÓN PENDIENTE]`

## 09. Historias de usuario

**Épica 1: Gestión de Inventario y Catálogo**

- **Historia 1.1:** Como administrador, quiero crear productos con nombre y precio para que estén disponibles en las respuestas del bot.
- **Historia 1.2:** Como administrador, quiero cambiar el estado de un producto a "Agotado" para que el bot deje de ofrecerlo temporalmente sin tener que borrarlo del sistema.
- **Historia 1.3 :** Como administrador, quiero asociar una imagen a cada producto para que el bot pueda mostrarla al cliente.

**Épica 2: Flujo Automatizado de Mensajería**

- **Historia 2.1:** Como cliente, quiero escribir "Menú" y recibir un mensaje con la lista de productos disponibles al instante.
- **Historia 2.2:** Como administrador, quiero que el sistema asigne automáticamente un número de turno a cada pedido confirmado para mantener el orden de llegada.
- **Historia 2.3 :** Como cliente, quiero indicar productos y cantidades, y si es a domicilio o retiro, para armar mi pedido escribiendo con naturalidad.
- **Historia 2.4 :** Como cliente, quiero ver un resumen con el total y confirmar o cancelar antes de enviar el pedido, para evitar errores.
- **Historia 2.5 :** Como cliente, quiero consultar el estado de mi pedido para no tener que llamar al negocio.
- **Historia 2.6 :** Como cliente, quiero hablar con una persona cuando el bot no me entiende.

**Épica 3: Monitoreo en Tiempo Real (Dashboard)**

- **Historia 3.1:** Como administrador, quiero ver una tabla en mi panel web que se actualice automáticamente con los pedidos nuevos.
- **Historia 3.2:** Como administrador, quiero un botón para marcar un pedido como "Entregado" y sacarlo de la cola de trabajo.
- **Historia 3.3 :** Como administrador, quiero exportar mis pedidos en CSV/Excel por rango de fechas.
- **Historia 3.4 :** Como administrador, quiero avanzar cada pedido por sus estados (En preparación, Listo, En camino).

**Épica 4 : Privacidad y Retención de Datos**

- **Historia 4.1:** Como administrador, quiero que los datos personales de los pedidos se borren automáticamente pasado el período de retención.
- **Historia 4.2:** Como administrador, quiero eliminar los datos personales de un pedido cuando el cliente lo pida.

## 10. Criterios de aceptación

**Épica 1: Gestión de Inventario y Catálogo**

**Historia 1.1: Crear productos (Nombre y Precio)**

- **Escenario 1: Creación exitosa**
    - **Dado** que estoy en el formulario de creación de productos.
    - **Cuando** ingreso un nombre válido (ej. "Pizza Pepperoni") y un precio mayor a cero (ej. "$10.00") y guardo.
    - **Entonces** el producto se almacena en la base de datos con el estado "Disponible".
    - **Y** se muestra un mensaje de éxito: *"Producto creado correctamente"*.
- **Escenario 2: Validación de campos obligatorios**
    - **Dado** que estoy en el mismo formulario.
    - **Cuando** intento guardar el producto dejando el nombre vacío o el precio en cero o negativo.
    - **Entonces** el sistema bloquea el guardado y muestra un error: *"El nombre y un precio válido son obligatorios"*.

**Historia 1.2: Cambiar estado a "Agotado"**

- **Escenario único: Producto agotado no se ofrece**
    - **Dado** que tengo un producto guardado y cambio su estado a "Agotado" en el panel.
    - **Cuando** un cliente interactúa con el bot de mensajería y solicita el catálogo.
    - **Entonces** el bot **no** debe incluir ese producto en la lista enviada al cliente.

**Historia 1.3 : Imagen de producto**

- **Escenario único:**
    - **Dado** que un producto tiene imagen.
    - **Cuando** el cliente pide ver ese producto.
    - **Entonces** el bot envía la imagen con nombre y precio; si no tiene imagen, responde solo con texto, sin error.

**Épica 2: Flujo Automatizado de Mensajería**

**Historia 2.1: Cliente escribe "Menú"**

- **Escenario 1: El bot responde con el menú actual**
    - **Dado** que un cliente abre el chat del bot.
    - **Cuando** el cliente envía "Menú" (o "menu" en minúsculas). **(cambio)** También variantes: mayúsculas, sin tilde, espacios extra o palabras como "carta".
    - **Entonces** el bot responde al instante **(cambio)** dentro del tiempo definido en los RNF, con un mensaje de texto que lista todos los productos que tienen estado "Disponible" con sus respectivos precios.
- **Escenario 2 : Mensaje no reconocido**
    - **Dado** que el cliente envía un texto que el bot no entiende.
    - **Cuando** vuelve a fallar tras pedir que reformule.
    - **Entonces** el bot hace el traspaso a humano (Historia 2.6).

**Historia 2.2: Asignación automática de número de turno**

- **Escenario 1: Generación de turno secuencial**
    - **Dado** que el último pedido confirmado en el sistema tuvo el turno **#14**.
    - **Cuando** un cliente nuevo confirma su pedido a través del bot.
    - **Entonces** el sistema registra el nuevo pedido asignándole automáticamente el turno **#15**.
    - **Y** el bot envía un mensaje al cliente confirmando su número de turno.
- **Escenario 2 : Confirmaciones simultáneas**
    - **Dado** que dos clientes confirman su pedido casi al mismo tiempo en el mismo negocio.
    - **Cuando** el sistema procesa ambas confirmaciones.
    - **Entonces** cada pedido recibe un turno distinto y consecutivo, sin duplicados. El reinicio del turno cada día: `[DECISIÓN PENDIENTE]`

**Historia 2.3 : Armar pedido**

- **Escenario 1: Pedido válido**
    - **Dado** que el cliente ya vio el menú.
    - **Cuando** escribe, por ejemplo, "2 pizzas pepperoni y 1 gaseosa".
    - **Entonces** el bot identifica productos y cantidades y muestra los ítems con el total.
- **Escenario 2: Producto inexistente o agotado**
    - **Dado** que el cliente pide un producto que no existe o está "Agotado".
    - **Cuando** el bot procesa el mensaje.
    - **Entonces** avisa que no está disponible, sugiere opciones del menú y **no** lo agrega.
- **Escenario 3: Domicilio o retiro**
    - **Dado** que el cliente ya eligió sus productos.
    - **Cuando** indica "a domicilio".
    - **Entonces** el bot pide la dirección; si indica "retiro", no la pide.

**Historia 2.4 : Confirmar o cancelar**

- **Escenario 1: Confirmación**
    - **Dado** que el bot mostró el resumen con el total.
    - **Cuando** el cliente confirma.
    - **Entonces** se crea el pedido con turno y el bot confirma el turno.
- **Escenario 2: Cancelación**
    - **Dado** que el bot mostró el resumen.
    - **Cuando** el cliente cancela.
    - **Entonces** no se crea ningún pedido y se descartan los datos temporales de la conversación.

**Historia 2.5 : Consultar estado**

- **Escenario único:**
    - **Dado** que el cliente tiene un pedido activo "En preparación".
    - **Cuando** escribe "estado" o "¿cómo va mi pedido?".
    - **Entonces** el bot responde con el estado actual y el turno.

**Historia 2.6 : Traspaso a humano**

- **Escenario único:**
    - **Dado** que el bot no entendió al cliente dos veces seguidas, o que el cliente escribe "hablar con una persona".
    - **Cuando** ocurre uno de los dos casos.
    - **Entonces** el bot avisa que una persona atenderá, marca la conversación como "requiere atención" en el panel y deja de responder en ella.

**Épica 3: Monitoreo en Tiempo Real (Dashboard)**

**Historia 3.1: Tabla que se actualiza sola (Dashboard)**

- **Escenario único: Actualización sin recargar la página**
    - **Dado** que tengo el panel web abierto en la pantalla de pedidos.
    - **Cuando** entra un pedido nuevo confirmado desde el bot de mensajería.
    - **Entonces** la tabla de la web debe mostrar el nuevo pedido al inicio de la lista en menos de 3 segundos `[PROVISIONAL]` **sin necesidad de que yo presione F5 o recargue la página**.

**Historia 3.2: Botón "Entregado" para sacar de la cola**

- **Escenario único: Completar pedido**
    - **Dado** que veo un pedido activo en la tabla del panel.
    - **Cuando** hago clic en el botón "Marcar como Entregado".
    - **Entonces** el estado del pedido cambia a "Entregado" en la base de datos.
    - **Y** el pedido desaparece visualmente de la tabla de pedidos pendientes/cola de trabajo.

**Historia 3.3 : Exportar**

- **Escenario único:**
    - **Dado** que existen pedidos en un rango de fechas.
    - **Cuando** selecciono el rango y pulso "Exportar".
    - **Entonces** descargo un CSV/Excel con los pedidos y sus ítems, por defecto sin datos personales del cliente. `[DECISIÓN PENDIENTE]`

**Historia 3.4 : Avanzar estados**

- **Escenario único:**
    - **Dado** que veo un pedido en "Confirmado".
    - **Cuando** lo paso a "En preparación".
    - **Entonces** el estado se actualiza en el panel y, si está activo el aviso al cliente y la ventana de 24 h sigue abierta, el bot le avisa.

**Épica 4 : Privacidad y Retención de Datos**

**Historia 4.1: Borrado automático**

- **Escenario único:**
    - **Dado** un pedido "Entregado" o "Cancelado" con más antigüedad que el período de retención.
    - **Cuando** corre la tarea de borrado.
    - **Entonces** se eliminan o anonimizan número, nombre y dirección, y se conservan solo datos anónimos (fecha, ítems, total, turno). Un pedido activo no se toca.

**Historia 4.2: Eliminar a solicitud del cliente**

- **Escenario único:**
    - **Dado** que un cliente pide que se eliminen sus datos.
    - **Cuando** el administrador elimina los datos personales de ese pedido.
    - **Entonces** los datos personales desaparecen y queda solo el registro anónimo.

---

## 11. Flujos principales

→ Documento **02 - Casos de Uso y Flujos**.

## 12. Casos excepcionales

→ Documento **02 - Casos de Uso y Flujos**.

## 13. Modelo conceptual

→ Documento **02** (o inicio del **03**).

## 14. Arquitectura

→ posteriormente (Documento **04 - Arquitectura del Sistema**).

## 15. Diseño de BD

→ documento separado (**03 - Diseño de Base de Datos**).

## 16. Roadmap V1 → V2 → V3

→ Documento **05 - Roadmap V1 → V2 → V3**.