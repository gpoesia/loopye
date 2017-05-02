/*
 * Interface for a pluggable backend that manages user progress in a course.
 *
 * The default implementation doesn't store progress, and handles all challenges
 * as always unlocked.
 */

function ProgressManager() {}

/// Possible statuses of the user's interaction with a given challenge.
var ChallengeStatus = {
  SOLVED: 1,  // The user has already solved this challenge.
  UNLOCKED: 2,  // The user has not solved this challenge yet, but it's available.
  LOCKED: 3,  // This challenge cannot be attempted right now.
};

Object.assign(ProgressManager.prototype, {
  // Initializes the Progress Manager, calling the callback when it is done.
  // If any errors are found, an object describing the error is passed to the
  // callback as its first parameter. On success, nothing is passed.
  init: function(callback) {
    callback();
  },

  /// Called every time the user submits code for a challenge.
  /// `success` tells whether the code has solved the challenge.
  handleSubmission: function(course, lesson, challenge, code, success) {},

  /// Returns a `ChallengeStatus` corresponding to the given challenge.
  getChallengeStatus: function(course, lesson, challenge) {
    return ChallengeStatus.UNLOCKED;
  },
});

module.exports = {
  ProgressManager: ProgressManager,
  ChallengeStatus: ChallengeStatus,
};
