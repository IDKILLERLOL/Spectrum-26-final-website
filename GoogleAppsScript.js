function doPost(e) {
  // Concurrency Lock: Ensure deterministic, serialized executions
  var lock = LockService.getScriptLock();
  var hasLock = false;
  try {
    hasLock = lock.tryLock(30000); // 30 second lock wait
  } catch (err) {
    hasLock = false;
  }

  if (!hasLock) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Server busy: Could not acquire script lock within 30s"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var data = {};
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Invalid JSON body: " + parseErr.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Security check: validate API key
    var SECRET_KEY = "ishaandagoat";
    if (!data.apiKey || data.apiKey !== SECRET_KEY) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Unauthorized: Invalid or missing API key"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. Handle Email Dispatching
    if (data.type === "email") {
      GmailApp.sendEmail(data.to, data.subject, data.text, {
        htmlBody: data.html,
        name: "SPECTRUM 26"
      });
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "email"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Handle Google Sheet Operations
    var spreadsheetId = data.spreadsheetId;
    if (!spreadsheetId) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Missing spreadsheetId"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.openById(spreadsheetId);

    // Flat, sortable, machine-readable headers (NO MERGED CELLS)
    var ALL_HEADERS = [
      "Team ID", "Event Name", "Team Name", "Role", "Name", "Email", 
      "Phone", "College", "Fee Status", "Transaction ID / Ref", 
      "Payment Screenshot", "Checked In", "Registered At"
    ];

    var EVENT_HEADERS = [
      "Team ID", "Team Name", "Role", "Name", "Email", 
      "Phone", "College", "Fee Status", "Transaction ID / Ref", 
      "Payment Screenshot", "Checked In", "Registered At"
    ];

    // Explicit deterministic mapping for event sheets
    var EVENT_SHEET_MAP = {
      "singularity-strike": "Singularity Strike",
      "singularity_strike": "Singularity Strike",
      "singularity strike": "Singularity Strike",
      "code clash": "Singularity Strike",
      "code_clash": "Singularity Strike",
      "tech-solo-1": "Singularity Strike",
      "dual-debug": "Dual Debug",
      "dual_debug": "Dual Debug",
      "dual debug": "Dual Debug",
      "tech-duo-1": "Dual Debug",
      "fc26": "FC 26",
      "fc_26": "FC 26",
      "fc 26": "FC 26",
      "ea fc 26": "FC 26",
      "ea fc": "FC 26",
      "fifa": "FC 26",
      "non-tech-1": "FC 26",
      "bgmi": "BGMI",
      "non-tech-3": "BGMI"
    };

    var CONFIGURED_EVENT_SHEETS = ["Singularity Strike", "Dual Debug", "FC 26", "BGMI"];

    function resolveEventSheetName(rawEventName) {
      if (!rawEventName) return null;
      var key = String(rawEventName).toLowerCase().trim();
      if (EVENT_SHEET_MAP.hasOwnProperty(key)) {
        return EVENT_SHEET_MAP[key];
      }
      return null;
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
      if (str.charAt(0) === "=" || str.charAt(0) === "+" || str.charAt(0) === "@" || str.charAt(0) === "-") {
        return "'" + str;
      }
      return str;
    }

    function ensureHeader(sheet, headers) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#0B192C")
        .setFontColor("#FFFFFF")
        .setVerticalAlignment("middle");
      sheet.setFrozenRows(1);
    }

    function buildTeamRows(d) {
      var teamId = String(d.teamId || d.id || "").trim();
      var eventName = resolveEventSheetName(d.eventName) || String(d.eventName || "").trim();
      var teamName = String(d.teamName || d.fullName || "").trim();
      var feeStatus = String(d.paymentStatus || d.feeStatus || "PENDING").trim();
      var txId = String(d.paymentRefId || d.upiTransactionRef || "").trim();
      var screenshot = String(d.pictureUrl || d.photoUrl || d.paymentScreenshot || "").trim();
      var checkedIn = (d.checkedIn === true || d.checkedIn === "Yes" || d.checkedIn === "YES") ? "Yes" : "No";
      var regDate = String(d.createdAt || "").trim();

      var allSheetRows = [];
      var eventSheetRows = [];

      // Leader Row
      allSheetRows.push([
        teamId, eventName, teamName, "LEADER", String(d.fullName || d.name || "").trim(),
        String(d.email || d.userEmail || "").trim(), cleanPhone(d.phone),
        String(d.collegeName || d.college || "").trim(), feeStatus, txId, screenshot, checkedIn, regDate
      ]);

      eventSheetRows.push([
        teamId, teamName, "LEADER", String(d.fullName || d.name || "").trim(),
        String(d.email || d.userEmail || "").trim(), cleanPhone(d.phone),
        String(d.collegeName || d.college || "").trim(), feeStatus, txId, screenshot, checkedIn, regDate
      ]);

      // Member Rows
      var rawMembers = Array.isArray(d.teamMembers) ? d.teamMembers : [];
      for (var m = 0; m < rawMembers.length; m++) {
        var mem = rawMembers[m];
        if (typeof mem === "string") {
          try { mem = JSON.parse(mem); } catch(e) { mem = { name: mem }; }
        }
        var mName = String(mem.name || "").trim();
        var mEmail = String(mem.email || "").trim();
        if (!mName && !mEmail) continue;

        var mPhone = cleanPhone(mem.phone);
        var mCollege = String(mem.collegeName || mem.college || d.collegeName || d.college || "").trim();

        allSheetRows.push([
          teamId, eventName, teamName, "MEMBER", mName, mEmail, mPhone, mCollege,
          feeStatus, txId, screenshot, checkedIn, regDate
        ]);

        eventSheetRows.push([
          teamId, teamName, "MEMBER", mName, mEmail, mPhone, mCollege,
          feeStatus, txId, screenshot, checkedIn, regDate
        ]);
      }

      return {
        teamId: teamId,
        eventName: eventName,
        allSheetRows: allSheetRows,
        eventSheetRows: eventSheetRows
      };
    }

    function deleteTeamRowsFromSheet(sheet) {
      // Helper to remove rows by Team ID (Col 1)
      return function(targetTeamId) {
        if (!sheet || !targetTeamId) return 0;
        var lastRow = sheet.getLastRow();
        if (lastRow <= 1) return 0;
        var vals = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        var removed = 0;
        for (var r = vals.length - 1; r >= 0; r--) {
          if (String(vals[r][0] || "").trim() === targetTeamId) {
            sheet.deleteRow(r + 2);
            removed++;
          }
        }
        return removed;
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. FULL SYNC: Complete deterministic rebuild of all sheets (NO MERGES)
    // ─────────────────────────────────────────────────────────────────────────
    if (data.type === "full_sync") {
      var allRows = data.allRows || [];
      var teams = data.teams || [];

      // A. Rebuild Master Sheet: "All Registrations"
      var allSheet = ss.getSheetByName("All Registrations");
      if (!allSheet) allSheet = ss.insertSheet("All Registrations");
      allSheet.clear();
      ensureHeader(allSheet, ALL_HEADERS);

      if (allRows.length > 0) {
        var sanitizedAllRows = allRows.map(function(r) {
          var rowArr = [];
          for (var c = 0; c < ALL_HEADERS.length; c++) {
            rowArr.push(sanitizeCell(r[c], c === 6)); // Col 7 (idx 6) is Phone
          }
          return rowArr;
        });

        allSheet.getRange(2, 7, sanitizedAllRows.length, 1).setNumberFormat("@");
        allSheet.getRange(2, 1, sanitizedAllRows.length, ALL_HEADERS.length).setValues(sanitizedAllRows);
        allSheet.getRange(2, 1, sanitizedAllRows.length, ALL_HEADERS.length).setVerticalAlignment("middle");
      }

      // B. Group rows by resolved event name
      var eventMap = {};
      for (var k = 0; k < CONFIGURED_EVENT_SHEETS.length; k++) {
        eventMap[CONFIGURED_EVENT_SHEETS[k]] = [];
      }

      for (var t = 0; t < teams.length; t++) {
        var teamData = buildTeamRows(teams[t]);
        var resolvedEv = resolveEventSheetName(teamData.eventName);
        if (resolvedEv && eventMap.hasOwnProperty(resolvedEv)) {
          for (var er = 0; er < teamData.eventSheetRows.length; er++) {
            eventMap[resolvedEv].push(teamData.eventSheetRows[er]);
          }
        }
      }

      // C. Rebuild every configured event sheet
      var syncedCount = 0;
      for (var evIdx = 0; evIdx < CONFIGURED_EVENT_SHEETS.length; evIdx++) {
        var sheetName = CONFIGURED_EVENT_SHEETS[evIdx];
        var evSheet = ss.getSheetByName(sheetName);
        if (!evSheet) evSheet = ss.insertSheet(sheetName);
        evSheet.clear();
        ensureHeader(evSheet, EVENT_HEADERS);

        var evRows = eventMap[sheetName] || [];
        if (evRows.length > 0) {
          var sanitizedEvRows = evRows.map(function(r) {
            return r.map(function(cell, idx) { return sanitizeCell(cell, idx === 5); }); // Col 6 (idx 5) is Phone
          });

          evSheet.getRange(2, 6, sanitizedEvRows.length, 1).setNumberFormat("@");
          evSheet.getRange(2, 1, sanitizedEvRows.length, EVENT_HEADERS.length).setValues(sanitizedEvRows);
          evSheet.getRange(2, 1, sanitizedEvRows.length, EVENT_HEADERS.length).setVerticalAlignment("middle");
        }
        syncedCount++;
      }

      // D. Clean stale legacy sheets if present (e.g. FIFA)
      var legacySheets = ["FIFA", "EA FC 26"];
      for (var ls = 0; ls < legacySheets.length; ls++) {
        var legacy = ss.getSheetByName(legacySheets[ls]);
        if (legacy && legacy.getSheetName() !== "FC 26") {
          try { legacy.clear(); } catch(e) {}
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "full_sync",
        totalTeams: teams.length,
        totalAllRows: allRows.length,
        eventSheetsSynced: syncedCount
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. INDIVIDUAL DELETE: Delete all rows matching Team ID
    // ─────────────────────────────────────────────────────────────────────────
    if (data.type === "delete_registration" || data.action === "delete") {
      var delTeamId = String(data.teamId || data.id || "").trim();
      if (!delTeamId) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Team ID is required for delete operation"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var totalRemoved = 0;

      // Remove from All Registrations
      var allSh = ss.getSheetByName("All Registrations");
      if (allSh) totalRemoved += deleteTeamRowsFromSheet(allSh)(delTeamId);

      // Remove from all event sheets
      for (var es = 0; es < CONFIGURED_EVENT_SHEETS.length; es++) {
        var evSh = ss.getSheetByName(CONFIGURED_EVENT_SHEETS[es]);
        if (evSh) totalRemoved += deleteTeamRowsFromSheet(evSh)(delTeamId);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "delete_registration",
        teamId: delTeamId,
        rowsRemoved: totalRemoved
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. INDIVIDUAL CREATE / EDIT: Atomic full-team replacement by Team ID
    // ─────────────────────────────────────────────────────────────────────────
    if (data.type === "registration" || data.type === "edit_registration") {
      var reqTeamId = String(data.teamId || data.id || "").trim();
      if (!reqTeamId) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Team ID is required for registration/edit operation"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var parsedTeam = buildTeamRows(data);
      var targetEvName = resolveEventSheetName(parsedTeam.eventName);
      if (!targetEvName) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Unknown or unconfigured event: " + parsedTeam.eventName,
          teamId: reqTeamId
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var removedCount = 0;

      // A. Remove existing rows for this Team ID from All Registrations
      var masterSheet = ss.getSheetByName("All Registrations");
      if (!masterSheet) {
        masterSheet = ss.insertSheet("All Registrations");
        ensureHeader(masterSheet, ALL_HEADERS);
      }
      removedCount += deleteTeamRowsFromSheet(masterSheet)(reqTeamId);

      // Append new complete team rows to All Registrations
      var masterStartRow = masterSheet.getLastRow() + 1;
      var sanitizedMaster = parsedTeam.allSheetRows.map(function(r) {
        return r.map(function(cell, idx) { return sanitizeCell(cell, idx === 6); });
      });

      masterSheet.getRange(masterStartRow, 1, sanitizedMaster.length, ALL_HEADERS.length).setValues(sanitizedMaster);
      masterSheet.getRange(masterStartRow, 7, sanitizedMaster.length, 1).setNumberFormat("@");
      masterSheet.getRange(masterStartRow, 1, sanitizedMaster.length, ALL_HEADERS.length).setVerticalAlignment("middle");

      // B. Remove existing rows for this Team ID from ALL event sheets (handles event reassignment)
      for (var eIndex = 0; eIndex < CONFIGURED_EVENT_SHEETS.length; eIndex++) {
        var checkSh = ss.getSheetByName(CONFIGURED_EVENT_SHEETS[eIndex]);
        if (checkSh) removedCount += deleteTeamRowsFromSheet(checkSh)(reqTeamId);
      }

      // Append new complete team rows to Target Event Sheet
      var targetSheet = ss.getSheetByName(targetEvName);
      if (!targetSheet) {
        targetSheet = ss.insertSheet(targetEvName);
        ensureHeader(targetSheet, EVENT_HEADERS);
      }

      var eventStartRow = targetSheet.getLastRow() + 1;
      var sanitizedEvent = parsedTeam.eventSheetRows.map(function(r) {
        return r.map(function(cell, idx) { return sanitizeCell(cell, idx === 5); });
      });

      targetSheet.getRange(eventStartRow, 1, sanitizedEvent.length, EVENT_HEADERS.length).setValues(sanitizedEvent);
      targetSheet.getRange(eventStartRow, 6, sanitizedEvent.length, 1).setNumberFormat("@");
      targetSheet.getRange(eventStartRow, 1, sanitizedEvent.length, EVENT_HEADERS.length).setVerticalAlignment("middle");

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: data.type === "edit_registration" || data.action === "edit" ? "edit_registration" : "create_registration",
        teamId: reqTeamId,
        rowsWritten: parsedTeam.allSheetRows.length,
        rowsRemoved: removedCount
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      action: "noop"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
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
