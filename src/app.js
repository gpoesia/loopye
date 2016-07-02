/*
 * Starts a lesson in a given component.
 */

var React = require("react");
var ReactDOM = require("react-dom");
var DummyLesson = require("./lesson/dummy_lesson");
var Lesson01 = require("./lesson/lesson01");
var LessonEnvironment = require("./view/lesson_environment");

var startLesson = function(lesson, domElement) {
  var lessonInstance = null;
  if (typeof(lessonClass) === 'function') {
    lessonInstance = new lesson();
  } else if (typeof(lesson) === 'object') {
    lessonInstance = lesson;
  } else {
    console.error("Not a lesson or a lesson class: " + lesson);
    return;
  }
  ReactDOM.render(<LessonEnvironment lesson={lessonInstance} />,
                  domElement);
};

module.exports = {
  startLesson: startLesson,
  DummyLesson: DummyLesson,
  Lesson01: Lesson01,
};
