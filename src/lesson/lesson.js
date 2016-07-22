/*
 * Basic structure of a lesson.
 */

var ResourceLoader = require("../util/resource_loader");

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
  },

  /// Returns a resource loader that loads all resources needed by the lesson.
  getResourceLoader: function() {
    return new ResourceLoader();
  },
};

/// Interface for one step of a lesson.
function LessonStep(shortInstruction, instructions, player, initialCode,
                    successMessage, codeSizeLimit) {
  this.shortInstruction = shortInstruction;
  this.instructions = instructions;
  this.player = player;
  this.initialCode = initialCode || "";
  this.successMessage = successMessage || null;
  this.codeSizeLimit = codeSizeLimit || null;
}

LessonStep.prototype = {
  /// Returns the short instructional content that will be displayed during this
  /// step (inside the lesson environment).
  getShortInstructions: function() {
    return this.shortInstruction;
  },

  /// Returns the longer instructional content that will be displayed in a
  /// pop-up when the step starts or when the help button is clicked.
  getInstructions: function() {
    return this.instructions;
  },

  /// Returns the message to be displayed when the user correctly solves this
  /// lesson step.
  getSuccessMessage: function() {
    return this.successMessage;
  },

  /// Returns the source code to be put in the editor at the beginning of
  /// the step.
  getInitialSourceCode: function() {
    return this.initialCode;
  },

  /// Returns the maximum number of characters the user is allowed to use
  /// in this lesson step. If there's no limit, returns null.
  getCodeSizeLimit: function() {
    return this.codeSizeLimit;
  },

  /// Returns whether the user is allowed to go to the next step.
  canAdvance: function() {
    return this.player.isInAcceptingState();
  },

  /// Plays the user's source code for this step.
  /// Returns the result returned by the lesson player.
  play: function(sourceCode) {
    return this.player.play(sourceCode);
  },

  /// Resets the step player's state. If passed a canvas, renders the initial
  /// state to it.
  reset: function(canvas) {
    this.player.reset(canvas);
  },
};

/// Base class for a step player, which controls its internal state according
/// to the step's rules and the user's program, generates an animation that
/// shows the result of the program, and decides whether the result should be
/// accepted or not.
/// The responsibility of parsing and running the source code is internally
/// delegated to an Interpreter.
function LessonStepPlayer() {}

LessonStepPlayer.prototype = {
  /// Executes the user's code for this step and returns an object with a subset
  /// of the following properties:
  /// compilation_errors: a list of error messages related to the compilation
  ///                     of the user's code.
  /// runtime_errors: a list of error messages related to the execution of the
  ///                 user's code and the exercise.
  /// animator: an Animator that shows the execution's result, when the given
  ///           source code compiles and run (successfully or not).
  play: function(sourceCode) {
    throw "Not implemented.";
  },

  /// Returns whether the execution is in a state that allows the user to
  /// advance in the lesson.
  isInAcceptingState: function() {
    throw "Not implemented.";
  },

  /// Resets the state of this step. If `canvas` is an HTMLCanvasElement,
  /// also renders the initial state of the step to it.
  reset: function(canvas) {
    throw "Not implemented.";
  }
};

module.exports = {
  Lesson: Lesson,
  LessonStep: LessonStep,
  LessonStepPlayer: LessonStepPlayer,
};
