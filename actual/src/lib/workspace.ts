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

  const { getSystemSpreadsheetId, saveSystemSpreadsheetId } = await import('./firestore');

  const dbId = await getSystemSpreadsheetId();
  if (dbId) {
    localStorage.setItem('spectrum_sheet_id', dbId);
    return dbId;
  }

  // If not found in database, create a new one
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
  await saveSystemSpreadsheetId(createData.spreadsheetId);
  localStorage.setItem('spectrum_sheet_id', createData.spreadsheetId);
  return createData.spreadsheetId;
}

export async function syncRegistrationsToGoogleSheets(
  spreadsheetId: string,
  events: any[],
  registrations: any[],
  teamMembers: any[]
): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  // 1. Fetch spreadsheet info to check existing sheets
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  const getRes = await fetch(getUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!getRes.ok) {
    throw new Error(`Failed to fetch spreadsheet info: ${getRes.statusText}`);
  }
  const sheetData = await getRes.json();
  const existingSheetTitles: string[] = (sheetData.sheets || []).map((s: any) => s.properties.title);

  // 2. Identify separate worksheets needed for each event
  const eventNames = events.map(e => e.name);
  const sheetsToAdd = eventNames.filter(name => !existingSheetTitles.includes(name));

  if (sheetsToAdd.length > 0) {
    // Batch add new sheets
    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const requests = sheetsToAdd.map(title => ({
      addSheet: {
        properties: { title }
      }
    }));
    const batchRes = await fetch(batchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });
    if (!batchRes.ok) {
      console.warn("Failed to create some worksheets", await batchRes.json());
    }
  }

  // 3. Populate each sheet with teams, members, emails, phones, college, fee status, checked-in status
  for (const ev of events) {
    const evRegs = registrations.filter(r => r.eventId === ev.id);
    
    const rows: any[][] = [
      ['Team Name', 'Role', 'Name', 'Email', 'Phone', 'College', 'Fee Status', 'Checked In']
    ];

    for (const reg of evRegs) {
      const regMembers = teamMembers.filter(m => m.registrationId === reg.id && m.status === 'ACTIVE');

      if (ev.isTeamEvent) {
        const leader = regMembers.find(m => m.role === 'LEADER');
        const normalMembers = regMembers.filter(m => m.role === 'MEMBER');

        // Exactly 4 rows per team for team events
        for (let i = 0; i < 4; i++) {
          if (i === 0) {
            rows.push([
              reg.teamName || `Team-${reg.id.substring(0, 6)}`,
              'LEADER',
              leader ? leader.name : '',
              leader ? leader.email : '',
              leader ? leader.phone : '',
              leader ? (leader.college || '') : '',
              reg.feeStatus,
              reg.checkedIn ? 'Yes' : 'No'
            ]);
          } else {
            const m = normalMembers[i - 1];
            rows.push([
              reg.teamName || `Team-${reg.id.substring(0, 6)}`,
              `MEMBER`,
              m ? m.name : '',
              m ? m.email : '',
              m ? m.phone : '',
              m ? (m.college || '') : '',
              reg.feeStatus,
              reg.checkedIn ? 'Yes' : 'No'
            ]);
          }
        }
      } else {
        // Exactly 1 row per team for solo events
        const leader = regMembers.find(m => m.role === 'LEADER') || regMembers[0];
        rows.push([
          reg.teamName || `Team-${reg.id.substring(0, 6)}`,
          'LEADER',
          leader ? leader.name : '',
          leader ? leader.email : '',
          leader ? leader.phone : '',
          leader ? (leader.college || '') : '',
          reg.feeStatus,
          reg.checkedIn ? 'Yes' : 'No'
        ]);
      }
    }

    // Clear existing content in the sheet
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(ev.name)}!A1:Z1000:clear`;
    await fetch(clearUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Update values
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(ev.name)}!A1?valueInputOption=USER_ENTERED`;
    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: rows })
    });
    if (!updateRes.ok) {
      console.error(`Failed to sync worksheet for event: ${ev.name}`, await updateRes.json());
    }
  }
}

