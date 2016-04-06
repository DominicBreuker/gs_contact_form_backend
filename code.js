// Instructions
//  1. Define the sheet to which data sohuld be logged
//      use the variable below:
var SHEET_NAME = "Sheet1";

//  2. Register the spreadsheet in the properties of the script
//      select "Run -> registerSpreadsheetWithScript" from the menu bar

//  3. Publish the web application
//      select "Publish -> Deploy as web app" from the menu bar
//        - select "execute as me" to make the script run with your user's permissions
//        - select "anyone, even anonymously" to allow anyone on the internet to send data to your script

//  4. Put the web app URL into your javascript snippet on your website
//      you get it after publishing the web app

//  5. Make sure the parameters from your web form match the column names in the google sheet (case sensitive!)

var SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();

function registerSpreadsheetWithScript() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  SCRIPT_PROPERTIES.setProperty("spreadsheetId", spreadsheet.getId());
}

// this is called when you app receives a post request
function doPost(e) {
  try {
    var newRow = createNewRowAndWriteToSheet(e.parameter);
    return JsonFormattedSuccess(newRow.toString());
  } catch(error) {
    return JsonFormattedSuccess(error)
  }
}

// main function creating the row based on the parameters posted to your web app
function createNewRowAndWriteToSheet(parameters) {
  var sheet = getSheet(SHEET_NAME);
  var headers = getHeaders(sheet);
  var newRow = createRow(headers, parameters);
  callWithScriptLock(writeRowToSheet, sheet, newRow);
  return newRow;
}

function getSheet(sheet_name) {
  var spreadsheet = SpreadsheetApp.openById(SCRIPT_PROPERTIES.getProperty("spreadsheetId"));
  return spreadsheet.getSheetByName(sheet_name);
}

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function createRow(headers, parameters) {
  var row = [];

  for (i in headers){
    if (headers[i] == "timestamp"){
      row.push(new Date());
    } else {
      row.push(parameters[headers[i]]);
    }
  }

  return row;
}

function writeRowToSheet(sheet, row) {
  var nextRow = sheet.getLastRow()+1;
  sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
}

// use this around functions writing to your sheet!
function callWithScriptLock(callback, arg1, arg2) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    return callback(arg1, arg2);
  } finally {
    lock.releaseLock();
  }
}

function JsonFormattedSuccess(success_message) {
  return JsonResponse(JSON.stringify({"result":"success", "row": success_message}));
}

function JsonFormattedError(error_message) {
  return JsonResponse(JSON.stringify({"result":"error", "error": error_message}));
}

function JsonResponse(message) {
  return ContentService.createTextOutput(message).setMimeType(ContentService.MimeType.JSON);
}


