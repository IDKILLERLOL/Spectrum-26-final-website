function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Security check: validate API key
    var SECRET_KEY = "SECRET123"; // You can change this secret key if needed
    if (!data.apiKey || data.apiKey !== SECRET_KEY) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unauthorized: Invalid API key" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 1. Handle Email Dispatching
    if (data.type === "email") {
      GmailApp.sendEmail(data.to, data.subject, data.text, {
        htmlBody: data.html,
        name: "SPECTRUM 26"
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Handle Google Sheet Synchronization
    var spreadsheetId = data.spreadsheetId;
    if (!spreadsheetId) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Missing spreadsheetId" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sheet = ss.getSheetByName("All Registrations");
    if (!sheet) {
      sheet = ss.insertSheet("All Registrations");
      sheet.appendRow([
        "Event Name", "Team/Leader Name", "Role", "Name", "Email", 
        "Phone", "College", "Fee Status", "Transaction ID / Ref", 
        "Payment Screenshot", "Checked In", "Registered At"
      ]);
    }
    
    if (data.type === "registration") {
      sheet.appendRow([
        data.eventName,
        data.fullName,
        "LEADER",
        data.fullName,
        data.email,
        "", // Phone
        "", // College
        data.paymentStatus,
        data.paymentRefId,
        "", // Screenshot
        "No", // Checked In
        data.createdAt
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Support reading registrations if needed
  try {
    var spreadsheetId = e.parameter.spreadsheetId;
    if (!spreadsheetId) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Missing spreadsheetId" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sheet = ss.getSheetByName("All Registrations");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var values = sheet.getDataRange().getValues();
    var headers = values[0];
    var list = [];
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      list.push(obj);
    }
    return ContentService.createTextOutput(JSON.stringify(list))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
