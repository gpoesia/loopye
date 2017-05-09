/*
 * ProgressManager which keeps track of progress in-memory.
 */

var ProgressManager = require("./progress_manager");

// Unlocks up to this number of challenges after the last challenge the user
// has solved in each lesson.
var UNLOCKED_FUTURE_CHALLENGES = 5;

function LocalProgressManager() {
  ProgressManager.ProgressManager.call(this);
  this._solved = {}; // maps (course, lesson) => [solved challenge IDs]
}

Object.assign(LocalProgressManager.prototype, {
  handleSubmission: function(course, lesson, challenge, code, success) {
    if (success) {
      this._markSolved(course, lesson, challenge);
    }
  },
  getChallengeStatus: function(course, lesson, challenge) {
    var index = lesson.getChallengeIndex(challenge);
    // Challenge does not belong to the lesson.
    if (index === -1) {
      return null;
    }

    if (this._isSolved(course, lesson, challenge)) {
      return ProgressManager.ChallengeStatus.SOLVED;
    }

    var lastSolved = -1;

    for (var i = 0; i < lesson.getNumberOfChallenges(); i++) {
      if (this._isSolved(course, lesson, lesson.getChallenge(i))) {
        lastSolved = i;
      }
    }

    if (index <= lastSolved + UNLOCKED_FUTURE_CHALLENGES) {
      return ProgressManager.ChallengeStatus.UNLOCKED;
    } else {
      return ProgressManager.ChallengeStatus.LOCKED;
    }
  },
  _getKey: function(course, lesson, challenge) {
    return [course.getCourseID(),
            lesson.getLessonID(),
            challenge.getChallengeID()].join("/");
  },
  _markSolved: function(course, lesson, challenge) {
    this._solved[this._getKey(course, lesson, challenge)] = true;
  },
  _isSolved: function(course, lesson, challenge) {
    return !!this._solved[this._getKey(course, lesson, challenge)];
  },
});

module.exports = {
  LocalProgressManager: LocalProgressManager,
};
