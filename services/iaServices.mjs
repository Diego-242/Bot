import dotenv from 'dotenv';
dotenv.config();

const pedidoSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['pedidos'],
    properties: {
        pedidos: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['item', 'cantidad', 'notas'],
                properties: {
                    item: { type: 'string' },
                    cantidad: { type: 'integer', minimum: 1 },
                    notas: { type: 'string' }
                }
            }
        }
    }
};

function normalizarPedidos(pedidos) {
    if (!Array.isArray(pedidos)) return [];

    return pedidos
        .filter((pedido) => (
            pedido &&
            typeof pedido.item === 'string' &&
            pedido.item.trim() !== '' &&
            Number.isInteger(pedido.cantidad) &&
            pedido.cantidad > 0 &&
            typeof pedido.notas === 'string'
        ))
        .map((pedido) => ({
            item: pedido.item.trim(),
            cantidad: pedido.cantidad,
            notas: pedido.notas.trim()
        }));
}

export const extraerPedidoConIA = async (textoDelCliente) => {

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        console.error("❌ FATAL: Falta GEMINI_API_KEY en el archivo .env");
        return [];
    }

    const promptDefensivo = `
        Eres un extractor de pedidos de cualquier tipo de negocio.

        Devuelve exclusivamente el objeto JSON solicitado por el esquema.
        No escribas explicaciones, comentarios ni texto adicional.

        Reglas:

        - Extrae TODOS los productos solicitados por el cliente.
        - Los productos pueden ser alimentos, bebidas, postres, medicamentos, ropa, accesorios o cualquier otro artículo.
        - Cada producto debe convertirse en un objeto con:
        - item
        - cantidad
        - notas

        - "item" debe contener únicamente el nombre del producto.

        - "cantidad" debe ser un entero mayor que cero.

        - "notas" debe contener todas las características, modificaciones o especificaciones del producto, por ejemplo:
        - tamaño
        - sabor
        - color
        - presentación
        - ingredientes
        - extras
        - sin algún ingrediente
        - cocción
        - cualquier personalización

        - Si un producto no tiene modificaciones responde:
        "notas": "normal"

        - Si una parte de una cantidad tiene modificaciones, divide el pedido.

        REGLA MATEMÁTICA OBLIGATORIA

        Nunca dupliques cantidades.

        Ejemplo:

        Cliente:
        "5 hamburguesas, 2 sin cebolla"

        Respuesta:

        {
        "pedidos":[
            {
            "item":"hamburguesa",
            "cantidad":3,
            "notas":"normal"
            },
            {
            "item":"hamburguesa",
            "cantidad":2,
            "notas":"sin cebolla"
            }
        ]
        }

        Otro ejemplo:

        Cliente:
        "3 pizzas familiares.
        Una margarita sin albahaca.
        Una barbacoa con extra queso y doble carne.
        La otra de pollo teriyaki pequeña con masa fina.
        2 refrescos de naranja grandes.
        1 agua mineral sin gas."

        Respuesta:

        {
        "pedidos":[
            {
            "item":"pizza",
            "cantidad":1,
            "notas":"familiar, margarita, sin albahaca"
            },
            {
            "item":"pizza",
            "cantidad":1,
            "notas":"familiar, barbacoa, extra queso, doble carne"
            },
            {
            "item":"pizza",
            "cantidad":1,
            "notas":"pequeña, pollo teriyaki, masa fina"
            },
            {
            "item":"refresco",
            "cantidad":2,
            "notas":"naranja, grande"
            },
            {
            "item":"agua mineral",
            "cantidad":1,
            "notas":"sin gas"
            }
        ]
        }

        Otro ejemplo:

        Cliente:
        "2 camisetas negras talla M y una blanca talla L"

        Respuesta:

        {
        "pedidos":[
            {
            "item":"camiseta",
            "cantidad":2,
            "notas":"negra, talla M"
            },
            {
            "item":"camiseta",
            "cantidad":1,
            "notas":"blanca, talla L"
            }
        ]
        }

        Si el mensaje no contiene un pedido responde:

        {
        "pedidos":[]
        }

        Antes de responder verifica que:

        - no hayas duplicado cantidades
        - todos los productos estén incluidos
        - la suma de cantidades coincida exactamente con el pedido del cliente

        <mensaje_cliente>
        ${textoDelCliente}
        </mensaje_cliente>
    `;

    try {
        console.log('🧠 Consultando a Gemini...');

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptDefensivo }]
                }],
                // MAGIA DE GOOGLE: Esto fuerza al modelo a devolver JSON puro siempre
                generationConfig: {
                    response_mime_type: "application/json" 
                }
            })
        });

        if (!respuesta.ok) {
            console.error(`🚨 Gemini respondió HTTP ${respuesta.status}`);
            return [];
        }

        const datos = await respuesta.json();
        if (datos.error) {
            console.error('🚨 Error interno de Google:', datos.error);
            return [];
        }

        const textoRespuesta = datos.candidates[0].content.parts[0].text;
        console.log("👀 Respuesta cruda de Gemini:\n", textoRespuesta);

        const jsonProcesado = JSON.parse(textoRespuesta);
        
        // Mantenemos tu DEFENSA TOTAL por si acaso
        let arregloFinal = [];
        if (Array.isArray(jsonProcesado)) {
            arregloFinal = jsonProcesado; 
        } else if (jsonProcesado.items && Array.isArray(jsonProcesado.items)) {
            arregloFinal = jsonProcesado.items;
        } else if (jsonProcesado.pedidos && Array.isArray(jsonProcesado.pedidos)) {
            arregloFinal = jsonProcesado.pedidos;
        } else if (typeof jsonProcesado === 'object' && jsonProcesado.item) {
            arregloFinal = [jsonProcesado]; 
        }

        return arregloFinal;

    } catch (error) {
        console.error('❌ Error extrayendo el pedido con IA:', error.message);
        return [];
    }
};
