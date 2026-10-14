# Bot WhatsApp · Recepción de pedidos

Bot de WhatsApp para negocios que reciben pedidos por chat. Recibe mensajes a través de la
WhatsApp Business Platform (Meta), interpreta el pedido con IA, lo arma en un carrito temporal y,
al confirmarlo, lo registra en una hoja de Google Sheets a modo de cola de cocina.

El objetivo del producto es automatizar la recepción y organización de pedidos para que el negocio
no pierda clientes por demorar en responder. La visión completa está en
[`docs/01-Vision-y-Requisitos.md`](docs/01-Vision-y-Requisitos.md).

> **Estado:** MVP funcional / prototipo avanzado. El flujo de punta a punta
> (mensaje → IA → carrito → confirmación → Sheets) ya funciona de forma local.

---

## Características implementadas

- **Servidor webhook Express** para la WhatsApp Cloud API.
- **Verificación del webhook** (GET `hub.challenge`) contra `VERIFY_TOKEN`.
- **Rate limiting** por IP en las rutas públicas (10 req/min) con alerta de spam en consola.
- **Mensajes de texto entrantes**: identificación del cliente y creación de su carrito.
- **Mensajes interactivos (botones)**: bienvenida con opciones *Ver Menú* y *Horarios*, y botón
  *Enviar Pedido* para confirmar.
- **Extracción de pedidos con IA**: usa Gemini (`gemini-2.5-flash-lite`) con un prompt defensivo y
  salida JSON estricta (`item`, `cantidad`, `notas`). Detecta varios productos, cantidades y
  modificaciones (tamaño, sabor, extras, etc.).
- **Normalización de pedidos** para descartar entradas inválidas antes de guardarlas.
- **Carrito en memoria** (`Map`) por número de teléfono, con limpieza automática de carritos
  abandonados (más de 30 min) mediante tarea periódica.
- **Confirmación de pedido**: al tocar *Enviar Pedido* se envía el resumen a Google Sheets y se
  limpia el carrito.
- **Envío de mensajes**: texto, botones interactivos y documentos (PDF del menú).

## Arquitectura del flujo

```
Cliente WhatsApp
      │  (mensaje)
      ▼
Meta Cloud API  ──► POST /webhook ──► routes/webhookRoutes.mjs
      │                                     │
      │                                     ├─► services/iaServices.mjs      (Gemini: extrae el pedido)
      │                                     ├─► carrito en memoria (Map, por teléfono)
      │                                     └─► services/sheetsServices.mjs  (guarda el pedido)
      │
      ▼
services/whatsappServices.mjs ──► Meta Cloud API (respuestas: texto, botones, PDF)
```

## Estructura del proyecto

```
.
├── index.mjs                     # Arranque del servidor Express, rate limiting y montaje de rutas
├── routes/
│   └── webhookRoutes.mjs         # Verificación y recepción de mensajes de WhatsApp
├── services/
│   ├── iaServices.mjs            # Extracción del pedido con Gemini (JSON estructurado)
│   ├── sheetsServices.mjs        # Persistencia del pedido en Google Sheets
│   └── whatsappServices.mjs      # Envío de mensajes, botones y documentos a Meta
├── Pruebas/                      # Scripts de prueba (rate limit, Sheets, etc.)
├── docs/                         # Documentación de producto y casos de uso
├── .env                          # Variables de entorno (NO se versiona)
├── credentials.json              # Service account de Google (NO se versiona)
└── package.json
```

## Tecnologías

| Área            | Tecnología                          |
| --------------- | ----------------------------------- |
| Runtime         | Node.js (ES Modules `.mjs`)         |
| Servidor        | Express 5                           |
| Canal           | WhatsApp Business Platform (Meta)   |
| IA              | Google Gemini API (`gemini-2.5-flash-lite`) |
| Persistencia    | Google Sheets (`googleapis`)        |
| Seguridad       | `express-rate-limit`, `dotenv`      |
| Desarrollo      | `nodemon`                           |

## Requisitos previos

- Node.js 18 o superior (usa `fetch` nativo).
- Una app de WhatsApp Business en Meta con `WHATSAPP_TOKEN` y `PHONE_NUMBER_ID`.
- Un proyecto de Google Cloud con la API de Sheets habilitada y un service account
  (`credentials.json`) con acceso a la hoja.
- Una `GEMINI_API_KEY` de Google AI Studio.

## Variables de entorno

Crea un archivo `.env` en la raíz con:

```env
PORT=3000
VERIFY_TOKEN=token_que_eliges_para_verificar_el_webhook
WHATSAPP_TOKEN=token_de_la_whatsapp_cloud_api
PHONE_NUMBER_ID=id_del_numero_de_whatsapp
GEMINI_API_KEY=api_key_de_google_ai
SHEETS_ID=id_de_la_hoja_de_google
```

| Variable          | Para qué sirve                                          |
| ----------------- | ------------------------------------------------------- |
| `PORT`            | Puerto del servidor (por defecto `3000`).               |
| `VERIFY_TOKEN`    | Valida el webhook en la verificación de Meta.           |
| `WHATSAPP_TOKEN`  | Bearer para enviar mensajes a la Graph API.             |
| `PHONE_NUMBER_ID` | Número emisor de WhatsApp.                              |
| `GEMINI_API_KEY`  | Acceso a la API de Gemini.                              |
| `SHEETS_ID`       | Hoja de cálculo donde se registran los pedidos.         |

`credentials.json` (service account de Google) debe colocarse en la raíz del proyecto.

## Instalación y ejecución

```bash
npm install
npm run dev
```

El servidor queda escuchando en `http://localhost:3000`.

## Endpoints

| Método | Ruta       | Descripción                                            |
| ------ | ---------- | ------------------------------------------------------ |
| GET    | `/`        | Health check: confirma que el servidor está activo.    |
| GET    | `/webhook` | Verificación del webhook con Meta (`hub.challenge`).   |
| POST   | `/webhook` | Recepción de mensajes (texto e interactivos/botones).  |

## Pruebas

En `Pruebas/` hay scripts de apoyo para probar partes sueltas del sistema (límite de peticiones,
integración con Sheets, etc.). No forman parte del flujo de producción.

## Documentación

- [01 · Visión y Requisitos](docs/01-Vision-y-Requisitos.md) — visión, alcance, requisitos
  funcionales/no funcionales, historias de usuario y criterios de aceptación.
- [02 · Casos de Uso y Flujos](docs/02-Casos-de-Uso-y-Flujos.md) — actores, casos de uso, flujos
  principales y excepciones.

## Roadmap / pendientes

- [ ] Normalizar de forma definitiva la salida del servicio de IA.
- [ ] Resolver el **multi-negocio (tenant)**: hoy el menú, la bienvenida y el destino de Sheets
      están fijos en el código.
- [ ] Definir costos operativos (mensajería de Meta, IA, infraestructura).
- [ ] Revisar el retorno del POST del webhook (ver si hace falta responder algo más).
- [ ] Evolucionar el esquema del pedido hacia `{ item, cantidad, tamaño, modificaciones }`.
- [ ] Manejar varios clientes/pedidos simultáneos y persistencia real (sacar el carrito de la RAM).

## Notas de seguridad

- `.env` y `credentials.json` **nunca** deben subirse al repositorio.
- Cualquier token que se haya expuesto en el código de pruebas debe **revocarse** en el panel de
  Meta.
