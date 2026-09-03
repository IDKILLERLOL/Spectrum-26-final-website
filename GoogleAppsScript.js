/**
 * Spectrum 26 — Google Sheets Sync Apps Script
 *
 * Schema — All Registrations (11 cols, no Team ID, no Payment Screenshot):
 *   Event Name | Team Name | Role | Name | Email | Phone | College | Fee Status | Transaction ID / Ref | Checked In | Registered At
 *
 * Schema — Event Sheets (10 cols, no Event Name, no Team ID, no Payment Screenshot):
 *   Team Name | Role | Name | Email | Phone | College | Fee Status | Transaction ID / Ref | Checked In | Registered At
 *
 * Identity key for delete/replace: Team Name (unique, enforced by registration form)
 */

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

    // Flat, machine-readable headers — NO Team ID, NO Payment Screenshot
    // All Registrations (11 cols): includes Event Name
    var ALL_HEADERS = [
      "Event Name", "Team Name", "Role", "Name", "Email",
      "Phone", "College", "Fee Status", "Transaction ID / Ref",
      "Checked In", "Registered At"
    ];
    var ALL_PHONE_COL     = 5; // 0-based index of Phone in ALL_HEADERS
    var ALL_TEAM_NAME_COL = 1; // 0-based index of Team Name in ALL_HEADERS (delete key)

    // Event Sheets (10 cols): no Event Name column
    var EVENT_HEADERS = [
      "Team Name", "Role", "Name", "Email", "Phone",
      "College", "Fee Status", "Transaction ID / Ref",
      "Checked In", "Registered At"
    ];
    var EVENT_PHONE_COL     = 4; // 0-based index of Phone in EVENT_HEADERS
    var EVENT_TEAM_NAME_COL = 0; // 0-based index of Team Name in EVENT_HEADERS (delete key)

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
      if (EVENT_SHEET_MAP.hasOwnProperty(key)) return EVENT_SHEET_MAP[key];
      // Fallback: direct match (case-insensitive)
      for (var i = 0; i < CONFIGURED_EVENT_SHEETS.length; i++) {
        if (CONFIGURED_EVENT_SHEETS[i].toLowerCase() === key) return CONFIGURED_EVENT_SHEETS[i];
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
      if (str.charAt(0) === "=" || str.charAt(0) === "@" || str.charAt(0) === "-") {
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

    /**
     * Builds flat row arrays for a registration.
     *
     * allSheetRow:   [Event Name, Team Name, Role, Name, Email, Phone, College, Fee Status, Txn ID, Checked In, Reg At]
     * eventSheetRow: [Team Name, Role, Name, Email, Phone, College, Fee Status, Txn ID, Checked In, Reg At]
     */
    function buildTeamRows(d) {
      var eventName = resolveEventSheetName(d.eventName) || String(d.eventName || "").trim();
      var teamName  = String(d.teamName || d.fullName || "").trim();
      var feeStatus = String(d.paymentStatus || d.feeStatus || "PENDING").trim();
      var txId      = String(d.paymentRefId || d.upiTransactionRef || "").trim();
      var checkedIn = (d.checkedIn === true || d.checkedIn === "Yes" || d.checkedIn === "YES") ? "Yes" : "No";
      var regDate   = String(d.createdAt || "").trim();

      var leaderName    = String(d.fullName || d.name || "").trim();
      var leaderEmail   = String(d.email || d.userEmail || "").trim();
      var leaderPhone   = cleanPhone(d.phone);
      var leaderCollege = String(d.collegeName || d.college || "").trim();

      var allSheetRows   = [];
      var eventSheetRows = [];

      // Leader row
      allSheetRows.push([
        eventName, teamName, "LEADER", leaderName, leaderEmail,
        leaderPhone, leaderCollege, feeStatus, txId, checkedIn, regDate
      ]);
      eventSheetRows.push([
        teamName, "LEADER", leaderName, leaderEmail,
        leaderPhone, leaderCollege, feeStatus, txId, checkedIn, regDate
      ]);

      // Member rows
      var rawMembers = Array.isArray(d.teamMembers) ? d.teamMembers : [];
      for (var mi = 0; mi < rawMembers.length; mi++) {
        var mem = rawMembers[mi];
        if (typeof mem === "string") {
          try { mem = JSON.parse(mem); } catch(ex) { mem = { name: mem }; }
        }
        var mName    = String(mem.name || "").trim();
        var mEmail   = String(mem.email || "").trim();
        if (!mName && !mEmail) continue;
        var mPhone   = cleanPhone(mem.phone);
        var mCollege = String(mem.collegeName || mem.college || d.collegeName || d.college || "").trim();

        allSheetRows.push([
          eventName, teamName, "MEMBER", mName, mEmail,
          mPhone, mCollege, feeStatus, txId, checkedIn, regDate
        ]);
        eventSheetRows.push([
          teamName, "MEMBER", mName, mEmail,
          mPhone, mCollege, feeStatus, txId, checkedIn, regDate
        ]);
      }

      // Substitute row — only post if substitute was provided, otherwise keep Google Sheets blank
      if (d.substitute && typeof d.substitute === "object") {
        var subName    = String(d.substitute.name || "").trim();
        var subEmail   = String(d.substitute.email || "").trim();
        if (subName || subEmail) {
          var subPhone   = cleanPhone(d.substitute.phone);
          var subCollege = String(d.substitute.collegeName || d.substitute.college || "").trim();
          allSheetRows.push([
            eventName, teamName, "SUBSTITUTE", subName, subEmail,
            subPhone, subCollege, feeStatus, txId, checkedIn, regDate
          ]);
          eventSheetRows.push([
            teamName, "SUBSTITUTE", subName, subEmail,
            subPhone, subCollege, feeStatus, txId, checkedIn, regDate
          ]);
        }
      }

      return {
        teamName:       teamName,
        eventName:      eventName,
        allSheetRows:   allSheetRows,
        eventSheetRows: eventSheetRows
      };
    }

    /**
     * Deletes all rows from sheet where column teamNameColIdx (0-based) equals targetTeamName.
     * Iterates backwards to keep row indices stable after deletions.
     * Returns count of deleted rows.
     */
    function deleteTeamRowsByName(sheet, targetTeamName, teamNameColIdx) {
      if (!sheet || !targetTeamName) return 0;
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) return 0;
      var numDataRows = lastRow - 1;
      var vals = sheet.getRange(2, teamNameColIdx + 1, numDataRows, 1).getValues();
      var removed = 0;
      for (var r = vals.length - 1; r >= 0; r--) {
        if (String(vals[r][0] || "").trim() === targetTeamName) {
          sheet.deleteRow(r + 2); // +2: 1-based + header row offset
          removed++;
        }
      }
      return removed;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. FULL SYNC: Complete deterministic rebuild of all sheets
    // ─────────────────────────────────────────────────────────────────────────
    if (data.type === "full_sync") {
      var allRows = data.allRows || [];
      var teams   = data.teams   || [];

      // A. Rebuild All Registrations
      var allSheet = ss.getSheetByName("All Registrations");
      if (!allSheet) allSheet = ss.insertSheet("All Registrations");
      allSheet.clear();
      ensureHeader(allSheet, ALL_HEADERS);

      if (allRows.length > 0) {
        var sanitizedAllRows = allRows.map(function(r) {
          return r.map(function(cell, idx) {
            return sanitizeCell(cell, idx === ALL_PHONE_COL);
          });
        });
        allSheet.getRange(2, ALL_PHONE_COL + 1, sanitizedAllRows.length, 1).setNumberFormat("@");
        allSheet.getRange(2, 1, sanitizedAllRows.length, ALL_HEADERS.length).setValues(sanitizedAllRows);
        allSheet.getRange(2, 1, sanitizedAllRows.length, ALL_HEADERS.length).setVerticalAlignment("middle");
      }

      // B. Group event-sheet rows by resolved event name
      var eventMap = {};
      for (var k = 0; k < CONFIGURED_EVENT_SHEETS.length; k++) {
        eventMap[CONFIGURED_EVENT_SHEETS[k]] = [];
      }
      for (var t = 0; t < teams.length; t++) {
        var teamData  = buildTeamRows(teams[t]);
        var resolvedEv = resolveEventSheetName(teamData.eventName);
        if (resolvedEv && eventMap.hasOwnProperty(resolvedEv)) {
          for (var er = 0; er < teamData.eventSheetRows.length; er++) {
            eventMap[resolvedEv].push(teamData.eventSheetRows[er]);
          }
        }
      }

      // C. Rebuild each configured event sheet
      var syncedCount = 0;
      for (var evIdx = 0; evIdx < CONFIGURED_EVENT_SHEETS.length; evIdx++) {
        var sheetName = CONFIGURED_EVENT_SHEETS[evIdx];
        var evSheet   = ss.getSheetByName(sheetName);
        if (!evSheet) evSheet = ss.insertSheet(sheetName);
        evSheet.clear();
        ensureHeader(evSheet, EVENT_HEADERS);

        var evRows = eventMap[sheetName] || [];
        if (evRows.length > 0) {
          var sanitizedEvRows = evRows.map(function(r) {
            return r.map(function(cell, idx) { return sanitizeCell(cell, idx === EVENT_PHONE_COL); });
          });
          evSheet.getRange(2, EVENT_PHONE_COL + 1, sanitizedEvRows.length, 1).setNumberFormat("@");
          evSheet.getRange(2, 1, sanitizedEvRows.length, EVENT_HEADERS.length).setValues(sanitizedEvRows);
          evSheet.getRange(2, 1, sanitizedEvRows.length, EVENT_HEADERS.length).setVerticalAlignment("middle");
        }
        syncedCount++;
      }

      // D. Clean stale legacy sheet names
      var legacySheets = ["FIFA", "EA FC 26"];
      for (var ls = 0; ls < legacySheets.length; ls++) {
        var legacy = ss.getSheetByName(legacySheets[ls]);
        if (legacy) { try { legacy.clear(); } catch(e) {} }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status:            "success",
        action:            "full_sync",
        totalTeams:        teams.length,
        totalAllRows:      allRows.length,
        eventSheetsSynced: syncedCount
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. DELETE: Remove all rows for a Team Name across all sheets
    // ─────────────────────────────────────────────────────────────────────────
    if (data.type === "delete_registration" || data.action === "delete") {
      var delTeamName = String(data.teamName || "").trim();
      if (!delTeamName) {
        return ContentService.createTextOutput(JSON.stringify({
          status:  "error",
          message: "teamName is required for delete operation"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var totalRemoved = 0;

      var allSh = ss.getSheetByName("All Registrations");
      if (allSh) totalRemoved += deleteTeamRowsByName(allSh, delTeamName, ALL_TEAM_NAME_COL);

      for (var es = 0; es < CONFIGURED_EVENT_SHEETS.length; es++) {
        var evSh = ss.getSheetByName(CONFIGURED_EVENT_SHEETS[es]);
        if (evSh) totalRemoved += deleteTeamRowsByName(evSh, delTeamName, EVENT_TEAM_NAME_COL);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status:      "success",
        action:      "delete_registration",
        teamName:    delTeamName,
        rowsRemoved: totalRemoved
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. CREATE / EDIT: Atomic full-team replacement by Team Name
    // ─────────────────────────────────────────────────────────────────────────
    if (data.type === "registration" || data.type === "edit_registration") {
      var reqTeamName = String(data.teamName || data.fullName || "").trim();
      if (!reqTeamName) {
        return ContentService.createTextOutput(JSON.stringify({
          status:  "error",
          message: "teamName is required for registration/edit operation"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var parsedTeam   = buildTeamRows(data);
      var targetEvName = resolveEventSheetName(parsedTeam.eventName);
      if (!targetEvName) {
        return ContentService.createTextOutput(JSON.stringify({
          status:   "error",
          message:  "Unknown or unconfigured event: " + parsedTeam.eventName,
          teamName: reqTeamName
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var removedCount = 0;

      // A. Replace in All Registrations
      var masterSheet = ss.getSheetByName("All Registrations");
      if (!masterSheet) {
        masterSheet = ss.insertSheet("All Registrations");
        ensureHeader(masterSheet, ALL_HEADERS);
      }
      removedCount += deleteTeamRowsByName(masterSheet, reqTeamName, ALL_TEAM_NAME_COL);

      var masterStartRow = masterSheet.getLastRow() + 1;
      var sanitizedMaster = parsedTeam.allSheetRows.map(function(r) {
        return r.map(function(cell, idx) { return sanitizeCell(cell, idx === ALL_PHONE_COL); });
      });
      masterSheet.getRange(masterStartRow, 1, sanitizedMaster.length, ALL_HEADERS.length).setValues(sanitizedMaster);
      masterSheet.getRange(masterStartRow, ALL_PHONE_COL + 1, sanitizedMaster.length, 1).setNumberFormat("@");
      masterSheet.getRange(masterStartRow, 1, sanitizedMaster.length, ALL_HEADERS.length).setVerticalAlignment("middle");

      // B. Replace in all event sheets (handles event reassignment edge case)
      for (var eIndex = 0; eIndex < CONFIGURED_EVENT_SHEETS.length; eIndex++) {
        var checkSh = ss.getSheetByName(CONFIGURED_EVENT_SHEETS[eIndex]);
        if (checkSh) removedCount += deleteTeamRowsByName(checkSh, reqTeamName, EVENT_TEAM_NAME_COL);
      }

      var targetSheet = ss.getSheetByName(targetEvName);
      if (!targetSheet) {
        targetSheet = ss.insertSheet(targetEvName);
        ensureHeader(targetSheet, EVENT_HEADERS);
      }

      var eventStartRow = targetSheet.getLastRow() + 1;
      var sanitizedEvent = parsedTeam.eventSheetRows.map(function(r) {
        return r.map(function(cell, idx) { return sanitizeCell(cell, idx === EVENT_PHONE_COL); });
      });
      targetSheet.getRange(eventStartRow, 1, sanitizedEvent.length, EVENT_HEADERS.length).setValues(sanitizedEvent);
      targetSheet.getRange(eventStartRow, EVENT_PHONE_COL + 1, sanitizedEvent.length, 1).setNumberFormat("@");
      targetSheet.getRange(eventStartRow, 1, sanitizedEvent.length, EVENT_HEADERS.length).setVerticalAlignment("middle");

      var isEdit = (data.type === "edit_registration" || data.action === "edit");
      return ContentService.createTextOutput(JSON.stringify({
        status:      "success",
        action:      isEdit ? "edit_registration" : "create_registration",
        teamName:    reqTeamName,
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
      status:  "error",
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
