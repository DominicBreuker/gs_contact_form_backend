// Instructions
//  1. Register the spreadsheet in the properties of the script
//      select "Run -> registerSpreadsheetWithScript" from the menu bar

//  2. Publish the web application
//      select "Publish -> Deploy as web app" from the menu bar
//        - select "execute as me" to make the script run with your user's permissions
//        - select "anyone, even anonymously" to allow anyone on the internet to send data to your script

//  3. Put the web app URL into your javascript snippet on your website
//      you get it after publishing the web app

//  4. Make sure the parameters from your web form match the column names in the google sheet (case sensitive!)

var SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();

function registerSheetWithScript() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = SpreadsheetApp.getActiveSheet();
  SCRIPT_PROPERTIES.setProperty("spreadsheetId", spreadsheet.getId());
  SCRIPT_PROPERTIES.setProperty("sheetName", sheet.getName());

  SpreadsheetApp.getUi().alert('This sheet will now receive data from forms!');
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('FormBackend')
                        .addItem('Register sheet', 'registerSheetWithScript')
                        .addToUi();
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
  var sheet = getSheet();
  var headers = getHeaders(sheet);
  var newRow = createRow(headers, parameters);
  callWithScriptLock(writeRowToSheet, sheet, newRow);
  return newRow;
}

function getSheet() {
  var spreadsheet = SpreadsheetApp.openById(SCRIPT_PROPERTIES.getProperty("spreadsheetId"));
  return spreadsheet.getSheetByName(SCRIPT_PROPERTIES.getProperty("sheetName"));
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


