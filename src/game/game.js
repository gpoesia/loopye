/*
 * Represents a programming game. Here, we ues "game" as per Bernand Suits' definition:
 * "to play a game is to engage in activity directed toward bringing about
 *  a speciﬁc state of affairs, using only means permitted by speciﬁc rules,
 *  where the means permitted by the rules are more limited in scope than they
 *  would be in the absence of the rules, and where the sole reason for accepting
 *  such limitation is to make possible such activity."
 *  Suits, Bernard (1967). "What Is a Game?". The University of Chicago Press.
 *
 * Thus, an activity in which you have to write code in order to save robots
 * from asteroids is a game. However, one in which you have to write code in
 * order to produce a button in a mobile app, and in which the system checks
 * that your code has some expected structure, is also a game. Thus, we use
 * the word 'game' in a broader sense than its most common meaning would suggest.
 *
 * The only constraint is that the game is a challenge-based programming game.
 * A game is played in the context of a challenge: a specific situation that
 * must be solved by writing code. The code can then be executed according to the
 * game's rules and mechanics, and will either be accepted (the challenge was
 * solved) or rejected. A game cannot be played outside of the context of a
 * challenge.
 *
 * The game also knows how to render its state to an animator, which shows
 * the execution of the player's code.
 */

/// Creates a Game Runner, which is responsible for executing and rendering
/// challenges for a game.
function GameRunner() {}

Object.assign(GameRunner.prototype, {
  /// Returns a string that uniquely identifies the game this runner implements.
  getGameID: function() {
    throw "Not implemented.";
  },

  /// Loads a challenge, putting this runner in a state in which the challenge can
  /// be played. If `canvas` is an HTMLCanvasElement, also renders the initial
  /// state of the challenge to it.
  /// `gameParameters` should be the challenge's game parameters.
  reset: function(gameParameters, canvas) {
    throw "Not implemented.";
  },

  /// Executes the user's code for this step and returns an object with a subset
  /// of the following properties:
  /// compilation_errors: a list of error messages related to the compilation
  ///                     of the user's code.
  /// runtime_errors: a list of error messages related to the execution of the
  ///                 user's code and the exercise.
  /// animator: an Animator that shows the execution's result, when the given
  ///           source code compiles and runs (whether successfully or not).
  run: function(sourceCode) {
    throw "Not implemented.";
  },

  /// Returns whether the challenge was solved correctly.
  challengeSolved: function() {
    throw "Not implemented.";
  },

  /// Populates the ResourceLoader module with all resources needed by this game.
  populateResourceLoader: function() {},
});

/// A challenge in the context of a specific game.
function Challenge(id, gameID,
                   shortInstructions, instructions, commandReference,
                   initialCode, successMessage, codeSizeLimit,
                   gameParameters) {
  this._id = id;
  this._gameID = gameID;
  this._shortInstructions = shortInstructions;
  this._instructions = instructions;
  this._commandReference = commandReference;
  this._initialCode = initialCode || "";
  this._successMessage = successMessage || null;
  this._codeSizeLimit = codeSizeLimit || null;
  this._gameParameters = gameParameters || {};
}

Object.assign(Challenge.prototype, {
  /// Gets the challenge's ID.
  getChallengeID: function() {
    return this._id;
  },

  /// Gets the Game ID.
  getGameID: function() {
    return this._gameID;
  },

  /// Returns whether both challenges are the same.
  equals: function(challenge) {
    if (!challenge instanceof Challenge) {
      return false;
    }
    return (this.getGameID() == challenge.getGameID() &&
            this.getChallengeID() == challenge.getChallengeID());
  },

  /// Returns the short instructional content that will be displayed during this
  /// challenge (inside the lesson environment).
  getShortInstructions: function() {
    return this._shortInstructions;
  },

  /// Returns the longer instructional content that will be displayed in a
  /// pop-up when the step starts or when the help button is clicked.
  getInstructions: function() {
    return this._instructions;
  },

  /// Returns a reference to all the commands that the user needs to
  /// remember to be able to solve the step.
  getCommandReference: function() {
      return this._commandReference;
  },

  /// Returns the message to be displayed when the user correctly solves this
  /// lesson step.
  getSuccessMessage: function() {
    return this._successMessage;
  },

  /// Returns the source code to be put in the editor at the beginning of
  /// the step.
  getInitialSourceCode: function() {
    return this._initialCode;
  },

  /// Returns the maximum number of characters the user is allowed to use
  /// in this lesson step. If there's no limit, returns null.
  getCodeSizeLimit: function() {
    return this._codeSizeLimit;
  },

  /// Returns this challenge's game-specific parameters.
  getGameParameters: function() {
    return this._gameParameters;
  },
});

/// Global registry of games and challenges by ID.
var gamesRegistry = {};
var challengesRegistry = {}

function registerGame(id, runnerClass) {
  if (gamesRegistry.hasOwnProperty(id)) {
    throw "A game with ID " + id + " has already been registered.";
  }
  gamesRegistry[id] = runnerClass;
}

function newGameRunner(id) {
  if (!gamesRegistry.hasOwnProperty(id)) {
    throw "Game " + id +  " not registered.";
  }
  return new gamesRegistry[id];
}

function registerChallenge(challenge) {
  var gameID = challenge.getGameID();
  var challengeID = challenge.getChallengeID();
  if (challengesRegistry.hasOwnProperty(gameID) &&
      challengesRegistry[gameID].hasOwnProperty(challengeID)) {
    throw ("Challenge with ID " + gameID + "/" + challengeID +
           " has already been registered.");
  }
  if (!challengesRegistry.hasOwnProperty(gameID)) {
    challengesRegistry[gameID] = {};
  }
  challengesRegistry[gameID][challenge.getChallengeID()] = challenge;
}

function findChallenge(gameID, challengeID) {
  if (!challengesRegistry.hasOwnProperty(gameID)) {
    throw "Game " + gameID + " not registered.";
  }
  return challengesRegistry[gameID][challengeID];
}

module.exports = {
  GameRunner: GameRunner,
  Challenge: Challenge,
  registerGame: registerGame,
  registerChallenge: registerChallenge,
  findChallenge: findChallenge,
  newGameRunner: newGameRunner,
};
