/*
 * Built-in Introduction to Programming course.
 */

var T = require("../util/translate").T;
var Course = require("./course");
var Lesson = require("../lesson/lesson");

var introductionCourse = new Course.Course(
  "introduction",
  T("Introdução à Programação"),
  [
    Lesson.findLesson("first-mission"),
    Lesson.findLesson("second-mission"),
  ]
);

Course.registerCourse(introductionCourse);

module.exports = introductionCourse;
