window.onload = function() {
  var lesson = new comp4kids.Lesson02();
  lesson.getResourceLoader().load(function() {
    comp4kids.startLesson(lesson, document.getElementById("lesson"));
  });
};
