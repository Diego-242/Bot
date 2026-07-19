import express from 'express';
import { enviarMensaje } from '../services/whatsappServices.mjs';
import { extraerPedidoConIA } from '../services/iaServices.mjs';

let cleanupInterval = null;
function startCleanupInterval() {
    if (cleanupInterval) return; // Ya está corriendo
    cleanupInterval = setInterval(() => {
        const ahora = Date.now();
        let deletedCount = 0;
        for (let [telefono, carrito] of carritos.entries()) {
            if (ahora - carrito.ultimaActividad > 1800000) { // 30 minutos
                carritos.delete(telefono);
                deletedCount++;
            }
        }
        if (deletedCount > 0) {
            console.log(`🧹 Eliminados ${deletedCount} carritos abandonados de la RAM.`);
        }
    }, 3600000); // Cada hora
}
startCleanupInterval();

const router = express.Router();

// Nuestra base de datos temporal (mudada aquí)
const carritos = new Map();

// Ruta de verificación (GET)
router.get('/', (req, res) => {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) res.status(200).send(challenge);
    else res.sendStatus(403);
});

// Ruta de recepción de mensajes (POST)
router.post('/', async (req, res) => {
    res.sendStatus(200); 
    const body = req.body;

    try {
        if (body.object === 'whatsapp_business_account') {
            const mensaje = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
            
            if (mensaje?.type === 'text') {
                const textoBuscado = mensaje.text.body;
                const telefono = mensaje.from; 
                
                if (!carritos.has(telefono)) {
                    carritos.set(telefono, { pedidos: [], ultimaActividad: Date.now() });
                    await enviarMensaje(telefono, "¡Hola! Bienvenido a la Pizzería. ¿Qué te gustaría pedir hoy?");
                }

                // Extraemos el carrito actual
                let carrito = carritos.get(telefono);
                
                // MAGIA: Procesamos el texto con Ollama
                const itemsDetectados = await extraerPedidoConIA(textoBuscado);
                
                if (itemsDetectados.length > 0) {
                    // Si Ollama encontró comida, la sumamos al carrito
                    carrito.pedidos.push(...itemsDetectados);
                    carrito.ultimaActividad = Date.now();
                    carritos.set(telefono, carrito); // Guardamos la actualización
                    
                    console.log(`✅ IA extrajo:`, itemsDetectados);
                    
                    await enviarMensaje(telefono, `¡Anotado! Llevas ${carrito.pedidos.length} productos en tu lista. ¿Deseas agregar algo más o cerramos tu pedido?`);
                } else {
                    // Si Ollama devolvió [] (era un saludo o una pregunta)
                    await enviarMensaje(telefono, "No detecté qué productos deseas pedir. ¿Puedes ser un poco más específico?");
                }
            }
        }
    } catch (error) {
        console.error("Error procesando mensaje:", error);
    }
});

export default router;