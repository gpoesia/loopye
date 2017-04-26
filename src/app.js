/*
 * Starts a lesson in a given component.
 */

var React = require("react");
var ReactDOM = require("react-dom");
var Lesson = require("./lesson/lesson");

// Load built-in games, challenges and lessons.
require("./game/builtin");
require("./lesson/builtin");

var LessonEnvironment = require("./view/lesson_environment");
var ResourceLoader = require("./util/resource_loader")
var Popup = require("react-popup").default;

var startLesson = function(lesson, domElement, initialStep) {
  initialStep = initialStep || 0;

  // Set up the pop-ups container if needed.
  if (!document.getElementById("popupContainer")) {
    var body = document.getElementsByTagName("body")[0];
    var container = document.createElement("div");
    container.setAttribute("id", "popupContainer");
    body.appendChild(container);
    ReactDOM.render(<Popup />, container);
  }

  ReactDOM.render(<LessonEnvironment lesson={lesson}
                                     initialStep={initialStep} />,
                  domElement)
};

module.exports = {
  startLesson: startLesson,
  Lesson: Lesson,
};
