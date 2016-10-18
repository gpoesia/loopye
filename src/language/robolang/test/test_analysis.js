/*
 * Tests for the static analyses.
 */

var Robolang = require("../robolang");
var Parser = require("../parser");
var Analysis = require("../analysis");
var assert = require("assert");

function testNodeTypeCountAnalysis() {
  var program =
    Robolang.ParseRobolangProgram("2{ ENQ(x){Q} 3{XY} a?{b?{ZW} K c?{X}}}");
  assert.equal(true, program instanceof Robolang.RobolangProgram);

  var counts = Analysis.countNodeTypes(program);

  assert.equal(1, counts[Parser.ASTNodeTypes.CONDITIONAL_LOOP.name]);
  assert.equal(2, counts[Parser.ASTNodeTypes.LOOP.name]);
  assert.equal(3, counts[Parser.ASTNodeTypes.CONDITIONAL.name]);
  assert.equal(7, counts[Parser.ASTNodeTypes.ACTION.name]);
}

module.exports = {
  tests: [
    testNodeTypeCountAnalysis,
  ],
};
