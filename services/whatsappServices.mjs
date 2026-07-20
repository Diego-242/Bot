// Archivo: services/whatsappService.js
import 'dotenv/config';
const TOKEN = process.env.WHATSAPP_TOKEN; 
const PHONE_ID = process.env.PHONE_NUMBER_ID; 

export const enviarMensaje = async (numeroDestino, texto) => {

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


export const enviarBotones = async (numeroDestino, texto, botones) => {

    if (!TOKEN || !PHONE_ID) {
        console.warn("⚠️ Faltan credenciales de WhatsApp en el .env. No se pudo enviar el mensaje.");
        return;
    }

    try {
        const url = `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`;
        
        // Formateamos los botones al estándar estricto de Meta
        const botonesFormateados = botones.map(boton => ({
            type: "reply",
            reply: {
                id: boton.id,
                title: boton.title
            }
        }));

        const respuesta = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: numeroDestino,
                type: "interactive",
                interactive: {
                    type: "button",
                    body: { text: texto },
                    action: {
                        buttons: botonesFormateados
                    }
                }
            })
        });

        const data = await respuesta.json();
        if (data.error) console.error("Error enviando botones:", data.error.message);
        else console.log(`🔘 Botones enviados a ${numeroDestino}`);
        
    } catch (error) {
        console.error("Error de red:", error);
    }
};

// Archivo: services/whatsappService.js

export const enviarDocumento = async (numeroDestino, urlDocumento, nombreArchivo, leyendaTexto) => {
    
    if (!TOKEN || !PHONE_ID) {
        console.warn("⚠️ Faltan credenciales de WhatsApp en el .env. No se pudo enviar el PDF.");
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
                type: "document",
                document: {
                    link: urlDocumento, // La URL donde está alojado tu PDF
                    filename: nombreArchivo, // El nombre que verá el usuario (ej: Menu_Pizzeria.pdf)
                    caption: leyendaTexto // Texto opcional que acompaña al archivo
                }
            })
        });

        const data = await respuesta.json();
        if (data.error) console.error("Error enviando PDF:", data.error.message);
        else console.log(`📄 PDF enviado a ${numeroDestino}`);
        
    } catch (error) {
        console.error("Error de red enviando PDF:", error);
    }
};