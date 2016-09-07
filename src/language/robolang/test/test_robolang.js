/*
 * Automated tests for robolang.
 */

var Robolang = require("../robolang");
var assert = require("assert");

function testBasicSyntax() {
  var interpreter = new Robolang.Interpreter();
  var parseErrors = interpreter.parse("2{ 3{R R} LLRL}");

  assert.equal(parseErrors, null);

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


// Test that the conditional statement is executed when the condition is true.
function testConditionalStatementTrueCondition() {
  var interpreter = new Robolang.Interpreter();
  var parseErrors = interpreter.parse("A B sensor? { C D E } F G");
  assert.equal(parseErrors, null);

  interpreter.getGlobalScope().set("sensor", true);
  var actions = interpreter.run();

  assert.equal(actions.join(" "), "A B C D E F G");
}

// Test that the conditional statement is not executed when the condition is
// false.
function testConditionalStatementFalseCondition() {
  var interpreter = new Robolang.Interpreter();
  var parseErrors = interpreter.parse("A B sensor? { C D E } F G");
  assert.equal(parseErrors, null);

  interpreter.getGlobalScope().set("sensor", false);
  var actions = interpreter.run();

  assert.equal(actions.join(" "), "A B F G");
}


// Test that the code inside a conditional loop is executed while the condition
// is true.
function testConditionalLoopInitiallyTrueCondition(){
  var interpreter = new Robolang.Interpreter()
  var parseErrors = interpreter.parse("A B ENQ(sensor){ C D E } F G");
  assert.equal(parseErrors, null);

  var actions = [];
  var lastAction = null;

  interpreter.getGlobalScope().set("sensor", true);
  for (var i = 0; i < 11; i++) {
    lastAction = interpreter.runUntilNextAction();
    assert.notEqual(lastAction, null);
    actions.push(lastAction);
  }
  interpreter.getGlobalScope().set("sensor", false);
  actions = actions.concat(interpreter.run());

  assert.equal(actions.join(""), "ABCDECDECDEFG");
}

// Test that the code inside a conditional loop is not executed when the
// condition is false.
function testConditionalLoopInitiallyFalseCondition(){
  var interpreter = new Robolang.Interpreter()
  var parseErrors = interpreter.parse("A B ENQ(sensor){ C D E } F G");
  assert.equal(parseErrors, null);

  interpreter.getGlobalScope().set("sensor", false);
  var actions = interpreter.run();

  assert.equal(actions.join(""), "ABFG");
}

module.exports = {
  tests: [
    testBasicSyntax,
    testConditionalStatementTrueCondition,
    testConditionalStatementFalseCondition,
    testConditionalLoopInitiallyTrueCondition,
    testConditionalLoopInitiallyFalseCondition,
  ],
};
