/*
 * Convenient functions for creating common animator elements.
 */

var animator = require("../animator");
var ResourceLoader = require("../resource_loader");

var ROBOT_IMAGE_URL = "/static/images/elements/robot-new.png";
var ROBOT_HOLDING_IMAGE_URL = "/static/images/elements/robot-with-gear-new.png";
var ASTEROIDS_IMAGE_URL = "/static/images/elements/asteroids.png";
var ROCKS_IMAGE_URL = "/static/images/elements/rocks.png";
var WALL_IMAGE_URL = "/static/images/elements/wall.png";
var MACHINE_COMPONENT_URL = "/static/images/elements/gear.png";
var MACHINE_URL = "/static/images/elements/bad-machine.png";
var WORKING_MACHINE_URL = "/static/images/elements/good-machine.png";
var ASTEROIDS_BACKGROUND_URL = "/static/images/elements/asteroids-background-new.png";
var DESERT_BACKGROUND_URL = "/static/images/elements/desert-background.png"
var ROBOTIC_ARM_IMAGE_URL = "/static/images/elements/robotic-arm.png";
var ROBOTIC_ARM_HOLDING_IRON_IMAGE_URL = "/static/images/elements/robotic-arm-iron.png";
var ROBOTIC_ARM_HOLDING_GLASS_IMAGE_URL = "/static/images/elements/robotic-arm-glass.png";
var ROBOTIC_ARM_HOLDING_FUEL_IMAGE_URL = "/static/images/elements/robotic-arm-fuel.png";
var SPACESHIP_FACTORY_BACKGROUND_URL = "/static/images/elements/spaceship-factory-background.png";

var IRON_DEPOSIT_URL = "/static/images/elements/iron-deposit.png";
var GLASS_DEPOSIT_URL = "/static/images/elements/glass-deposit.png";
var FUEL_DEPOSIT_URL = "/static/images/elements/fuel-deposit.png";
var SHIP_HEAD_DEPOSIT_URL = "/static/images/elements/ship-head-deposit.png";
var SHIP_TAIL_DEPOSIT_URL = "/static/images/elements/ship-tail-deposit.png";
var SHIP_BODY_DEPOSIT_URL = "/static/images/elements/ship-body-deposit.png";

var SOURCE_IMAGE_URL = "/static/images/elements/source.png";

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

// Creates an StaticImageElement that renders to the static background of the
// asteroids falling.
function createAsteroidsBackground(id, max_width, max_height,
                                   grid_width, grid_height) {
  var image = ResourceLoader.get(ASTEROIDS_BACKGROUND_URL);
  var tile_size = 50;
  var IMAGE_WIDTH = tile_size * 15;
  var IMAGE_HEIGHT = tile_size * 15;
  var dimensions = calculateDimensions(max_width, max_height,
                                       IMAGE_WIDTH, IMAGE_HEIGHT);
  var cut_x = 0;
  var cut_y = 7 * tile_size;
  var cut_width = 8 * tile_size;
  var cut_height = 8 * tile_size;
  var max_grid = (grid_width > grid_height) ? grid_width : grid_height;
  if (max_grid > 8) {
    cut_y = (15 - max_grid) * tile_size;
    cut_width = max_grid * tile_size;
    cut_height = max_grid * tile_size;
  }
  return new animator.StaticImageElement(
      id, image, dimensions[0], dimensions[1],
      cut_x, cut_y,
      cut_width, cut_height
    );
}

function createDesertBackground(id, max_width, max_height) {
  var image = ResourceLoader.get(DESERT_BACKGROUND_URL);
  var IMAGE_WIDTH = 500;
  var IMAGE_HEIGHT = 500;
  var dimensions = calculateDimensions(max_width, max_height,
                                       IMAGE_WIDTH, IMAGE_HEIGHT);
  return new animator.StaticImageElement(
    id, image, dimensions[0], dimensions[1]
  );
}

function createSource(id, max_width, max_height) {
  var image = ResourceLoader.get(SOURCE_IMAGE_URL);

  var IMAGE_WIDTH = 48;
  var IMAGE_HEIGHT = 3 * 48;
  var dimensions = calculateDimensions(max_width, max_height, IMAGE_WIDTH, IMAGE_HEIGHT);

  return new animator.AnimatedImageElement(
      id,
      {"default": image},
      [
        new animator.SpriteAnimation("source_of_nothing", [0]),
        new animator.SpriteAnimation("source_of_iron", [1]),
        new animator.SpriteAnimation("source_of_glass", [2]),
        new animator.SpriteAnimation("source_of_fuel", [3]),
        new animator.SpriteAnimation("source_of_ship_head", [4]),
        new animator.SpriteAnimation("source_of_ship_body", [5]),
        new animator.SpriteAnimation("source_of_ship_tail", [6])
      ],
      7,
      1,
      dimensions[0],
      dimensions[1]
      );

}

