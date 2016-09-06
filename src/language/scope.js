/*
 * Represents a scope of variables and functions.
 */

/// Creates a scope which has `parent_scope` as its parent. Lookups which fail
/// in this scope are passed to the parent_scope.
function Scope(parent_scope) {
  this._bindings = {};
  this._parent = parent_scope;
}

Scope.prototype = {
  /// Sets the value associated with a name in this scope.
  set: function(name, value) {
    this._bindings[name] = value;
  },

  /// Looks up the value associated with the name in this scope or its parents.
  /// If no value is bound to this name either in this scope or in any of its parents,
  /// returns `undefined`.
  /// If this scope does not contain any binding for the name but it has a
  /// parent scope, it performs a recursive lookup on the parent scope.
  lookup: function(name) {
    if (this._bindings.hasOwnProperty(name)) {
      return this._bindings[name];
    }
    if (this._parent) {
      return this._parent.lookup(name);
    }
    return undefined;
  },
};

module.exports = {
  Scope: Scope,
};
