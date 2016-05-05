var animator = new Animator();

animator.addElement(new RectangleElement(
  'player', 10, 10));

animator.addAnimation(new Animation(
  2, 45, 'player', 'x', function(t, elem) {
    return 10*t;
  }));

animator.addAnimation(new Animation(
  2, 45, 'player', 'y', function(t, elem) {
    return 20*(Math.abs(Math.sin(t)));
  }));

setTimeout(function() {
  var canvas = document.getElementById("animation-canvas");
  animator.start();
  animator.play(canvas);
}, 1000);
