window.onload = function() {
  var lesson = new comp4kids.Lesson03();
  lesson.getResourceLoader().load(function() {
    comp4kids.startLesson(lesson, document.getElementById("lesson"));
  });
};