var ROBOTIC_ARM_HOLDING_IRON_STYLE = "robotic_arm_holding_iron";
var ROBOTIC_ARM_HOLDING_GLASS_STYLE = "robotic_arm_holding_glass";
var ROBOTIC_ARM_HOLDING_FUEL_STYLE = "robotic_arm_holding_fuel";

//Creates an AnimatedImageElement that renders to a robotic arm
function createRoboticArm(id, max_width, max_height) {
  var robotic_arm_image = ResourceLoader.get(ROBOTIC_ARM_IMAGE_URL);

  var robotic_arm_holding_iron_image = ResourceLoader.get(
      ROBOTIC_ARM_HOLDING_IRON_IMAGE_URL);

  var robotic_arm_holding_glass_image = ResourceLoader.get(
      ROBOTIC_ARM_HOLDING_GLASS_IMAGE_URL);

  var robotic_arm_holding_fuel_image = ResourceLoader.get(
      ROBOTIC_ARM_HOLDING_FUEL_IMAGE_URL);

  var styles = {"default": robotic_arm_image};
  styles[ROBOTIC_ARM_HOLDING_IRON_STYLE] = robotic_arm_holding_iron_image;
  styles[ROBOTIC_ARM_HOLDING_GLASS_STYLE] = robotic_arm_holding_glass_image;
  styles[ROBOTIC_ARM_HOLDING_FUEL_STYLE] = robotic_arm_holding_fuel_image;

  var IMAGE_WIDTH = 48;
  var IMAGE_HEIGHT = 3 * 48;
  var dimensions = calculateDimensions(max_width, max_height, IMAGE_WIDTH, IMAGE_HEIGHT);

  var move_right_frames = [0, 1, 2, 3];
  var move_left_frames = [3, 2, 1, 0];
  var move_up_frames = [4, 5, 6, 7];
  var move_down_frames = [7, 6, 5, 4, 0];

  var move_right_animation = new animator.SpriteAnimation(
      "move_right", move_right_frames);

  var move_left_animation = new animator.SpriteAnimation(
      "move_left", move_left_frames);

  var move_up_animation = new animator.SpriteAnimation(
      "move_up", move_up_frames);

  var move_down_animation = new animator.SpriteAnimation(
      "move_down", move_down_frames);

  return new animator.AnimatedImageElement(
      id,
      styles,
      [
        move_up_animation,
        move_down_animation,
        move_right_animation,
        move_left_animation
      ],
      4,
      2,
      dimensions[0],
      dimensions[1]
      );
}

// Creates an AnimatedImageElement that renders to the static background of the
// spaceship factory.
function createSpaceshipFactoryBackground(id, max_width, max_height) {
  var image = ResourceLoader.get(SPACESHIP_FACTORY_BACKGROUND_URL);
  var IMAGE_WIDTH = 48 * 10;
  var IMAGE_HEIGHT = 48 * 10;
  var dimensions = calculateDimensions(max_width, max_height,
                                       IMAGE_WIDTH, IMAGE_HEIGHT);
  return new animator.AnimatedImageElement(
      id,
      image,
      [],
      1,
      1,
      dimensions[0],
      dimensions[1]
    );
}

var ROBOT_HOLDING_STYLE = "robot_holding";

