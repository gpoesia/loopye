/*
 * Starts a lesson in a given component.
 */

var React = require("react");
var ReactDOM = require("react-dom");
var DummyLesson = require("./lesson/dummy_lesson");

var startLesson = function(lessonClass, domElement) {
  ReactDOM.render(React.createElement(lessonClass), domElement);
  console.log("Rendered");
};

module.exports = {
  startLesson: startLesson,
  DummyLesson: DummyLesson,
};
