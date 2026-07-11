import { getAccessToken } from './auth';

export async function appendToSheet(spreadsheetId: string, range: string, values: any[][]) {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Sheets API Error:", error);
    throw new Error("Failed to append to Google Sheet");
  }

  return response.json();
}

export async function sendEmail(to: string, subject: string, body: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  // Format as RFC 2822
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    body
  ].join('\r\n');

  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const url = `https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encodedMessage })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Gmail API Error:", error);
    throw new Error("Failed to send email via Gmail");
  }

  return response.json();
}

// Function to find or create the registration spreadsheet
export async function getOrCreateRegistrationSheet(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const cachedId = localStorage.getItem('spectrum_sheet_id');
  if (cachedId) return cachedId;

  // If not found in cache, create a new one
  const createUrl = `https://sheets.googleapis.com/v4/spreadsheets`;
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title: 'Spectrum 26 Registrations' },
      sheets: [{
        properties: { title: 'Registrations' },
        data: [{
          startRow: 0, startColumn: 0,
          rowData: [{
            values: [
              { userEnteredValue: { stringValue: 'Timestamp' } },
              { userEnteredValue: { stringValue: 'User Email' } },
              { userEnteredValue: { stringValue: 'Event Name' } },
              { userEnteredValue: { stringValue: 'Transaction ID' } },
              { userEnteredValue: { stringValue: 'Status' } }
            ]
          }]
        }]
      }]
    })
  });

  if (!createRes.ok) {
    const error = await createRes.json();
    console.error("Failed to create spreadsheet", error);
    throw new Error("Failed to create spreadsheet");
  }

  const createData = await createRes.json();
  localStorage.setItem('spectrum_sheet_id', createData.spreadsheetId);
  return createData.spreadsheetId;
}
