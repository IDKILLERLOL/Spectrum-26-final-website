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
  const existingSheets = sheetData.sheets || [];
  const existingSheetTitles: string[] = existingSheets.map((s: any) => s.properties.title);

  // 2. Identify allowed worksheets and actions
  const allowedTitles = ["All Registrations", ...events.map(e => e.name)];
  
  const requests: any[] = [];
  
  // A. Add sheets that are missing
  for (const title of allowedTitles) {
    if (!existingSheetTitles.includes(title)) {
      requests.push({
        addSheet: { properties: { title } }
      });
    }
  }
  
  // B. Delete sheets that are not allowed
  for (const s of existingSheets) {
    if (!allowedTitles.includes(s.properties.title)) {
      requests.push({
        deleteSheet: { sheetId: s.properties.sheetId }
      });
    }
  }

  // C. Execute batch update
  if (requests.length > 0) {
    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const batchRes = await fetch(batchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });
    if (!batchRes.ok) {
      console.warn("Failed to update worksheets structure", await batchRes.json());
    }
  }

  // 3. Populate "All Registrations" sheet
  const universalRows: any[][] = [
    ['Event Name', 'Team/Leader Name', 'Role', 'Name', 'Email', 'Phone', 'College', 'Fee Status', 'Transaction ID / Ref', 'Payment Screenshot', 'Checked In', 'Registered At']
  ];

  for (const reg of registrations) {
    const event = events.find(e => e.id === reg.eventId);
    const regMembers = teamMembers.filter(m => m.registrationId === reg.id && m.status === 'ACTIVE');
    const leader = regMembers.find(m => m.role === 'LEADER') || regMembers[0];
    const membersList = regMembers.filter(m => m.role === 'MEMBER');

    const eventName = event ? event.name : 'Unknown Event';
    const displayName = reg.teamName || (leader ? leader.name : 'Anonymous');
    const proofUrl = reg.paymentProofUrl || reg.paymentScreenshotUrl || '';

    // Add leader row
    universalRows.push([
      eventName,
      displayName,
      'LEADER',
      leader ? leader.name : '',
      leader ? leader.email : '',
      leader ? leader.phone : '',
      leader ? (leader.college || '') : '',
      reg.feeStatus,
      reg.upiTransactionRef || '',
      proofUrl,
      reg.checkedIn ? 'Yes' : 'No',
      reg.createdAt ? new Date(reg.createdAt).toLocaleString() : ''
    ]);

    // Add member rows
    for (const m of membersList) {
      universalRows.push([
        eventName,
        displayName,
        'MEMBER',
        m.name,
        m.email,
        m.phone,
        m.college || '',
        reg.feeStatus,
        reg.upiTransactionRef || '',
        proofUrl,
        reg.checkedIn ? 'Yes' : 'No',
        reg.createdAt ? new Date(reg.createdAt).toLocaleString() : ''
      ]);
    }
  }

  // Clear universal values
  const clearUniversalUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("All Registrations")}!A1:Z50000:clear`;
  await fetch(clearUniversalUrl, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // Update universal values
  const updateUniversalUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("All Registrations")}!A1?valueInputOption=USER_ENTERED`;
  const updateUniversalRes = await fetch(updateUniversalUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: universalRows })
  });
  if (!updateUniversalRes.ok) {
    console.error("Failed to sync universal worksheet", await updateUniversalRes.json());
  }

  // 4. Populate each event sheet with teams
  for (const ev of events) {
    const evRegs = registrations.filter(r => r.eventId === ev.id);
    
    const rows: any[][] = [
      ['Team Name', 'Role', 'Name', 'Email', 'Phone', 'College', 'Fee Status', 'Transaction ID / Ref', 'Payment Screenshot', 'Checked In', 'Registered At']
    ];

    for (const reg of evRegs) {
      const regMembers = teamMembers.filter(m => m.registrationId === reg.id && m.status === 'ACTIVE');
      
      // Sort regMembers so that LEADER is always at the top of the team list
      const sortedMembers = [...regMembers].sort((a, b) => {
        if (a.role === 'LEADER') return -1;
        if (b.role === 'LEADER') return 1;
        return 0;
      });

      for (const m of sortedMembers) {
        rows.push([
          reg.teamName || `Team-${reg.id.substring(0, 6)}`,
          m.role || 'MEMBER',
          m.name || '',
          m.email || '',
          m.phone || '',
          m.college || '',
          reg.feeStatus,
          reg.upiTransactionRef || '',
          reg.paymentProofUrl || reg.paymentScreenshotUrl || '',
          reg.checkedIn ? 'Yes' : 'No',
          reg.createdAt ? new Date(reg.createdAt).toLocaleString() : ''
        ]);
      }
    }

    // Clear existing content in the sheet
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(ev.name)}!A1:Z50000:clear`;
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

