/*
 * Convenient functions for creating common animator elements.
 */

var animator = require("../animator");

var ROBOT_IMAGE_URL = "/static/images/elements/robot.png";
var ROBOT_HOLDING_IMAGE_URL = "/static/images/elements/robot-with-gear.png";
var ASTEROIDS_IMAGE_URL = "/static/images/elements/asteroids.png";
var MACHINE_COMPONENT_URL = "/static/images/elements/gear.png";
var MACHINE_URL = "/static/images/elements/bad-machine.png";
var WORKING_MACHINE_URL = "/static/images/elements/good-machine.png";

// Calculates the largest size an image can have so that 1) proportions are kept
// and 2) maximum size constraints are not violated.
function calculateDimensions(max_width, max_height, image_width, image_height) {
  if (max_width || max_height) {
    max_width = max_width || (max_height * (image_height / image_width));
    max_height = max_height || (max_width * (image_width / image_height));

    if (max_width * (image_height / image_width) < max_height) {
      width = max_width;
      height = width * (image_height / image_width);
    } else {
      height = max_height;
      width = height * (image_width / image_height);
    }
  }
  return [width, height];
}

var ROBOT_HOLDING_STYLE = "robot_holding";

// Creates an AnimatedImageElement that renders to a robot.
// It has four animations: walk_down, walk_up, walk_left and
// walk_right.
// The robot is rendered with the maximum possible size, respecting
// original proportions, and `max_width` and `max_height`, if any are given.
// If none are given, the image's original size is used.
function createRobot(id, max_width, max_height) {
  var image = new Image();
  image.src = ROBOT_IMAGE_URL;
  var holding_image = new Image();
  holding_image.src = ROBOT_HOLDING_IMAGE_URL;
  var IMAGE_WIDTH = 32;
  var IMAGE_HEIGHT = 48;
  var dimensions = calculateDimensions(max_width, max_height,
                                       IMAGE_WIDTH, IMAGE_HEIGHT);

  var walk_down_frames =  [0, 1, 2, 3];
  var walk_left_frames =  [4, 5, 6, 7];
  var walk_right_frames = [8, 9, 10, 11];
  var walk_up_frames =    [12, 13, 14, 15];
  var turn_down_frames =  [0];
  var turn_left_frames =  [4];
  var turn_right_frames = [8];
  var turn_up_frames =    [12];

  var styles = {"default": image};
  styles[ROBOT_HOLDING_STYLE] = holding_image;

  return new animator.AnimatedImageElement(
      id,
      styles,
      [
        new animator.SpriteAnimation("walk_down", walk_down_frames),
        new animator.SpriteAnimation("walk_left", walk_left_frames),
        new animator.SpriteAnimation("walk_right", walk_right_frames),
        new animator.SpriteAnimation("walk_up", walk_up_frames),
        new animator.SpriteAnimation("turn_down", turn_down_frames),
        new animator.SpriteAnimation("turn_left", turn_left_frames),
        new animator.SpriteAnimation("turn_right", turn_right_frames),
        new animator.SpriteAnimation("turn_up", turn_up_frames),
      ],
      4,
      4,
      dimensions[0],
      dimensions[1]
      );
}

var GOOD_BATTERY_IMAGE_URL = "/static/images/elements/good-battery.png";
var BAD_BATTERY_IMAGE_URL = "/static/images/elements/bad-battery.png";

function createBattery(id, max_width, max_height, is_good) {
  var image = new Image();
  var IMAGE_WIDTH = 32;
  var IMAGE_HEIGHT = 32;

  if (is_good) {
    image.src = GOOD_BATTERY_IMAGE_URL;
  } else {
    image.src = BAD_BATTERY_IMAGE_URL;
  }

  var dimensions = calculateDimensions(max_width, max_height,
                                       IMAGE_WIDTH, IMAGE_HEIGHT);

  var charge_frames = [0, 1, 2, 3];

  return new animator.AnimatedImageElement(
      id,
      image,
      [
        new animator.SpriteAnimation("charge", charge_frames),
      ],
      4,
      1,
      dimensions[0],
      dimensions[1]
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

function createMachineComponent(id, max_width, max_height) {
  var image = new Image();
  image.src = MACHINE_COMPONENT_URL;
  var IMAGE_WIDTH = 32;
  var IMAGE_HEIGHT = 32;

  var dimensions = calculateDimensions(max_width, max_height,
                                       IMAGE_WIDTH, IMAGE_HEIGHT);

  return new animator.AnimatedImageElement(
      id, image, [], 1, 1, dimensions[0], dimensions[1]);
}

var WORKING_MACHINE_STYLE = "working_machine";

function createMachine(id, max_width, max_height) {
  var default_image = new Image();
  default_image.src = MACHINE_URL;
  var working_machine_image = new Image();
  working_machine_image.src = WORKING_MACHINE_URL;
  var IMAGE_WIDTH = 48;
  var IMAGE_HEIGHT = 48;
  var dimensions = calculateDimensions(max_width, max_height,
                                       IMAGE_WIDTH, IMAGE_HEIGHT);
  var styles = {"default": default_image};
  styles[WORKING_MACHINE_STYLE] = working_machine_image;
  return new animator.AnimatedImageElement(
      id, styles, [], 1, 1, dimensions[0], dimensions[1]);
}

module.exports = {
  createRobot: createRobot,
  createBattery: createBattery,
  GOOD_BATTERY_IMAGE_URL: GOOD_BATTERY_IMAGE_URL,
  BAD_BATTERY_IMAGE_URL: BAD_BATTERY_IMAGE_URL,
  ROBOT_IMAGE_URL: ROBOT_IMAGE_URL,
  ROBOT_HOLDING_IMAGE_URL: ROBOT_HOLDING_IMAGE_URL,
  ROBOT_HOLDING_STYLE: ROBOT_HOLDING_STYLE,
  createAsteroid: createAsteroid,
  ASTEROIDS_IMAGE_URL: ASTEROIDS_IMAGE_URL,
  MACHINE_COMPONENT_URL: MACHINE_COMPONENT_URL,
  MACHINE_URL: MACHINE_URL,
  WORKING_MACHINE_URL: WORKING_MACHINE_URL,
  WORKING_MACHINE_STYLE: WORKING_MACHINE_STYLE,
  createMachineComponent: createMachineComponent,
  createMachine: createMachine,
};
