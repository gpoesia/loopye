/*
 * Starts a lesson in a given component.
 */

var React = require("react");
var ReactDOM = require("react-dom");
var DummyLesson = require("./lesson/dummy_lesson");
var Lesson01 = require("./lesson/lesson01");
var LessonEnvironment = require("./view/lesson_environment");
var Popup = require("react-popup").default;

var startLesson = function(lessonClass, domElement) {
  // Sets up the pop-ups container.
  var body = document.getElementsByTagName("body")[0];
  var container = document.createElement("div");
  container.setAttribute("id", "popupContainer");
  body.appendChild(container);
  ReactDOM.render(<Popup />, container);

  ReactDOM.render(<LessonEnvironment lesson={new lessonClass()} />,
                  domElement);
};

module.exports = {
  startLesson: startLesson,
  DummyLesson: DummyLesson,
  Lesson01: Lesson01,
};
