function testSuite() {

  run();

  function run() {
    testRowCreation();
  }

  // -----------------------
  // ----- test cases ------
  // -----------------------

  function testRowCreation() {
    // define data
    sheet = getSheet(SHEET_NAME);
    var event = {
        "parameter": {
        "name": "Tim",
        "comment": "love it",
        "sex": "male",
        "email": "tim@example.com",
        "favorite_meal": "burgers",
        "hobby2": "sleeping",
        "some_parameter": "that should not be part of the result"
      }
    };

    // create new row
    var last_row_index_before = sheet.getLastRow();
    var response = doPost(event);

    var last_row_index_after = sheet.getLastRow();
    var last_row_after_display_values = sheet.getRange(last_row_index_after, 1, 1, 8).getDisplayValues()[0];

    // expect row was created with correct display values
    var rowCreated = expectEqual("expect number of rows to grow by 1", last_row_index_before + 1, last_row_index_after);
    expectArrayEqual("expect correct display values", last_row_after_display_values, ["06/04/2016", "Tim", "love it", "male", "tim@example.com", "burgers", "undefined", "sleeping"]);
    Logger.log("Result of testRowCreation: " + JSON.stringify(JSON.parse(response.getContent())));

    // clean up if row creation was succesfull
    if (rowCreated) {
      sheet.deleteRow(last_row_index_after);
    }
  }

  // -----------------------
  // -- expection helpers --
  // -----------------------

  function expectEqual(name, arg1, arg2) {
    if (arg1 == arg2) {
      Logger.log("SUCCESS: " + name);
      return true;
    } else {
      Logger.log("FAIL: " + name);
      return false;
    }
  }

  function expectArrayEqual(name, array1, array2) {
    var isEqual = (array1.length == array2.length) && array1.every(function(element, index) { return element == array2[index] })
    return expectEqual(name, isEqual, true);
  }
}
