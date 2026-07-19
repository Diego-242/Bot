import fetch from 'node-fetch';

const TARGET_URL = 'http://localhost:3000/webhook';
const NUM_REQUESTS = 9000; // Puedes aumentar este número significativamente (ej. 1000, 5000)
const REQUEST_BODY = JSON.stringify({
    // Simulamos un mensaje de WhatsApp con texto.
    // El 'from' y el 'type' son simulados para que parezca un mensaje de texto.
    object: 'whatsapp_business_account',
    entry: [{
        changes: [{
            value: {
                messages: [{
                    from: '521' + Math.floor(Math.random() * 1000000000), // Número de teléfono simulado
                    id: `wamid.${Date.now()}-${Math.random()}`,
                    timestamp: String(Date.now()),
                    type: 'text',
                    text: {
                        body: `Mensaje de prueba ${Math.floor(Math.random() * 1000)}` // Contenido del mensaje
                    }
                }]
            }
        }]
    }]
});

async function sendRequest(index) {
    try {
        // console.log(`Sending request ${index + 1}/${NUM_REQUESTS}...`); // Descomenta si quieres ver cada solicitud
        const response = await fetch(TARGET_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Si tu servidor requiere un token de verificación en las requests POST (aunque el código leído no lo muestra), añádelo aquí.
                // 'Authorization': 'Bearer TU_VERIFY_TOKEN' 
            },
            body: REQUEST_BODY,
        });
        
        // Puedes imprimir el estado si quieres ver cómo responden las solicitudes
        if (index % 50 === 0 || response.status !== 200) { // Imprime cada 50 solicitudes o si hay un error
            console.log(`Request ${index + 1} finished with status: ${response.status} message: ${await response.text()}`);
        }

    } catch (error) {
        console.error(`Request ${index + 1} failed:`, error.message);
    }
}

async function runTests() {
    console.log(`Sending ${NUM_REQUESTS} POST requests to ${TARGET_URL} to overload the server...`);
    
    const requestPromises = [];
    for (let i = 0; i < NUM_REQUESTS; i++) {
        requestPromises.push(sendRequest(i));
    }
    
    await Promise.all(requestPromises);
    
    console.log('All requests have been sent.');
    console.log('Monitor your server logs for performance degradation or crashes.');
}

runTests();