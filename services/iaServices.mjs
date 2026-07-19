// Archivo: services/iaService.js

export const extraerPedidoConIA = async (textoDelCliente) => {
    // El prompt es la clave: le damos instrucciones estrictas y un formato esperado
    const promptDefensivo = `
    Eres el sistema automatizado de una pizzería. Tu única tarea es extraer los alimentos que el cliente quiere pedir.
    
    Mensaje del cliente: "${textoDelCliente}"
    
    RESPONDE ÚNICAMENTE CON UN ARREGLO JSON VÁLIDO con este formato exacto:
    [{"item": "nombre del producto", "cantidad": numero, "notas": "detalles extra o sin ingredientes"}]
    
    Si el cliente solo saluda o no pide comida, devuelve un arreglo vacío: []
    `;

    try {
        console.log("🧠 Consultando a Ollama...");
        const respuesta = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.1', // Cambia esto si usas otro modelo local (ej. 'mistral', 'phi3')
                prompt: promptDefensivo,
                stream: false, 
                format: 'json' // Obligamos a la IA a devolver un JSON puro
            })
        });

        const datos = await respuesta.json();
        const jsonProcesado = JSON.parse(datos.response);
        return jsonProcesado;
        
    } catch (error) {
        console.error("❌ Error comunicándose con Ollama:", error.message);
        // Si la IA falla o está apagada, devolvemos vacío para no crashear el bot
        return []; 
    }
};