/*
 * Automated tests for robolang.
 */

var Robolang = require("../robolang");
var assert = require("assert");

function testBasicSyntax() {
  var interpreter = new Robolang.Interpreter();
  interpreter.parse("2{ 3{R R} LLRL}");

  var actions = [];
  var lastAction = null;

  do {
    if (lastAction) {
      actions.push(lastAction);
    }
    lastAction = interpreter.runUntilNextAction();
  } while (lastAction !== null);

  assert.equal(
      actions.join(""),
      [/* 3{RR} generates 6 R's */
       "R","R","R","R","R","R",
       /* LLRL */
       "L","L","R","L",
       /* Same as before */
       "R","R","R","R","R","R",
       "L","L","R","L"].join(""));
}

module.exports = {
  tests: [
    testBasicSyntax,
  ],
};
