import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
// Si necesitas un sistema de caché más persistente para las IPs bloqueadas (opcional, para reinicios del servidor)
// import Redis from 'ioredis'; // o algún otro sistema de caché/store

// --- Configuración ---
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

if (!VERIFY_TOKEN) {
    console.error("❌ FATAL ERROR: VERIFY_TOKEN no está definido en el archivo .env");
    process.exit(1);
}

const app = express();
app.use(express.json());

const carritos = new Map();

// Implementación del setInterval para limpiar carritos (asegúrate de que solo se crea uno)
// Esto debería estar fuera de la ruta POST /webhook para que solo se ejecute una vez al iniciar el servidor.
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

// --- Almacenamiento para IPs que hemos detectado como agresivas ---
// Usaremos un Set en memoria. Si el servidor se reinicia, se pierde.
// Para persistencia, se usaría Redis o similar.
const aggressivelyBlockingIPs = new Set(); 

// --- Middleware de Rate Limiting ---
const webhookLimiter = rateLimit({
    windowMs: 60 * 1000, // Ventana de 1 minuto
    max: 10, // Máximo 100 solicitudes por IP
    message: {
        status: 429,
        message: "Tranquilo viejo, demasiadas solicitudes."
    },
    handler: (req, res, next, options) => {
        const ip = req.ip;
        // Solo avisamos en consola una vez por minuto por cada IP bloqueada
        if (!aggressivelyBlockingIPs.has(ip)) { 
            console.warn(`🚨 [ALERTA SPAM] IP bloqueada por exceso de intentos: ${ip}`);
            aggressivelyBlockingIPs.add(ip);
            setTimeout(() => { aggressivelyBlockingIPs.delete(ip); }, options.windowMs);
        }
        res.status(options.statusCode).send(options.message);
    }
});

// --- Rutas ---

// 1. Ruta de VERIFICACIÓN (GET /webhook)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK VERIFICADO');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// 2. Ruta de MENSAJES (POST /webhook) - Aplicamos el rate limiter AQUÍ
app.post('/webhook', webhookLimiter, (req, res) => {
    res.sendStatus(200); // Siempre responder OK rápido a Meta
    const body = req.body;

    try {
        if (body.object === 'whatsapp_business_account') {
            const mensaje = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
            
            if (mensaje?.type === 'text') {
                const textoBuscado = mensaje.text.body;
                const telefono = mensaje.from; 
                
                // Si el cliente es nuevo, creamos su carrito
                if (!carritos.has(telefono)) {
                    carritos.set(telefono, { pedidos: [], ultimaActividad: Date.now() });
                    console.log(`🛒 Nuevo cliente: ${telefono}`);
                }

                let carritoDelCliente = carritos.get(telefono);

                // Por ahora guardamos el texto crudo. (Aquí entrará Ollama luego)
                carritoDelCliente.pedidos.push(textoBuscado);
                carritoDelCliente.ultimaActividad = Date.now(); // Reseteamos el contador de inactividad

                carritos.set(telefono, carritoDelCliente);
                console.log(`📦 Carrito de ${telefono}:`, carritos.get(telefono).pedidos);
            }
        }
    } catch (error) {
        console.error("❌ Error desempaquetando mensaje:", error);
    }
});


app.listen(PORT, () => {    
    console.log(`Servidor del bot corriendo en el puerto ${PORT}`);
    // Asegúrate de que el cleanup interval se inicia correctamente
    // startCleanupInterval(); // Ya se llama arriba
});
