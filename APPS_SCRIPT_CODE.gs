// ==========================================
// GOOGLE APPS SCRIPT CODE
// ==========================================
// Copy and paste this code into a new Google Apps Script project attached to your Spreadsheet.
// 1. Open your Spreadsheet (ID: 1mi6KizJZDBLT0Tcjf_G-eARcnSJtqfAqwLcmxKAHah8)
// 2. Go to Extensions > Apps Script
// 3. Paste this code into Code.gs
// 4. Click Deploy > New Deployment
// 5. Select type: "Web app"
// 6. Description: "v1"
// 7. Execute as: "Me"
// 8. Who has access: "Anyone" (IMPORTANT for the app to work without login)
// 9. Click Deploy and copy the "Web App URL"
// 10. Paste the URL into the .env file of your frontend application as VITE_GOOGLE_SCRIPT_URL

const SPREADSHEET_ID = '1mi6KizJZDBLT0Tcjf_G-eARcnSJtqfAqwLcmxKAHah8';
const SHEET_RANDOMIZER = 'randomizer';
const SHEET_MAX_MIN = 'max-min';

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (action === 'get_question') {
      return getQuestion(ss, e.parameter.id);
    } else if (action === 'update_number') {
      return updateQuestionNumber(ss, e.parameter.id);
    } else {
      return responseJSON({ status: 'error', message: 'Invalid action' });
    }
  } catch (error) {
    return responseJSON({ status: 'error', message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function getQuestion(ss, searchId) {
  const sheet = ss.getSheetByName(SHEET_RANDOMIZER);
  if (!sheet) return responseJSON({ status: 'error', message: 'Sheet randomizer not found' });

  const data = sheet.getDataRange().getValues();
  // Assuming Row 1 is header: ID | Nomor Soal | Pertanyaan | Media Drive | Media Lainnya
  // ID is column 0 (A)
  
  // Find row with matching ID
  // Skip header (index 0)
  for (let i = 1; i < data.length; i++) {
    // Convert both to string to be safe
    if (String(data[i][0]).trim() === String(searchId).trim()) {
      const row = data[i];
      return responseJSON({
        status: 'success',
        data: {
          id: row[0],
          nomorSoal: row[1],
          pertanyaan: row[2],
          mediaDrive: row[3],
          mediaLainnya: row[4]
        }
      });
    }
  }

  return responseJSON({ status: 'error', message: 'ID not found' });
}

function updateQuestionNumber(ss, searchId) {
  const sheetRandomizer = ss.getSheetByName(SHEET_RANDOMIZER);
  const sheetMaxMin = ss.getSheetByName(SHEET_MAX_MIN);
  
  if (!sheetRandomizer || !sheetMaxMin) {
    return responseJSON({ status: 'error', message: 'Sheets not found' });
  }

  // 1. Get Max and Min
  const maxMinData = sheetMaxMin.getDataRange().getValues();
  // Assuming Row 1 is header, Row 2 has the data
  // Columns: Nomor Max | Nomor Min | Materi
  // Indexes: 0 | 1 | 2
  
  if (maxMinData.length < 2) {
    return responseJSON({ status: 'error', message: 'No data in max-min sheet' });
  }

  const maxVal = parseInt(maxMinData[1][0]);
  const minVal = parseInt(maxMinData[1][1]);

  if (isNaN(maxVal) || isNaN(minVal)) {
    return responseJSON({ status: 'error', message: 'Invalid Max/Min values' });
  }

  // 2. Generate Random Number
  const randomNum = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;

  // 3. Update Randomizer Sheet
  const data = sheetRandomizer.getDataRange().getValues();
  let updated = false;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(searchId).trim()) {
      // Update "Nomor Soal" which is column index 1 (B)
      // i + 1 because getRange is 1-indexed
      sheetRandomizer.getRange(i + 1, 2).setValue(randomNum);
      updated = true;
      break;
    }
  }

  if (updated) {
    return responseJSON({ 
      status: 'success', 
      message: 'Number updated', 
      newNumber: randomNum 
    });
  } else {
    return responseJSON({ status: 'error', message: 'ID not found for update' });
  }
}

function responseJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
