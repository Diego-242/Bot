// Archivo: services/whatsappService.js
import 'dotenv/config';

export const enviarMensaje = async (numeroDestino, texto) => {
    // Estos dos datos te los da Meta en su panel de desarrolladores
    const TOKEN = process.env.WHATSAPP_TOKEN; 
    const PHONE_ID = process.env.PHONE_NUMBER_ID; 

    if (!TOKEN || !PHONE_ID) {
        console.warn("⚠️ Faltan credenciales de WhatsApp en el .env. No se pudo enviar el mensaje.");
        return;
    }

    try {
        const url = `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`;
        
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: numeroDestino,
                type: "text",
                text: { body: texto }
            })
        });

        const data = await respuesta.json();
        if (data.error) console.error("Error de Meta:", data.error.message);
        else console.log(`📤 Mensaje enviado a ${numeroDestino}: "${texto}"`);
        
    } catch (error) {
        console.error("Error de red enviando mensaje:", error);
    }
};