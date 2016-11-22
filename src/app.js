/*
 * Starts a lesson in a given component.
 */

var React = require("react");
var ReactDOM = require("react-dom");
var DummyLesson = require("./lesson/dummy_lesson");
var Lesson01 = require("./lesson/lesson01");
var Lesson02 = require("./lesson/lesson02");
var Lesson03 = require("./lesson/lesson03");
var Lesson04 = require("./lesson/lesson04").Lesson04;
var LessonEnvironment = require("./view/lesson_environment");
var ResourceLoader = require("./util/resource_loader")
var Popup = require("react-popup").default;

var startLesson = function(lesson, domElement, initialStep) {
  initialStep = initialStep || 0;

  var lessonInstance = null;
  if (typeof(lesson) === 'function') {
    lessonInstance = new lesson();
  } else if (typeof(lesson) === 'object') {
    lessonInstance = lesson;
  } else {
    console.error("Not a lesson or a lesson class: " + lesson);
    return;
  }
  // Sets up the pop-ups container.
  var body = document.getElementsByTagName("body")[0];
  var container = document.createElement("div");
  container.setAttribute("id", "popupContainer");
  body.appendChild(container);
  ReactDOM.render(<Popup />, container);

  ReactDOM.render(<LessonEnvironment lesson={lessonInstance}
                                     initialStep={initialStep} />,
                  domElement)
};

module.exports = {
  startLesson: startLesson,
  DummyLesson: DummyLesson,
  Lesson01: Lesson01,
  Lesson02: Lesson02,
  Lesson03: Lesson03,
  LessonEnvironment: LessonEnvironment,
  ResourceLoader: ResourceLoader,
  Lesson04: Lesson04,
};
