import express from "express";
import { enviarMensaje, enviarBotones } from "../services/whatsappServices.mjs";
import { extraerPedidoConIA } from "../services/iaServices.mjs";
import { enviarPedidoASheets } from "../services/sheetsServices.mjs";

let cleanupInterval = null;
function startCleanupInterval() {
  if (cleanupInterval) return; // Ya está corriendo
  cleanupInterval = setInterval(() => {
    const ahora = Date.now();
    let deletedCount = 0;
    for (let [telefono, carrito] of carritos.entries()) {
      if (ahora - carrito.ultimaActividad > 1800000) {
        // 30 minutos
        carritos.delete(telefono);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(
        `🧹 Eliminados ${deletedCount} carritos abandonados de la RAM.`,
      );
    }
  }, 3600000); // Cada hora
}
startCleanupInterval();

const router = express.Router();

// Nuestra base de datos temporal (mudada aquí)
const carritos = new Map();

// Ruta de verificación (GET)
router.get("/", (req, res) => {
  const {
    "hub.mode": mode,
    "hub.verify_token": token,
    "hub.challenge": challenge,
  } = req.query;
  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN)
    res.status(200).send(challenge);
  else res.sendStatus(403);
});

// Ruta de recepción de mensajes (POST)
router.post("/", async (req, res) => {
  res.sendStatus(200);
  const body = req.body;

  try {
    if (body.object === "whatsapp_business_account") {
      const mensaje = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (mensaje?.type === "text") {
        const textoBuscado = mensaje.text.body;
        const telefono = mensaje.from;

        if (!carritos.has(telefono)) {
          carritos.set(telefono, { pedidos: [], ultimaActividad: Date.now() });
          const misBotones = [
            { id: "btn_menu", title: "🍕 Ver Menú" },
            { id: "btn_horario", title: "🕒 Horarios" },
          ];
          await enviarBotones(
            telefono,
            "¡Hola! Bienvenido a la Pizzería. ¿En qué te ayudo?",
            misBotones,
          );
          return;
        }

        // Extraemos el carrito actual
        let carrito = carritos.get(telefono);

        // MAGIA: Procesamos el texto con una IA
        const itemsDetectados = await extraerPedidoConIA(textoBuscado);

        if (itemsDetectados.length > 0) {
          // Si la IA encontró comida, la sumamos al carrito
          carrito.pedidos.push(...itemsDetectados);
          carrito.ultimaActividad = Date.now();
          carritos.set(telefono, carrito); // Guardamos la actualización

          console.log(`✅ IA extrajo:`, itemsDetectados);

          const botonesPedido = [
            { id: "btn_confirmar", title: "✅ Enviar Pedido" },
          ];
          await enviarBotones(
            telefono,
            `¡Anotado! Llevas ${carrito.pedidos.length} productos. Si ya terminaste, presiona Enviar Pedido.`,
            botonesPedido
          );
        } else {
          await enviarMensaje(
            telefono,
            "No detecté qué productos deseas pedir. ¿Puedes ser un poco más específico?",
          );
        }
      } else if (mensaje?.type === "interactive") {
        // Extraemos el ID oculto del botón que programamos arriba
        const botonId = mensaje.interactive.button_reply.id;

        console.log(`👆 El cliente ${telefono} tocó el botón: ${botonId}`);

        if (botonId === "btn_menu") {
          const urlMenuPDF =
            "https://tu-servidor-o-drive.com/menu_pizzeria.pdf";

          await enviarDocumento(
            telefono,
            urlMenuPDF,
            "Menu_Pizzeria.pdf",
            "🍕 ¡Aquí tienes nuestro menú completo en PDF! Escribe tu pedido cuando estés listo.",
          );
        } else if (botonId === "btn_horario") {
          await enviarMensaje(
            telefono,
            "Atendemos de Lunes a Sábado de 18:00 a 23:00.",
          );
        }else if (botonId === "btn_confirmar") {
          // 2. MAGIA DE SHEETS: Mandamos la orden a la cocina
          const resumenPedido = carrito.pedidos.join(", "); 
          await enviarPedidoASheets(telefono, resumenPedido);
          
          await enviarMensaje(telefono, "👨‍🍳 ¡Tu pedido ha sido enviado a la cocina! Te avisaremos cuando esté listo.");
          
          // Limpiamos el carrito de la memoria
          carritos.delete(telefono);
        }
      }
    }
  } catch (error) {
    console.error("Error procesando mensaje:", error);
  }
});

export default router;
