/*
 * Tests for the static analyses.
 */

var Robolang = require("../robolang");
var Parser = require("../parser");
var Analysis = require("../analysis");
var assert = require("assert");

function testNodeTypeCountAnalysis() {
  var program =
    Robolang.CompileRobolangProgram("2{ enquanto x {Q} 3{XY} se a{se b{ZW} K se c{X}}}");
  assert.equal(true, program instanceof Robolang.RobolangProgram);

  var counts = Analysis.countNodeTypes(program);
  assert.equal(1, counts[Parser.ASTNodeTypes.CONDITIONAL_LOOP.name]);
  assert.equal(2, counts[Parser.ASTNodeTypes.LOOP.name]);
  assert.equal(3, counts[Parser.ASTNodeTypes.CONDITIONAL.name]);
  assert.equal(7, counts[Parser.ASTNodeTypes.ACTION.name]);
}

function testMaxLoopTripCount() {
  var program = Robolang.CompileRobolangProgram("20000{X 1000{Y}} 3000{Z}");
  assert.equal(true, program instanceof Robolang.RobolangProgram);
  assert.equal(20000, Analysis.getMaxLoopTripCount(program));

  program = Robolang.CompileRobolangProgram("20000{X 100000{Y}} 3000{Z}");
  assert.equal(true, program instanceof Robolang.RobolangProgram);
  assert.equal(100000, Analysis.getMaxLoopTripCount(program));
}

module.exports = {
  tests: [
    testNodeTypeCountAnalysis,
    testMaxLoopTripCount,
  ],
};
