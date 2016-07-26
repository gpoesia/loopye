/*
 * Convenient functions for creating common animator elements.
 */

var animator = require("../animator");

var ROBOT_IMAGE_URL = "/static/images/elements/robot.png";
var ASTEROIDS_IMAGE_URL = "/static/images/elements/asteroids.png";

// Creates an AnimatedImageElement that renders to a robot.
// It has four animations: walk_down, walk_up, walk_left and
// walk_right.
// The robot is rendered with the maximum possible size, respecting
// original proportions, and `max_width` and `max_height`, if any are given.
// If none are given, the image's original size is used.
function createRobot(id, max_width, max_height) {
  var image = new Image();
  image.src = ROBOT_IMAGE_URL;
  var IMAGE_WIDTH = 32;
  var IMAGE_HEIGHT = 48;
  var width = IMAGE_WIDTH;
  var height = IMAGE_HEIGHT;

  if (max_width || max_height) {
    max_width = max_width || (max_height * (IMAGE_HEIGHT / IMAGE_WIDTH));
    max_height = max_height || (max_width * (IMAGE_WIDTH / IMAGE_HEIGHT));

    if (max_width * (IMAGE_HEIGHT / IMAGE_WIDTH) < max_height) {
      width = max_width;
      height = width * (IMAGE_HEIGHT / IMAGE_WIDTH);
    } else {
      height = max_height;
      width = height * (IMAGE_WIDTH / IMAGE_HEIGHT);
    }
  }

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
      height
      );
}

function createAsteroid(id, max_width, max_height) {
  var image = new Image();
  image.src = ASTEROIDS_IMAGE_URL;
  var IMAGE_WIDTH = 32;
  var IMAGE_HEIGHT = 32;
  var width = IMAGE_WIDTH;
  var height = IMAGE_HEIGHT;

  if (max_width || max_height) {
    max_width = max_width || (max_height * (IMAGE_HEIGHT / IMAGE_WIDTH));
    max_height = max_height || (max_width * (IMAGE_WIDTH / IMAGE_HEIGHT));

    if (max_width * (IMAGE_HEIGHT / IMAGE_WIDTH) < max_height) {
      width = max_width;
      height = width * (IMAGE_HEIGHT / IMAGE_WIDTH);
    } else {
      height = max_height;
      width = height * (IMAGE_WIDTH / IMAGE_HEIGHT);
    }
  }

  var asteroid_0_frames = [0];
  var asteroid_1_frames = [1];
  var asteroid_2_frames = [2];
  var asteroid_3_frames = [3];
  var asteroid_4_frames = [4];
  var asteroid_5_frames = [5];
  var asteroid_6_frames = [6];
  var asteroid_7_frames = [7];

  return new animator.AnimatedImageElement(
      id,
      image,
      [
        new animator.SpriteAnimation("asteroid_0", asteroid_0_frames),
        new animator.SpriteAnimation("asteroid_1", asteroid_1_frames),
        new animator.SpriteAnimation("asteroid_2", asteroid_2_frames),
        new animator.SpriteAnimation("asteroid_3", asteroid_3_frames),
        new animator.SpriteAnimation("asteroid_4", asteroid_4_frames),
        new animator.SpriteAnimation("asteroid_5", asteroid_5_frames),
        new animator.SpriteAnimation("asteroid_6", asteroid_6_frames),
        new animator.SpriteAnimation("asteroid_7", asteroid_7_frames),
      ],
      4,
      2,
      width,
      height
      );
}

module.exports = {
  createRobot: createRobot,
  ROBOT_IMAGE_URL: ROBOT_IMAGE_URL,
  createAsteroid: createAsteroid,
  ASTEROIDS_IMAGE_URL: ASTEROIDS_IMAGE_URL,
};
