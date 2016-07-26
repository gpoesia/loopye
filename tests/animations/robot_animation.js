var animator = new comp4kids.Animator.Animator();

var robot = comp4kids.ElementFactories.createRobot('robot');
robot.x = 50;
robot.y = 50;

animator.addElement(robot);

for (var i = 0; i < 20; i++) {
  var t0 = 12 * i;

  animator.addAnimation(
      comp4kids.AnimationFactories.straightMove('robot', t0 + 0, t0 + 3,
                                                0, 30));
  animator.addAnimation(robot.createAnimation('walk_down', t0 + 0, t0 + 3,
                                              1.0));

  animator.addAnimation(
      comp4kids.AnimationFactories.straightMove('robot', t0 + 3, t0 + 6,
                                                30, 0));
  animator.addAnimation(robot.createAnimation('walk_right', t0 + 3, t0 + 6,
                                              1.0));

  // animator.addAnimation(
  //     comp4kids.AnimationFactories.straightMove('robot', t0 + 6, t0 + 9,
  //                                               0, -30));
  // animator.addAnimation(robot.createAnimation('walk_up', t0 + 6, t0 + 9,
  //                                             1.0));

  animator.addAnimation(
      comp4kids.AnimationFactories.straightMove('robot', t0 + 9, t0 + 12,
                                                -30, 0));
  animator.addAnimation(robot.createAnimation('walk_left', t0 + 9, t0 + 12,
                                              1.0));
}

setTimeout(function() {
  var canvas = document.getElementById("animation-canvas");
  animator.start();
  animator.play(canvas);
}, 1000);
