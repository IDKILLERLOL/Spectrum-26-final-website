function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Security check: validate API key
    // IMPORTANT: This must exactly match the value of EMAIL_APPS_SCRIPT_SECRET in your Vercel env vars.
    var SECRET_KEY = "ishaandagoat";
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
    }

    var STANDARD_HEADERS = [
      "Event Name", "Team/Leader Name", "Role", "Name", "Email", 
      "Phone", "College", "Year", "Fee Status", "Transaction ID / Ref", 
      "Payment Screenshot", "Checked In", "Registered At", "Registration ID"
    ];

    // Handle Full Sheet Rebuild / Clean Sync
    if (data.type === "full_sync") {
      var rows = data.rows || [];
      sheet.clear();
      
      // Write Header Row
      sheet.getRange(1, 1, 1, STANDARD_HEADERS.length).setValues([STANDARD_HEADERS]);
      sheet.getRange(1, 1, 1, STANDARD_HEADERS.length)
        .setFontWeight("bold")
        .setBackground("#0B192C")
        .setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);

      if (rows.length > 0) {
        // Sanitize every cell string so +, = etc. never produce formula #ERROR!
        var sanitizedRows = rows.map(function(r) {
          var rowArr = [];
          for (var c = 0; c < STANDARD_HEADERS.length; c++) {
            var cell = (r && r[c] !== undefined && r[c] !== null) ? r[c] : "";
            var str = String(cell).trim();
            // Phone column (c === 5): strip leading +
            if (c === 5 && str.charAt(0) === "+") {
              str = str.substring(1).trim();
            }
            if (str.charAt(0) === "=" || str.charAt(0) === "+") {
              str = "'" + str;
            }
            rowArr.push(str);
          }
          return rowArr;
        });

        // Set phone column format as plain text
        sheet.getRange(2, 6, sanitizedRows.length, 1).setNumberFormat("@");
        sheet.getRange(2, 1, sanitizedRows.length, STANDARD_HEADERS.length).setValues(sanitizedRows);
      }

      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        action: "full_sync", 
        totalRows: rows.length 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Ensure header row has Registration ID column if missing
    var lastCol = Math.max(sheet.getLastColumn(), 12);
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var regIdColIdx = -1;
    for (var h = 0; h < headers.length; h++) {
      if (String(headers[h]).toLowerCase().indexOf("registration id") !== -1 || String(headers[h]).toLowerCase() === "id") {
        regIdColIdx = h;
        break;
      }
    }
    if (regIdColIdx === -1) {
      regIdColIdx = 13; // 14th column
      sheet.getRange(1, 14).setValue("Registration ID");
    }

    // Handle Delete Registration
    if (data.type === "delete_registration") {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
        for (var r = values.length - 1; r >= 0; r--) {
          var row = values[r];
          var match = false;
          if (data.id && row[regIdColIdx] && String(row[regIdColIdx]).trim() === String(data.id).trim()) {
            match = true;
          } else if (data.email && String(row[4]).toLowerCase().trim() === String(data.email).toLowerCase().trim() &&
                     (!data.eventName || String(row[0]).toLowerCase().trim() === String(data.eventName).toLowerCase().trim())) {
            match = true;
          }
          if (match) {
            sheet.deleteRow(r + 2);
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", action: "deleted" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Handle Registration Upsert / Edit / Status Update / Checkin
    if (data.type === "registration" || data.type === "edit_registration") {
      var teamOrLeaderName = data.teamName || data.fullName || "";
      var leaderEmail = (data.email || "").toLowerCase().trim();
      var regId = data.id || data.teamId || "";
      var eventName = (data.eventName || "").trim();
      var feeStatus = data.paymentStatus || "PENDING";
      var txId = data.paymentRefId || "";
      var screenshot = data.pictureUrl || "";
      var checkedIn = (data.checkedIn === true || data.checkedIn === "Yes" || data.checkedIn === "YES") ? "Yes" : "No";
      var regDate = data.createdAt || "";

      var lastRow = sheet.getLastRow();
      var matchingRowIndices = []; // 1-based row numbers in sheet

      if (lastRow > 1) {
        var values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
        for (var i = 0; i < values.length; i++) {
          var row = values[i];
          var rowEvent = String(row[0] || "").toLowerCase().trim();
          var rowTeam = String(row[1] || "").toLowerCase().trim();
          var rowEmail = String(row[4] || "").toLowerCase().trim();
          var rowRegId = row[regIdColIdx] ? String(row[regIdColIdx]).trim() : "";

          // Match by Registration ID or (Event Name + Leader/Member Email) or (Event Name + Team Name)
          var isMatch = false;
          if (regId && rowRegId && rowRegId === regId) {
            isMatch = true;
          } else if (eventName && rowEvent === eventName.toLowerCase()) {
            if (leaderEmail && rowEmail === leaderEmail) {
              isMatch = true;
            } else if (teamOrLeaderName && rowTeam === teamOrLeaderName.toLowerCase()) {
              isMatch = true;
            } else if (Array.isArray(data.teamMembers)) {
              for (var m = 0; m < data.teamMembers.length; m++) {
                var memEmail = String(data.teamMembers[m].email || "").toLowerCase().trim();
                if (memEmail && rowEmail === memEmail) {
                  isMatch = true;
                  break;
                }
              }
            }
          }

          if (isMatch) {
            matchingRowIndices.push(i + 2); // 1-based row index in sheet
          }
        }
      }

      // If rows already exist for this team/registration, EDIT existing rows in-place (DO NOT add new rows!)
      if (matchingRowIndices.length > 0) {
        for (var k = 0; k < matchingRowIndices.length; k++) {
          var rowNum = matchingRowIndices[k];
          
          // Column 8: Fee Status
          if (feeStatus) sheet.getRange(rowNum, 8).setValue(feeStatus);
          // Column 9: Transaction ID / Ref
          if (txId) sheet.getRange(rowNum, 9).setValue(txId);
          // Column 10: Payment Screenshot
          if (screenshot) sheet.getRange(rowNum, 10).setValue(screenshot);
          // Column 11: Checked In
          if (data.checkedIn !== undefined) sheet.getRange(rowNum, 11).setValue(checkedIn);
          // Column 13: Registration ID
          if (regId) sheet.getRange(rowNum, regIdColIdx + 1).setValue(regId);
        }

        return ContentService.createTextOutput(JSON.stringify({ 
          status: "success", 
          action: "edited", 
          rowsUpdated: matchingRowIndices.length 
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // If no matching rows exist, append leader row
      sheet.appendRow([
        eventName,
        teamOrLeaderName,
        data.role || "LEADER",
        data.fullName || "",
        data.email || "",
        data.phone || "",
        data.collegeName || "",
        feeStatus,
        txId,
        screenshot,
        checkedIn,
        regDate,
        regId
      ]);

      // Append Team Member rows if any
      if (Array.isArray(data.teamMembers)) {
        for (var m = 0; m < data.teamMembers.length; m++) {
          var member = data.teamMembers[m];
          var memName = member.name || (typeof member === "string" ? member : "");
          if (!memName && !member.email) continue;
          
          sheet.appendRow([
            eventName,
            teamOrLeaderName,
            "MEMBER",
            memName,
            member.email || "",
            member.phone || "",
            member.collegeName || member.college || data.collegeName || "",
            feeStatus,
            txId,
            screenshot,
            checkedIn,
            regDate,
            regId
          ]);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success", action: "created" }))
        .setMimeType(ContentService.MimeType.JSON);
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
