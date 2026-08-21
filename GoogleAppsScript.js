function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Security check: validate API key
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

    var ALL_HEADERS = [
      "Event Name", "Team/Leader Name", "Role", "Name", "Email", 
      "Phone", "College", "Fee Status", "Transaction ID / Ref", 
      "Payment Screenshot", "Checked In", "Registered At", "Team ID"
    ];

    var EVENT_HEADERS = [
      "Team ID", "Team Name", "Role", "Name", "Email", 
      "Phone", "College", "Fee Status", "Transaction ID / Ref", 
      "Payment Screenshot", "Checked In", "Registered At"
    ];

    function getEventSheet(eventName) {
      if (!eventName) return null;
      var name = String(eventName).trim();
      var sheet = ss.getSheetByName(name);
      if (!sheet) {
        if (name.toLowerCase().indexOf("fc") !== -1 || name.toLowerCase().indexOf("fifa") !== -1) {
          sheet = ss.getSheetByName("FC 26") || ss.getSheetByName("FIFA") || ss.getSheetByName("EA FC 26");
        }
      }
      return sheet;
    }

    function cleanPhone(raw) {
      if (!raw) return "";
      var s = String(raw).trim();
      if (s.charAt(0) === "+") s = s.substring(1).trim();
      return s;
    }

    function sanitizeCell(val, isPhone) {
      if (val === null || val === undefined) return "";
      var str = String(val).trim();
      if (isPhone && str.charAt(0) === "+") str = str.substring(1).trim();
      if (str.charAt(0) === "=" || str.charAt(0) === "+") return "'" + str;
      return str;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FULL SYNC: Clean rebuild of "All Registrations" AND all Event Sheets
    // ─────────────────────────────────────────────────────────────────────────
    if (data.type === "full_sync") {
      var allRows = data.allRows || data.rows || [];
      var teams = data.teams || []; // array of { leader, members: [...] }

      // 1. Rebuild "All Registrations"
      var allSheet = ss.getSheetByName("All Registrations");
      if (!allSheet) allSheet = ss.insertSheet("All Registrations");
      allSheet.clear();
      allSheet.getRange(1, 1, 1, ALL_HEADERS.length).setValues([ALL_HEADERS]);
      allSheet.getRange(1, 1, 1, ALL_HEADERS.length)
        .setFontWeight("bold")
        .setBackground("#0B192C")
        .setFontColor("#FFFFFF")
        .setVerticalAlignment("middle");
      allSheet.setFrozenRows(1);

      if (allRows.length > 0) {
        var sanitizedAllRows = allRows.map(function(r) {
          var rowArr = [];
          for (var c = 0; c < ALL_HEADERS.length; c++) {
            rowArr.push(sanitizeCell(r[c], c === 5));
          }
          return rowArr;
        });

        allSheet.getRange(2, 6, sanitizedAllRows.length, 1).setNumberFormat("@");
        allSheet.getRange(2, 1, sanitizedAllRows.length, ALL_HEADERS.length).setValues(sanitizedAllRows);

        // Merge team rows vertically in All Registrations
        var i = 0;
        while (i < sanitizedAllRows.length) {
          var currentId = sanitizedAllRows[i][12]; // Team ID is col 13 (idx 12)
          var count = 1;
          while (i + count < sanitizedAllRows.length && sanitizedAllRows[i + count][12] === currentId && currentId !== "") {
            count++;
          }
          var startRow = i + 2;
          if (count > 1) {
            var mergeCols = [1, 2, 8, 9, 10, 11, 12, 13];
            for (var m = 0; m < mergeCols.length; m++) {
              allSheet.getRange(startRow, mergeCols[m], count, 1).mergeVertically();
            }
          }
          allSheet.getRange(startRow, 1, count, ALL_HEADERS.length).setVerticalAlignment("middle");
          i += count;
        }
      }

      // 2. Rebuild Event-Specific Sheets
      var eventMap = {}; // eventName -> array of rows
      for (var t = 0; t < teams.length; t++) {
        var team = teams[t];
        var ev = team.leader.eventName;
        if (!eventMap[ev]) eventMap[ev] = [];
        
        // Leader
        eventMap[ev].push([
          team.leader.teamId,
          team.leader.teamName,
          "LEADER",
          team.leader.name,
          team.leader.email,
          cleanPhone(team.leader.phone),
          team.leader.college,
          team.leader.feeStatus,
          team.leader.txId,
          team.leader.screenshot,
          team.leader.checkedIn,
          team.leader.formattedDate
        ]);

        // Members
        if (Array.isArray(team.members)) {
          for (var mem = 0; mem < team.members.length; mem++) {
            var m = team.members[mem];
            eventMap[ev].push([
              team.leader.teamId,
              team.leader.teamName,
              "MEMBER",
              m.name,
              m.email,
              cleanPhone(m.phone),
              m.college,
              team.leader.feeStatus,
              team.leader.txId,
              team.leader.screenshot,
              team.leader.checkedIn,
              team.leader.formattedDate
            ]);
          }
        }
      }

      // Write each event sheet
      for (var evName in eventMap) {
        var evSheet = getEventSheet(evName);
        if (evSheet) {
          evSheet.clear();
          evSheet.getRange(1, 1, 1, EVENT_HEADERS.length).setValues([EVENT_HEADERS]);
          evSheet.getRange(1, 1, 1, EVENT_HEADERS.length)
            .setFontWeight("bold")
            .setBackground("#0B192C")
            .setFontColor("#FFFFFF")
            .setVerticalAlignment("middle");
          evSheet.setFrozenRows(1);

          var evRows = eventMap[evName];
          if (evRows.length > 0) {
            var sanitizedEvRows = evRows.map(function(r) {
              return r.map(function(cell, idx) { return sanitizeCell(cell, idx === 5); });
            });

            evSheet.getRange(2, 6, sanitizedEvRows.length, 1).setNumberFormat("@");
            evSheet.getRange(2, 1, sanitizedEvRows.length, EVENT_HEADERS.length).setValues(sanitizedEvRows);

            // Merge team rows vertically
            var j = 0;
            while (j < sanitizedEvRows.length) {
              var currId = sanitizedEvRows[j][0]; // Team ID is col 1 (idx 0)
              var cnt = 1;
              while (j + cnt < sanitizedEvRows.length && sanitizedEvRows[j + cnt][0] === currId && currId !== "") {
                cnt++;
              }
              var sRow = j + 2;
              if (cnt > 1) {
                var evMergeCols = [1, 2, 8, 9, 10, 11, 12];
                for (var em = 0; em < evMergeCols.length; em++) {
                  evSheet.getRange(sRow, evMergeCols[em], cnt, 1).mergeVertically();
                }
              }
              evSheet.getRange(sRow, 1, cnt, EVENT_HEADERS.length).setVerticalAlignment("middle");
              j += cnt;
            }
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        action: "full_sync", 
        totalAllRows: allRows.length,
        totalTeams: teams.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INDIVIDUAL REGISTRATION SYNC (Create / In-Place Edit / Check-in / Paid)
    // ─────────────────────────────────────────────────────────────────────────
    if (data.type === "registration" || data.type === "edit_registration") {
      var teamId = data.id || data.teamId || "";
      var eventName = (data.eventName || "").trim();
      var teamOrLeaderName = data.teamName || data.fullName || "";
      var leaderEmail = (data.email || "").toLowerCase().trim();
      var feeStatus = data.paymentStatus || "PENDING";
      var txId = data.paymentRefId || "";
      var screenshot = data.pictureUrl || "";
      var checkedIn = (data.checkedIn === true || data.checkedIn === "Yes" || data.checkedIn === "YES") ? "Yes" : "No";
      var regDate = data.createdAt || "";

      // 1. Sync to "All Registrations"
      var allSheet = ss.getSheetByName("All Registrations");
      if (allSheet) {
        var lastRow = allSheet.getLastRow();
        var allMatchIndices = [];

        if (lastRow > 1) {
          var allValues = allSheet.getRange(2, 1, lastRow - 1, ALL_HEADERS.length).getValues();
          for (var i = 0; i < allValues.length; i++) {
            var row = allValues[i];
            var rowTeamId = String(row[12] || "").trim();
            var rowEmail = String(row[4] || "").toLowerCase().trim();
            var rowEvent = String(row[0] || "").toLowerCase().trim();

            if ((teamId && rowTeamId === teamId) ||
                (eventName && rowEvent === eventName.toLowerCase() && leaderEmail && rowEmail === leaderEmail)) {
              allMatchIndices.push(i + 2);
            }
          }
        }

        if (allMatchIndices.length > 0) {
          // Edit existing rows in-place
          for (var k = 0; k < allMatchIndices.length; k++) {
            var rNum = allMatchIndices[k];
            if (feeStatus) allSheet.getRange(rNum, 8).setValue(feeStatus);
            if (txId) allSheet.getRange(rNum, 9).setValue(txId);
            if (screenshot) allSheet.getRange(rNum, 10).setValue(screenshot);
            if (data.checkedIn !== undefined) allSheet.getRange(rNum, 11).setValue(checkedIn);
            if (teamId) allSheet.getRange(rNum, 13).setValue(teamId);
          }
        } else {
          // Append new rows
          var startRow = allSheet.getLastRow() + 1;
          var newRows = [];
          
          newRows.push([
            eventName, teamOrLeaderName, "LEADER", data.fullName || "", leaderEmail,
            cleanPhone(data.phone), data.collegeName || "", feeStatus, txId, screenshot, checkedIn, regDate, teamId
          ]);

          if (Array.isArray(data.teamMembers)) {
            for (var m = 0; m < data.teamMembers.length; m++) {
              var mem = data.teamMembers[m];
              var mName = mem.name || (typeof mem === "string" ? mem : "");
              if (!mName && !mem.email) continue;
              newRows.push([
                eventName, teamOrLeaderName, "MEMBER", mName, mem.email || "",
                cleanPhone(mem.phone), mem.collegeName || mem.college || data.collegeName || "",
                feeStatus, txId, screenshot, checkedIn, regDate, teamId
              ]);
            }
          }

          allSheet.getRange(startRow, 1, newRows.length, ALL_HEADERS.length).setValues(newRows);
          allSheet.getRange(startRow, 6, newRows.length, 1).setNumberFormat("@");

          if (newRows.length > 1) {
            var mergeCols = [1, 2, 8, 9, 10, 11, 12, 13];
            for (var mc = 0; mc < mergeCols.length; mc++) {
              allSheet.getRange(startRow, mergeCols[mc], newRows.length, 1).mergeVertically();
            }
          }
          allSheet.getRange(startRow, 1, newRows.length, ALL_HEADERS.length).setVerticalAlignment("middle");
        }
      }

      // 2. Sync to Specific Event Sheet
      var evSheet = getEventSheet(eventName);
      if (evSheet) {
        var evLastRow = evSheet.getLastRow();
        var evMatchIndices = [];

        if (evLastRow > 1) {
          var evValues = evSheet.getRange(2, 1, evLastRow - 1, EVENT_HEADERS.length).getValues();
          for (var eIdx = 0; eIdx < evValues.length; eIdx++) {
            var evRow = evValues[eIdx];
            var evRowTeamId = String(evRow[0] || "").trim();
            var evRowEmail = String(evRow[4] || "").toLowerCase().trim();

            if ((teamId && evRowTeamId === teamId) || (leaderEmail && evRowEmail === leaderEmail)) {
              evMatchIndices.push(eIdx + 2);
            }
          }
        }

        if (evMatchIndices.length > 0) {
          // Edit existing rows in-place
          for (var ek = 0; ek < evMatchIndices.length; ek++) {
            var evRNum = evMatchIndices[ek];
            if (feeStatus) evSheet.getRange(evRNum, 8).setValue(feeStatus);
            if (txId) evSheet.getRange(evRNum, 9).setValue(txId);
            if (screenshot) evSheet.getRange(evRNum, 10).setValue(screenshot);
            if (data.checkedIn !== undefined) evSheet.getRange(evRNum, 11).setValue(checkedIn);
            if (teamId) evSheet.getRange(evRNum, 1).setValue(teamId);
          }
        } else {
          // Append new rows
          var evStartRow = evSheet.getLastRow() + 1;
          var evNewRows = [];

          evNewRows.push([
            teamId, teamOrLeaderName, "LEADER", data.fullName || "", leaderEmail,
            cleanPhone(data.phone), data.collegeName || "", feeStatus, txId, screenshot, checkedIn, regDate
          ]);

          if (Array.isArray(data.teamMembers)) {
            for (var em = 0; em < data.teamMembers.length; em++) {
              var eMem = data.teamMembers[em];
              var emName = eMem.name || (typeof eMem === "string" ? eMem : "");
              if (!emName && !eMem.email) continue;
              evNewRows.push([
                teamId, teamOrLeaderName, "MEMBER", emName, eMem.email || "",
                cleanPhone(eMem.phone), eMem.collegeName || eMem.college || data.collegeName || "",
                feeStatus, txId, screenshot, checkedIn, regDate
              ]);
            }
          }

          evSheet.getRange(evStartRow, 1, evNewRows.length, EVENT_HEADERS.length).setValues(evNewRows);
          evSheet.getRange(evStartRow, 6, evNewRows.length, 1).setNumberFormat("@");

          if (evNewRows.length > 1) {
            var evMergeCols = [1, 2, 8, 9, 10, 11, 12];
            for (var emc = 0; emc < evMergeCols.length; emc++) {
              evSheet.getRange(evStartRow, evMergeCols[emc], evNewRows.length, 1).mergeVertically();
            }
          }
          evSheet.getRange(evStartRow, 1, evNewRows.length, EVENT_HEADERS.length).setVerticalAlignment("middle");
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
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
