import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';

// Token de verificacion del bot de WhatsApp (lo defines en el archivo .env)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

if (!VERIFY_TOKEN) {
    console.error("❌ FATAL ERROR: VERIFY_TOKEN no está definido en el archivo .env");
    process.exit(1); // El código 1 indica que el programa se cerró por un error
}

const app = express();
app.use(express.json());

// Map para almacenar los carritos de cada usuario (clave: teléfono, valor: array de pizzas)
const carritos = new Map();

const limitadorMeta = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 100, 
    message: "Tranquilo viejo, demasiadas peticiones",
    // El handler personaliza lo que pasa cuando alguien se pasa del límite
    handler: (req, res, next, options) => {
        // 1. Avisas en TU consola
        console.warn(`🚨 [ALERTA SPAM] IP bloqueada: ${req.ip}`); 
    
        // 2. Le devuelves el error 429 y el mensaje a la máquina que atacó
        res.status(options.statusCode).send(options.message); 
    }
});


// 1. RUTA DE VERIFICACIÓN (Meta hace un GET aquí una sola vez cuando configuras la app)
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

app.post('/webhook', limitadorMeta, (req, res) => {
    // 1. Responder siempre 200 OK lo antes posible a Meta
    res.sendStatus(200);

    const body = req.body;

    try {
        if (body.object === 'whatsapp_business_account') {
            const mensaje = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
            
            if (mensaje?.type === 'text') {
                const textoBuscado = mensaje.text.body;
                const telefono = mensaje.from; 
                
                // --- INICIO DE LA LÓGICA DEL CARRITO ---
                
                // 1. Si el cliente no existe en nuestro Map, le creamos un carrito vacío
                if (!carritos.has(telefono)) {
                    carritos.set(telefono, { 
                        pedidos: [],
                        ultimaActividad: Date.now() 
                    });

                    // Y creamos un proceso en el servidor que limpie la basura cada hora
                    setInterval(() => {
                        const ahora = Date.now();
                        for (let [telefono, carrito] of carritos.entries()) {
                            // Si pasaron más de 30 minutos (1800000 ms)
                            if (ahora - carrito.ultimaActividad > 1800000) {
                                carritos.delete(telefono);
                                console.log(`🧹 Carrito abandonado de ${telefono} eliminado de la RAM`);
                            }
                        }
                    }, 3600000); // Se ejecuta cada hora
                }

                // 2. Extraemos su carrito actual de la memoria
                let carritoDelCliente = carritos.get(telefono);

                // 3. Simulamos que agregamos lo que pidió al carrito 
                // (Pronto usaremos a Ollama para extraer los ingredientes, por ahora guardamos el texto crudo)
                carritoDelCliente.pedidos.push(textoBuscado);

                // 4. Guardamos el carrito actualizado en el Map
                carritos.set(telefono, carritoDelCliente);

                console.log(`📦 Estado del carrito de ${telefono}:`);
                console.log(carritos.get(telefono).pedidos);
                console.log("-----------------------------------");
            }
        }
    } catch (error) {
        console.error("Error procesando mensaje:", error);
    }
});


app.listen(PORT, () => {    
    console.log(`Servidor del bot corriendo en el puerto ${PORT}`);
});