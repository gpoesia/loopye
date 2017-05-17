/*
 * Language used in the first classes, in which the student controls a robot
 * in a graphical environment.
 */

var Interpreter = require("../interpreter");
var Lexer = require("./lexer");
var Parser = require("./parser");
var Scope = require("../scope");
var Analysis = require("./analysis");
var T = require("../../util/translate").T;

var MAX_LOOP_TRIP_COUNT = 20;

var SemanticAnalysisErrors = {
  TOO_MANY_LOOP_ITERATIONS_ERROR: T("O seu laço tem uma repetição muito grande. " +
                                    "Assim, o robô ficará andando para sempre!"),
};

/// Feature flags: control which language constructs are enabled.
var LOOPS = 1 << 0;
var CONDITIONAL_LOOPS = 1 << 1;

function RobolangProgram(ast_root) {
  this._ast_root = ast_root;
}

RobolangProgram.prototype = {
  /// Returns the root node of the program's AST, if it has been parsed yet.
  getASTRoot: function() {
    return this._ast_root;
  },
};

/// Compiles a Robolang program. It first parses the program and if
/// unsuccessful, it returns a list of errors. If successful, runs
/// semantic checks and returns a RobolangProgram in case these checks pass.
/// Otherwise, it returns an error.
function CompileRobolangProgram(code, actions, sensors) {
  try {
    var tokens = Lexer.tokenize(code);
    var token_stream = new Lexer.TokenStream(tokens);
    var context = new Parser.ParsingContext(actions, sensors);
    var parser = new Parser.ASTProgramNodeParser(context);

    var program = new RobolangProgram(parser.parse(token_stream));
    if (Analysis.getMaxLoopTripCount(program) > MAX_LOOP_TRIP_COUNT) {
      return [SemanticAnalysisErrors.TOO_MANY_LOOP_ITERATIONS_ERROR];
    }

    return program;
  } catch (e) {
    return [e];
  }
}

function Robolang(actions, flags) {
  Interpreter.call(this);
  this.actions = actions;
  this.flags = flags;
  this.lastActionNode = null;
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
  /// Parses the given source code and initializes the interpreter for
  /// executing the program. If compilation fails, returns an array of errors.
  /// Otherwise, returns null.
  parse: function(code, actions, sensors) {
    var program_or_errors = CompileRobolangProgram(code, actions, sensors);

    if (program_or_errors instanceof Array) {
      return program_or_errors;
    } else {
      this.initialize(program_or_errors);
    }

    return null;
  },
  /// Initializes the interpreter for running the given program.
  initialize: function(program) {
    this.state = new InterpreterState(this.getGlobalScope());
    this.state.nodes.push(program.getASTRoot());
    this.state.nextChildIndex.push(0);
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
            // A conditional has at least one child: a block with the 'then' body.
            nodes.push(currentNode.children[0]);
            this.state.nextChildIndex.push(0);
          } else if (currentNode.children.length > 1) {
            // A conditional may have a second child: a block with the 'else' body.
            nodes.push(currentNode.children[1]);
            this.state.nextChildIndex.push(0);
          }
        }
        break;

      case Parser.ASTNodeTypes.CONDITIONAL_LOOP:
        var variable = currentNode.attributes.variable;
        var value = this.state.scope.lookup(variable);

        if (value === undefined) {
          throw "Variable '" + variable + "' was not declared in this scope.";
        } else {
          if (value) {
            nodes.push(currentNode.children[0]);
            this.state.nextChildIndex.push(0);
          } else {
            this.state.nextChildIndex.pop();
            nodes.pop();
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
      this.lastActionNode = currentNode;
      nodes.pop();
      this.state.nextChildIndex.pop();
      return action;
    }
  },

  getCurrentLocation: function() {
    return this.lastActionNode ? this.lastActionNode.location : null;
  },
});

module.exports = {
  Interpreter: Robolang,
  RobolangProgram: RobolangProgram,
  CompileRobolangProgram: CompileRobolangProgram,
};
