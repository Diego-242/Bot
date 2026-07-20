import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SHEETS_ID; // Ponlo en tu .env

export async function enviarPedidoASheets(telefono, detallesPedido) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Pedidos',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          [telefono, new Date().toLocaleTimeString(), "WhatsApp", detallesPedido, "Calculando...", "Pendiente"]
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error guardando en Sheets:", error);
    return false;
  }
}