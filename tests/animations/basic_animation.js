var animator = new Animator();

animator.addElement(new SimpleGridElement(
  'grid', 10, 100));

animator.addElement(new RectangleElement(
  'rect', 10, 10, 'white'));

animator.addElement(new CircleElement(
  'circle', 10));

animator.addAnimation(new Animation(
  2, 45, 'circle', 'x', function(t, elem) {
    return 10*t;
  }));

animator.addAnimation(new Animation(
  2, 45, 'circle', 'y', function(t, elem) {
    return 20*(Math.abs(Math.sin(t)));
  }));

animator.addAnimation(new Animation(
  2, 45, 'rect', 'x', function(t, elem) {
    return 10*t;
  }));

animator.addAnimation(new Animation(
  2, 45, 'rect', 'y', function(t, elem) {
    return 20*(Math.abs(Math.sin(t+Math.PI*0.5)));
  }));

setTimeout(function() {
  var canvas = document.getElementById("animation-canvas");
  animator.start();
  animator.play(canvas);
}, 1000);
