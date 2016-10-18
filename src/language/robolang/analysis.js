/*
 * Static analyses on Robolang code (in the AST level).
 */

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
                function(root) {
                  if (!counts.hasOwnProperty(root.type.name)) {
                    counts[root.type.name] = 1;
                  } else {
                    counts[root.type.name]++;
                  }
                });

    return counts;
}

module.exports = {
  countNodeTypes: countNodeTypes,
};
