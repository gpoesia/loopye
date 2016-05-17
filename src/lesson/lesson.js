/*
 * Basic structure of a lesson.
 */

/// A lesson is a sequence of lesson steps.
function Lesson() {
  this.steps = new Array();
}

Lesson.prototype = {
  /// Adds one step to this lesson.
  addStep: function(step) {
    this.steps.push(step);
  },

  /// Returns the number of steps in this lesson.
  getNumberOfSteps: function() {
    return this.steps.length;
  },

  /// Returns the i-th step in this lesson.
  getStep: function(i) {
    return this.steps[i];
  }
};

/// Interface for one step of a lesson.
function LessonStep(instructionText, player, initialCode) {
  this.instructionText = instructionText;
  this.player = player;
  this.initialCode = initialCode || "";
}

LessonStep.prototype = {
  /// Returns the instructional content that will be displayed during this
  /// step (on the left side of the lesson environment).
  getContent: function() {
    return this.instructionText;
  },

  /// Returns the source code to be put in the editor at the beginning of
  /// the step.
  getInitialSourceCode: function() {
    return this.initialCode;
  },

  /// Returns whether the user is allowed to go to the next step.
  canAdvance: function() {
    return this.player.isInAcceptingState();
  },

  /// Plays the user's source code for this step.
  /// Returns an Animator that shows the execution's result.
  play: function(sourceCode) {
    return this.player.play(sourceCode);
  },
};

/// Base class for a step player, which controls its internal state according
/// to the step's rules and the user's program, generates an animation that
/// shows the result of the program, and decides whether the result should be
/// accepted or not.
/// The responsibility of parsing and running the source code is delegated to
/// an Interpreter.
function LessonStepPlayer() {}

LessonStepPlayer.prototype = {
  /// Executes the user's code for this step and returns an Animator that
  /// shows the execution's result.
  play: function(sourceCode) {
    throw "Not implemented.";
  },

  /// Returns whether the execution is in a state that allows the user to
  /// advance in the lesson.
  isInAcceptingState: function() {
    throw "Not implemented.";
  }
};

/// Base class for a source code interpreter, which parses user's code written
/// in some language (returning errors if it finds any), and executes the code
/// until an "action" is found. An action is an instruction that makes time pass
/// in the lesson's execution, like making a character move or wait.
function Interpreter() {}

Interpreter.prototype = {
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
};

module.exports = {
  Lesson: Lesson,
  LessonStep: LessonStep,
  LessonStepPlayer: LessonStepPlayer,
  Interpreter: Interpreter,
};
