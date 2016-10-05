window.onload = function() {
  var lesson = new comp4kids.Lesson03();
  lesson.populateResourceLoader();
  comp4kids.LessonEnvironment.populateResourceLoader();
  comp4kids.ResourceLoader.load(function() {
    comp4kids.startLesson(lesson, document.getElementById("lesson"));
  });
};
