/**
 * PORTFOLIO LIKES & ANALYTICS - GOOGLE APPS SCRIPT BACKEND
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new) logged in with your Google account.
 * 2. Rename the sheet to "Portfolio Likes & Analytics" (or any name you like).
 * 3. In the menu, click: Extensions > Apps Script
 * 4. Delete any code in Code.gs and paste ALL the code below.
 * 5. Run setupSheet() once (click Run at the top) to initialize the columns and authentic likes.
 * 6. Click Deploy > New deployment:
 *    - Click the Gear icon next to "Select type" and choose "Web app"
 *    - Description: "Portfolio Likes API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"  <-- IMPORTANT!
 * 7. Click Deploy, Authorize access, and copy the "Web app URL" (ends in /exec).
 * 8. Paste that URL into main.js in the GOOGLE_SHEET_API_URL variable.
 */

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Summary Sheet (Excel-style table of all projects & likes)
  let summarySheet = ss.getSheetByName("Summary");
  if (!summarySheet) {
    summarySheet = ss.insertSheet("Summary", 0);
  }
  summarySheet.clear();
  summarySheet.appendRow(["Project ID", "Project Name", "Total Likes", "Last Updated"]);
  summarySheet.getRange("A1:D1").setFontWeight("bold").setBackground("#CCFF00").setFontColor("#000000");
  
  const initialData = [
    ["gaurdian", "Gaurdian (Case Study)", 64, new Date()],
    ["valueline", "Valueline (3D Experience)", 56, new Date()],
    ["pixelgame", "Visual Craft (2D Game)", 45, new Date()],
    ["redthumb", "RedThumb3D (Pokémon Store)", 31, new Date()],
    ["aura", "AURA Earbud (3D Acoustics)", 61, new Date()]
  ];
  
  initialData.forEach(row => summarySheet.appendRow(row));
  summarySheet.autoResizeColumns(1, 4);

  // 2. Setup Activity Log Sheet (Stores every live like/unlike action with timestamp)
  let logSheet = ss.getSheetByName("Activity Log");
  if (!logSheet) {
    logSheet = ss.insertSheet("Activity Log", 1);
  }
  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow(["Timestamp", "Project ID", "Action", "Total Likes", "Device / Notes"]);
    logSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#111111").setFontColor("#FFFFFF");
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let summarySheet = ss.getSheetByName("Summary");
  if (!summarySheet) {
    setupSheet();
    summarySheet = ss.getSheetByName("Summary");
  }

  // Handle live like/unlike update
  if (e && e.parameter && e.parameter.action === "like") {
    const projectId = e.parameter.project;
    const delta = parseInt(e.parameter.delta, 10) || 1;
    
    const data = summarySheet.getDataRange().getValues();
    let updatedCount = null;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === projectId) {
        let currentLikes = parseInt(data[i][2], 10) || 0;
        currentLikes = Math.max(0, currentLikes + delta);
        summarySheet.getRange(i + 1, 3).setValue(currentLikes);
        summarySheet.getRange(i + 1, 4).setValue(new Date());
        updatedCount = currentLikes;
        break;
      }
    }

    // Append to live Activity Log
    let logSheet = ss.getSheetByName("Activity Log");
    if (logSheet) {
      logSheet.appendRow([new Date(), projectId, delta > 0 ? "LIKE" : "UNLIKE", updatedCount, e.parameter.info || "Web Visitor"]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      project: projectId,
      likes: updatedCount
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Return all likes as JSON
  const data = summarySheet.getDataRange().getValues();
  const likesObj = {};
  for (let i = 1; i < data.length; i++) {
    const id = data[i][0];
    const likes = parseInt(data[i][2], 10) || 0;
    if (id) likesObj[id] = likes;
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    likes: likesObj
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  return doGet(e);
}
