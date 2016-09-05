/*
 * Language used in the first classes, in which the student controls a robot
 * in a graphical environment.
 */

var Interpreter = require("../interpreter");
var Lexer = require("./lexer");
var Parser = require("./parser");
var Scope = require("../scope");

/// Feature flags: control which language constructs are enabled.
var LOOPS = 1 << 0;

function Robolang(actions, flags) {
  Interpreter.call(this);
  this.actions = actions;
  this.flags = flags;
}

function InterpreterState(globalScope) {
  // Stack of active loop counters.
  this.counters = new Array();
  // Stack of active nodes in the AST traversal.
  this.nodes = new Array();
  // Scope of the current program point.
  this.scope = globalScope;
  // Index of the next child to be visited in each node in `this.nodes`.
  this.nextChildIndex = new Array();
}

Robolang.prototype = Object.create(Interpreter.prototype);
Object.assign(Robolang.prototype, {
  parse: function(code) {
    try {
      var tokens = Lexer.tokenize(code);
      var parserState = new Lexer.TokenStream(tokens);
      var parser = new Parser.ASTProgramNodeParser();
      this.program = parser.parse(parserState);

      this.state = new InterpreterState(this.getGlobalScope());
      this.state.nodes.push(this.program);
      this.state.nextChildIndex.push(0);
    } catch (e) {
      return [e];
    }

    return null;
  },
  runUntilNextAction: function() {
    var nodes = this.state.nodes;
    var currentNode = nodes.length ? nodes[nodes.length - 1] : null;

    while (currentNode !== null &&
           currentNode.type !== Parser.ASTNodeTypes.ACTION) {
      switch (currentNode.type) {
      case Parser.ASTNodeTypes.CONDITIONAL:
        var variable = currentNode.attributes.variable;
        var value = this.state.scope.lookup(variable);

        if (value === undefined) {
          throw "Variable '" + variable + "' was not declared in this scope.";
        } else {
          this.state.nextChildIndex.pop();
          nodes.pop();

          if (value) {
            // A conditional has only one child: a block with the 'then' body.
            nodes.push(currentNode.children[0]);
            this.state.nextChildIndex.push(0);
          }
        }
        break;

      case Parser.ASTNodeTypes.LOOP:
        var counter = this.state.counters[this.state.counters.length - 1];
        var tripCount = currentNode.attributes.tripCount;

        if (counter < tripCount) {
          // Run next iteration: increment loop counter.
          ++this.state.counters[this.state.counters.length - 1];
          // A loop always has only one child: a block with its body.
          nodes.push(currentNode.children[0]);
          this.state.nextChildIndex.push(0);
        } else {
          // Loop ended. Go to parent statement.
          nodes.pop();
          this.state.counters.pop();
          this.state.nextChildIndex.pop();
        }
        break;

      case Parser.ASTNodeTypes.PROGRAM:
      case Parser.ASTNodeTypes.BLOCK:
        var nextChildIndex =
          this.state.nextChildIndex[this.state.nextChildIndex.length - 1];

        // Check whether there are more children to visit.
        if (nextChildIndex === currentNode.children.length) {
          nodes.pop();
          this.state.nextChildIndex.pop();
        } else {
          // Visit next child.
          nodes.push(currentNode.children[nextChildIndex]);
          ++this.state.nextChildIndex[this.state.nextChildIndex.length - 1];
          this.state.nextChildIndex.push(0);

          if (currentNode.children[nextChildIndex].type ===
                Parser.ASTNodeTypes.LOOP) {
            this.state.counters.push(0);
          }
        }

        break;

      default:
        throw "Unrecognized node type: " + currentNode.type.name;
      }

      currentNode = nodes.length ? nodes[nodes.length - 1] : null;
    }

    // Program ended.
    if (currentNode === null) {
      return null;
    } else {
      var action = currentNode.attributes.action;
      nodes.pop();
      this.state.nextChildIndex.pop();
      return action;
    }
  },
});

module.exports = {
  Interpreter: Robolang,
};
