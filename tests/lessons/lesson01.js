window.onload = function() {
  var lesson = loopye.Lesson.findLesson("first-mission");
  loopye.startLesson(lesson, document.getElementById("lesson"));
};
