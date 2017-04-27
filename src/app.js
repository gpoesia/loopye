/*
 * Starts a lesson in a given component.
 */

var React = require("react");
var ReactDOM = require("react-dom");
var Lesson = require("./lesson/lesson");
var Course = require("./course/course");

// Load built-in games, challenges, lessons and courses.
require("./game/builtin");
require("./lesson/builtin");
require("./course/builtin");

var LessonEnvironment = require("./view/lesson_environment");
var CourseOverview = require("./view/course_overview");
var ResourceLoader = require("./util/resource_loader")
var Popup = require("react-popup").default;

// Set up the pop-ups container if needed.
function initializePopUp() {
  if (!document.getElementById("popupContainer")) {
    var body = document.getElementsByTagName("body")[0];
    var container = document.createElement("div");
    container.setAttribute("id", "popupContainer");
    body.appendChild(container);
    ReactDOM.render(<Popup />, container);
  }
}

var startLesson = function(lesson, domElement, initialStep) {
  initialStep = initialStep || 0;
  initializePopUp();
  ReactDOM.render(<LessonEnvironment lesson={lesson}
                                     initialStep={initialStep} />,
                  domElement)
};

var startCourse = function(course, domElement) {
  initializePopUp();
  ReactDOM.render(<CourseOverview course={course}/>, domElement);
};

module.exports = {
  startLesson: startLesson,
  startCourse: startCourse,
  Lesson: Lesson,
  Course: Course,
};
