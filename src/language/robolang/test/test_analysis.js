/*
 * Tests for the static analyses.
 */

var Robolang = require("../robolang");
var Parser = require("../parser");
var Analysis = require("../analysis");
var assert = require("assert");

function testNodeTypeCountAnalysis() {
  var program =
      Robolang.CompileRobolangProgram("2{ enquanto x {Q} 3{XY} se a{se b{ZW} K se c{X}}}",
                                      ["X", "Y", "Q", "Z", "W", "K"],
                                      ["x", "a", "b", "c"]);
  assert.equal(true, program instanceof Robolang.RobolangProgram);

  var counts = Analysis.countNodeTypes(program);
  assert.equal(1, counts[Parser.ASTNodeTypes.CONDITIONAL_LOOP.name]);
  assert.equal(2, counts[Parser.ASTNodeTypes.LOOP.name]);
  assert.equal(3, counts[Parser.ASTNodeTypes.CONDITIONAL.name]);
  assert.equal(7, counts[Parser.ASTNodeTypes.ACTION.name]);
}

function testMaxLoopTripCount() {
  var program = Robolang.CompileRobolangProgram("15{X 10{Y}} 19{Z}",
                                                ["X", "Y", "Z"]);
    assert.equal(true, program instanceof Robolang.RobolangProgram);
  assert.equal(19, Analysis.getMaxLoopTripCount(program).maxLoop);

  program = Robolang.CompileRobolangProgram("10{X 15{Y}} 20{Z}",
                                            ["X", "Y", "Z"]);
  assert.equal(true, program instanceof Robolang.RobolangProgram);
  assert.equal(20, Analysis.getMaxLoopTripCount(program).maxLoop);
}

module.exports = {
  tests: [
    testNodeTypeCountAnalysis,
    testMaxLoopTripCount,
  ],
};
