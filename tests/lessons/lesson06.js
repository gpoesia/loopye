window.onload = function() {
  var lesson = new comp4kids.Lesson04();
  lesson.populateResourceLoader();
  comp4kids.LessonEnvironment.populateResourceLoader();
  comp4kids.ResourceLoader.load(function() {
    comp4kids.startLesson(lesson, document.getElementById("lesson"),
                          lesson.getFirstStepWithWhile());
  });
};
