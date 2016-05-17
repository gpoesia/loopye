/*
 * A simple lesson that serves to exercise the enrivonment.
 */

var Lesson = require("./lesson");
var Animator = require("../util/animator");

/// A simple step player for showcasing the dynamics of a lesson.
function DummyStepPlayer() {
  Lesson.LessonStepPlayer.call(this);
}

DummyStepPlayer.prototype = {
  play: function(sourceCode) {
    var animator = new Animator.Animator();

    var square = new Animator.RectangleElement(
        'r', 30, 30, 'blue', 'orange', 5);

    square.x = 50;
    square.y = 50;

    animator.addElement(square);

    var animationX = new Animator.Animation(
        0, 5, 'r', 'x',
        function(t, e) {
          return 50 + 10*Math.cos(t);
        });

    var animationY = new Animator.Animation(
        0, 5, 'r', 'y',
        function(t, e) {
          return 50 + 10*Math.sin(t);
        });

    animator.addAnimation(animationX);
    animator.addAnimation(animationY);

    return animator;
  },

  isInAcceptingState: function() {
    return true;
  },
};

function DummyLesson() {
  Lesson.Lesson.call(this);

  this.addStep(
      new Lesson.LessonStep(
          "This is the first step in this lesson.",
          new DummyStepPlayer(),
          ""));

  this.addStep(
      new Lesson.LessonStep(
          "And this is the second.",
          new DummyStepPlayer(),
          ""));

  this.addStep(
      new Lesson.LessonStep(
          "Now check this code out.",
          new DummyStepPlayer(),
          "RRLRL"));

  this.addStep(
      new Lesson.LessonStep(
          "Well done! Last time. This new code uses loops.",
          new DummyStepPlayer(),
          "5{R 3{RL} RL}"));
}

DummyLesson.prototype = Object.create(Lesson.Lesson.prototype, {});

module.exports = DummyLesson;
