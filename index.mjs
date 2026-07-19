import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import webhookRoutes from './routes/webhookRoutes.mjs';

// --- Configuración ---
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

if (!VERIFY_TOKEN) {
    console.error("❌ FATAL ERROR: VERIFY_TOKEN no está definido en el archivo .env");
    process.exit(1);
}

const app = express();
app.use(express.json());

const aggressivelyBlockingIPs = new Set(); 

// --- Middleware de Rate Limiting ---
const webhookLimiter = rateLimit({
    windowMs: 60 * 1000, // Ventana de 1 minuto
    max: 10, // Máximo 10 solicitudes por IP
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


app.use('/webhook', webhookLimiter, webhookRoutes);

app.listen(PORT, () => {    
    console.log(`Servidor del bot corriendo en el puerto ${PORT}`);
});
