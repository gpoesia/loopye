/*
 * Convenient functions for creating common animator elements.
 */

var animator = require("../animator");

// Creates an AnimatedImageElement that renders to a robot.
// It has four animations: walk_down, walk_up, walk_left and
// walk_right.
function createRobot(id, width, height) {
  var image = new Image();
  image.src = "/static/images/elements/stormtrooper.png";

  var walk_down_frames =  [0, 1, 2, 3];
  var walk_left_frames =  [4, 5, 6, 7];
  var walk_right_frames = [8, 9, 10, 11];
  var walk_up_frames =    [12, 13, 14, 15];

  return new animator.AnimatedImageElement(
      id,
      image,
      [
        new animator.SpriteAnimation("walk_down", walk_down_frames),
        new animator.SpriteAnimation("walk_left", walk_left_frames),
        new animator.SpriteAnimation("walk_right", walk_right_frames),
        new animator.SpriteAnimation("walk_up", walk_up_frames),
      ],
      4,
      4,
      width,
      height);
}

module.exports = {
  createRobot: createRobot,
};
