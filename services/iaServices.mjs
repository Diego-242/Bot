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
    const prompt = `
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
        console.log('🧠 Consultando a Ollama...');
        const respuesta = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen3.5',
                prompt,
                stream: false,
                format: pedidoSchema,
                options: { temperature: 0 }
            })
        });

        if (!respuesta.ok) {
            console.error(`🚨 Ollama respondió HTTP ${respuesta.status}`);
            return [];
        }

        const datos = await respuesta.json();
        if (datos.error) {
            console.error('🚨 Error interno de Ollama:', datos.error);
            return [];
        }

        console.log('👀 Respuesta cruda de la IA:\n', datos.response);
        console.log("RAW RESPONSE:");
        console.log(datos.response);

        try {
            const jsonProcesado = JSON.parse(datos.response);
            const pedidos = normalizarPedidos(jsonProcesado.pedidos);
            return pedidos;
        } catch (e) {
            console.error("No es un JSON válido:");
            console.error(datos.response);
            throw e;
        }
        //const jsonProcesado = JSON.parse(datos.response);
        //const pedidos = normalizarPedidos(jsonProcesado.pedidos);

        if (pedidos.length === 0) {
            console.warn('⚠️ La IA no devolvió pedidos válidos.');
        }

        return pedidos;
    } catch (error) {
        console.error('❌ Error extrayendo el pedido con IA:', error.message);
        return [];
    }
};
