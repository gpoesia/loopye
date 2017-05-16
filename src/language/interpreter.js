/*
 * Base class for a source code interpreter, which parses user's code written
 * in some language (returning errors if it finds any), and executes the code
 * until an "action" is found. An action is an instruction that makes time pass
 * in the lesson's execution, like making a character move or wait.
 */

var Scope = require("./scope");

function Interpreter() {
  this._global_scope = new Scope.Scope();
}

Interpreter.prototype = {
  /// Returns the global scope.
  getGlobalScope: function() {
    return this._global_scope;
  },

  /// Parses the user's code, saving an intermediate representation in memory,
  /// or returning an error if any was found.
  parse: function(code) {
    throw "Not implemented."
  },

  /// Runs the program until the next action is found. Returns that action, or
  /// null if the program ended.
  runUntilNextAction: function() {
    throw "Not implemented.";
  },

  /// Returns the range in the source code corresponding to the last executed
  /// action, or null if it doesn't have associated debug information.
  getCurrentLocation: function() {
    return null;
  },

  /// Runs the program until its end, returning a list of all actions executed.
  /// Only useful if the program does not use variables and is guaranteed to
  /// terminate.
  run: function() {
    var actions = [];
    while (true) {
      var next_action = this.runUntilNextAction();
      if (!!next_action) {
        actions.push(next_action);
      } else {
        break;
      }
    }
    return actions;
  }
};

module.exports = Interpreter;
