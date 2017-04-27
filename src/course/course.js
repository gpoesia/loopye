/*
 * Represents a course, which is a sequence of lessons.
 */

function Course(id, name, lessons) {
  this._id = id;
  this._name = name;
  this._lessons = lessons;
}

Object.assign(Course.prototype, {
  /// Returns the course's ID.
  getCourseID: function() {
    return this._id;
  },

  /// Returns the course's name (a user-friendly string).
  getCourseName: function() {
    return this._name;
  },

  /// Returns the number of lessons in this course.
  getNumberOfLessons: function() {
    return this._lessons.length;
  },

  /// Returns the indexth lesson in the course.
  getLesson: function(index) {
    return this._lessons[index];
  },
});

/// Global registry of courses by ID.
var coursesRegistry = {};

function registerCourse(course) {
  if (coursesRegistry.hasOwnProperty(course.getCourseID())) {
    throw "Course " + course.getCourseID() +  " already registered.";
  }
  coursesRegistry[course.getCourseID()] = course;
}

function findCourse(id) {
  if (!coursesRegistry.hasOwnProperty(id)) {
    throw "Course " + id + " not registered.";
  }
  return coursesRegistry[id];
}

module.exports = {
  Course: Course,
  registerCourse: registerCourse,
  findCourse: findCourse,
};
