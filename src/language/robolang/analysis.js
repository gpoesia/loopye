/*
 * Static analyses on Robolang code (in the AST level).
 */
var Parser = require("./parser");

/// Traverses the AST in post-order, applying the visitor function to each node.
function traverseAST(root, visitor) {
  for (var i = 0; i < root.children.length; i++) {
    traverseAST(root.children[i], visitor);
  }
  visitor(root);
}

/// Analysis that counts how many nodes of each type a program's AST has.
/// Can be used to determine whether the programmer has used the feature being
/// taught (e.g. conditionals).
function countNodeTypes(program) {
  var root = program.getASTRoot();
  var counts = {};

  traverseAST(root,
              function(node) {
                if (!counts.hasOwnProperty(node.type.name)) {
                  counts[node.type.name] = 1;
                } else {
                  counts[node.type.name]++;
                }
              });

  return counts;
}

function getMaxLoopTripCount(program) {
  var maxLoop = 0;
  traverseAST(program.getASTRoot(),
              function(node) {
                if (node.type.name == Parser.ASTNodeTypes.LOOP.name) {
                  maxLoop = Math.max(maxLoop, node.attributes.tripCount);
                }
              });

  return maxLoop;
}

module.exports = {
  countNodeTypes: countNodeTypes,
  getMaxLoopTripCount: getMaxLoopTripCount,
};
