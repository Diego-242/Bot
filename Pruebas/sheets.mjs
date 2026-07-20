import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: '../credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 1. REEMPLAZA ESTO CON EL ID DE TU URL
// Ej: https://docs.google.com/spreadsheets/d/AQUI_ESTA_EL_ID/edit
const SPREADSHEET_ID = '15FS6ieL5z0aK_AHAC5b15ZrpOW-dcJ3UrjFCYtJrpvs';

async function probarConexion() {
  console.log('Enviando orden a la cocina...');
  
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      // 2. REEMPLAZA "Pedidos" SI TU PESTAÑA SE LLAMA DIFERENTE
      range: 'Pedidos', 
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          ['PED-421', new Date().toLocaleTimeString(), 'Whatsapp', 'papas, 1x Cola', 4.56, 'Completado']
        ],
      },
    });
    
    console.log('¡Éxito! Abre tu Google Sheets, debería estar ahí la nueva fila.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

probarConexion();