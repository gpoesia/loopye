/*
 * Represents a Lesson, which is a sequence of challenges in one or more games.
 */

function Lesson(id, name, description, challenges) {
  this._id = id;
  this._name = name;
  this._description = description;
  this._challenges = challenges;
}

Object.assign(Lesson.prototype, {
  /// Returns the lesson's ID.
  getLessonID: function() {
    return this._id;
  },

  /// Returns the lesson's name.
  getLessonName: function() {
    return this._name;
  },

  /// Return the lesson's description text.
  getLessonDescription: function() {
    return this._description;
  },

  /// Returns the number of challenges in this lesson.
  getNumberOfChallenges: function() {
    return this._challenges.length;
  },

  /// Returns the i-th challenge in this lesson.
  getChallenge: function(i) {
    return this._challenges[i];
  },

  /// Returns the index of the given challenge in this lesson, or -1 if
  /// the given challenge is not part of the lesson.
  getChallengeIndex: function(challenge) {
    for (var i = 0; i < this._challenges.length; i++) {
      if (this._challenges[i].equals(challenge)) {
        return i;
      }
    }
    return -1;
  },
});

/// Global registry of lessons by ID.
var lessonsRegistry = {};

function registerLesson(lesson) {
  if (lessonsRegistry.hasOwnProperty(lesson.getLessonID())) {
    throw "Lesson " + lesson.getLessonID() +  " already registered.";
  }
  lessonsRegistry[lesson.getLessonID()] = lesson;
}

function findLesson(id) {
  if (!lessonsRegistry.hasOwnProperty(id)) {
    throw "Lesson " + id + " not registered.";
  }
  return lessonsRegistry[id];
}

module.exports = {
  Lesson: Lesson,
  registerLesson: registerLesson,
  findLesson: findLesson,
};