// Creates an AnimatedImageElement that renders to a robot.
// It has four animations: walk_down, walk_up, walk_left and
// walk_right.
// The robot is rendered with the maximum possible size, respecting
// original proportions, and `max_width` and `max_height`, if any are given.
// If none are given, the image's original size is used.
function createRobot(id, max_width, max_height) {
  var image = ResourceLoader.get(ROBOT_IMAGE_URL);
  var holding_image = ResourceLoader.get(ROBOT_HOLDING_IMAGE_URL, true);
  var IMAGE_WIDTH = 100;
  var IMAGE_HEIGHT = 100;
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

var ALIEN_LEFT_IMAGE_URL = "/static/images/elements/alien-left.png";
var ALIEN_RIGHT_IMAGE_URL = "/static/images/elements/alien-right.png";

function createAlien(id, max_width, max_height) {
  var image01 = ResourceLoader.get(ALIEN_LEFT_IMAGE_URL);
  var image02 = ResourceLoader.get(ALIEN_RIGHT_IMAGE_URL);
  var IMAGE_WIDTH = 50;
  var IMAGE_HEIGHT = 50;
  var dimensions = calculateDimensions(max_width, max_height,
                                       IMAGE_WIDTH, IMAGE_HEIGHT);
  var look_right_frames = [0,1,2,3];
  var look_left_frames = [4,5,6,7];
  var panic_frames = [8,9,10,9,10,9,10];
  var dead_frames = [11]
  var styles = {
    "default": image01,
    "alien_left": image01,
    "alien_right": image02
  };
  return new animator.AnimatedImageElement(
    id,
    styles,
    [
      new animator.SpriteAnimation("look_left", look_left_frames),
      new animator.SpriteAnimation("look_right", look_right_frames),
      new animator.SpriteAnimation("panic", panic_frames),
      new animator.SpriteAnimation("dead", dead_frames),
    ],
    4,
    3,
    dimensions[0],
    dimensions[1]
  );
}

var GOOD_BATTERY_IMAGE_URL = "/static/images/elements/good-battery.png";
var BAD_BATTERY_IMAGE_URL = "/static/images/elements/bad-battery.png";

function createBattery(id, max_width, max_height, is_good) {
  var image = null;
  var IMAGE_WIDTH = 50;
  var IMAGE_HEIGHT = 50;

  if (is_good) {
    image = ResourceLoader.get(GOOD_BATTERY_IMAGE_URL);
  } else {
    image = ResourceLoader.get(BAD_BATTERY_IMAGE_URL);
  }

  var dimensions = calculateDimensions(max_width, max_height,
                                       IMAGE_WIDTH, IMAGE_HEIGHT);

  return new animator.AnimatedImageElement(
      id,
      image,
      [],
      1,
      1,
      dimensions[0],
      dimensions[1]
      );
}

function createAsteroid(id, max_width, max_height) {
  var image = ResourceLoader.get(ASTEROIDS_IMAGE_URL);
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

function createRock(id, max_width, max_height) {
  var image = ResourceLoader.get(ROCKS_IMAGE_URL);
  var IMAGE_WIDTH = 50;
  var IMAGE_HEIGHT = 50;
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

  var rock_0_frames = [0];
  var rock_1_frames = [1];
  var rock_2_frames = [2];
  var rock_3_frames = [3];
  var rock_4_frames = [4];
  var rock_5_frames = [5];
  var rock_6_frames = [6];
  var rock_7_frames = [7];

  return new animator.AnimatedImageElement(
      id,
      image,
      [
        new animator.SpriteAnimation("rock_0", rock_0_frames),
        new animator.SpriteAnimation("rock_1", rock_1_frames),
        new animator.SpriteAnimation("rock_2", rock_2_frames),
        new animator.SpriteAnimation("rock_3", rock_3_frames),
        new animator.SpriteAnimation("rock_4", rock_4_frames),
        new animator.SpriteAnimation("rock_5", rock_5_frames),
        new animator.SpriteAnimation("rock_6", rock_6_frames),
        new animator.SpriteAnimation("rock_7", rock_7_frames),
      ],
      4,
      2,
      width,
      height
      );
}

function createWall(id, max_width, max_height) {
  var image = ResourceLoader.get(WALL_IMAGE_URL);
  var IMAGE_WIDTH = 50;
  var IMAGE_HEIGHT = 50;
  var dimensions = calculateDimensions(max_width, max_height,
                                       IMAGE_WIDTH, IMAGE_HEIGHT);
  return new animator.StaticImageElement(id, image,
                                         dimensions[0], dimensions[1]);
}

function createMachineComponent(id, max_width, max_height) {
  var image = ResourceLoader.get(MACHINE_COMPONENT_URL);
  var IMAGE_WIDTH = 32;
  var IMAGE_HEIGHT = 32;

  var dimensions = calculateDimensions(max_width, max_height,
                                       IMAGE_WIDTH, IMAGE_HEIGHT);

  return new animator.AnimatedImageElement(
      id, image, [], 1, 1, dimensions[0], dimensions[1]);
}

var WORKING_MACHINE_STYLE = "working_machine";

function createMachine(id, max_width, max_height) {
  var default_image = ResourceLoader.get(MACHINE_URL);
  var working_machine_image = ResourceLoader.get(WORKING_MACHINE_URL);
  var IMAGE_WIDTH = 48;
  var IMAGE_HEIGHT = 48;
  var dimensions = calculateDimensions(max_width, max_height,
                                       IMAGE_WIDTH, IMAGE_HEIGHT);
  var styles = {"default": default_image};
  styles[WORKING_MACHINE_STYLE] = working_machine_image;
  return new animator.AnimatedImageElement(
      id, styles, [], 1, 1, dimensions[0], dimensions[1]);
}

function createDeposit (id, max_width, max_height) {
  return new animator.RectangleElement(id, max_width, max_height, "green", "black", 2);
};

function createMachine2 (id, max_width, max_height) {
  return new animator.RectangleElement(id, max_width, max_height, "blue", "black", 2);
};

function createArm (id, max_width, max_height) {
  return new animator.RectangleElement(id, max_width, max_height, "orange", "black", 2);
};

function future_createDeposit(id, capacity, item_type, max_width, max_height) {
  var IMAGE_WIDTH = 48;
  var IMAGE_HEIGHT = 5 * 48;
  var actual_dimensions = calculateDimensions(
    max_width, max_height, IMAGE_WIDTH, IMAGE_HEIGHT);
  var width = actual_dimensions[0];
  var height = actual_dimensions[1];

  var styles = {default: ResourceLoader.get(IRON_DEPOSIT_URL)};
  styles['IRON'] = styles.default;
  styles['GLASS'] = ResourceLoader.get(GLASS_DEPOSIT_URL);
  styles['FUEL'] = ResourceLoader.get(FUEL_DEPOSIT_URL);
  styles['SHIP_HEAD'] = styles.default; //SHIP_HEAD_DEPOSIT_URL;
  styles['SHIP_BODY'] = styles.default; //SHIP_BODY_DEPOSIT_URL;
  styles['SHIP_TAIL'] = styles.default; //SHIP_TAIL_DEPOSIT_URL;

  var animations = new Array();
  for (var i = 0; i <= 4; ++i) {
    animations.push(new animator.SpriteAnimation('fill_' + i, [(capacity-1)*5 + i]));
  }
  return new animator.AnimatedImageElement(
    id,
    styles,
    animations,
    5,
    4,
    width,
    height
  );
};

module.exports = {
  createRobot: createRobot,
  createBattery: createBattery,
  GOOD_BATTERY_IMAGE_URL: GOOD_BATTERY_IMAGE_URL,
  BAD_BATTERY_IMAGE_URL: BAD_BATTERY_IMAGE_URL,
  ROBOT_IMAGE_URL: ROBOT_IMAGE_URL,
  ROBOT_HOLDING_IMAGE_URL: ROBOT_HOLDING_IMAGE_URL,
  ROBOT_HOLDING_STYLE: ROBOT_HOLDING_STYLE,
  createAsteroid: createAsteroid,
  createRock: createRock,
  createWall: createWall,
  ASTEROIDS_IMAGE_URL: ASTEROIDS_IMAGE_URL,
  ROCKS_IMAGE_URL: ROCKS_IMAGE_URL,
  WALL_IMAGE_URL: WALL_IMAGE_URL,
  MACHINE_COMPONENT_URL: MACHINE_COMPONENT_URL,
  MACHINE_URL: MACHINE_URL,
  WORKING_MACHINE_URL: WORKING_MACHINE_URL,
  WORKING_MACHINE_STYLE: WORKING_MACHINE_STYLE,
  IRON_DEPOSIT_URL: IRON_DEPOSIT_URL,
  GLASS_DEPOSIT_URL: GLASS_DEPOSIT_URL,
  FUEL_DEPOSIT_URL: FUEL_DEPOSIT_URL,
  createMachineComponent: createMachineComponent,
  createMachine: createMachine,
  createAsteroidsBackground: createAsteroidsBackground,
  createDesertBackground: createDesertBackground,
  ASTEROIDS_BACKGROUND_URL: ASTEROIDS_BACKGROUND_URL,
  DESERT_BACKGROUND_URL: DESERT_BACKGROUND_URL,
  createSource: createSource,
  createDeposit: createDeposit,
  future_createDeposit: future_createDeposit,
  createMachine2: createMachine2,
  createArm: createArm,
  createRoboticArm: createRoboticArm,
  createSpaceshipFactoryBackground: createSpaceshipFactoryBackground,
  ROBOTIC_ARM_IMAGE_URL: ROBOTIC_ARM_IMAGE_URL,
  ROBOTIC_ARM_HOLDING_IRON_IMAGE_URL: ROBOTIC_ARM_HOLDING_IRON_IMAGE_URL,
  ROBOTIC_ARM_HOLDING_GLASS_IMAGE_URL: ROBOTIC_ARM_HOLDING_GLASS_IMAGE_URL,
  ROBOTIC_ARM_HOLDING_FUEL_IMAGE_URL: ROBOTIC_ARM_HOLDING_FUEL_IMAGE_URL,
  ROBOTIC_ARM_HOLDING_IRON_STYLE: ROBOTIC_ARM_HOLDING_IRON_STYLE,
  ROBOTIC_ARM_HOLDING_GLASS_STYLE: ROBOTIC_ARM_HOLDING_GLASS_STYLE,
  ROBOTIC_ARM_HOLDING_FUEL_STYLE: ROBOTIC_ARM_HOLDING_FUEL_STYLE,
  SPACESHIP_FACTORY_BACKGROUND_URL: SPACESHIP_FACTORY_BACKGROUND_URL,
  SOURCE_IMAGE_URL: SOURCE_IMAGE_URL,
  createAlien: createAlien,
  ALIEN_LEFT_IMAGE_URL: ALIEN_LEFT_IMAGE_URL,
  ALIEN_RIGHT_IMAGE_URL: ALIEN_RIGHT_IMAGE_URL,
};
