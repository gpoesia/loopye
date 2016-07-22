/*
 * comp4kids programming 101 lesson 2.
 */

var React = require("react");
var Lesson = require("./lesson");
var Interpreter = require("../language/interpreter")
var Animator = require("../util/animator");
var ResourceLoader = require("../util/resource_loader");
var AnimationFactories = require("../util/animator/animation_factories");
var ElementFactories = require("../util/animator/element_factories");
var Robolang = require("../language/robolang/robolang");
var Constants = require("../constants");
var Icons = require("../view/icons");
var Grid = require("./utils/grid");

var FailureReasons = {
  HIT_LEAKING_BATTERY: 1,
  LEFT_GRID: 2,
  LEFT_BATTERIES_BEHIND: 3,
};

var MAX_GRID_CELL_SIZE = Constants.RUN_VIEW_SQUARE_DIMENSION / 8;

var GridElements = {
  NONE: 0,
  BATTERY: 1,
  LEAKING_BATTERY: 2,
};

var MAX_GRID_CELL_SIZE = Constants.RUN_VIEW_SQUARE_DIMENSION / 8;

function Lesson02Game(rows, cols, initial_position, initial_direction,
                      batteries_positions, leaking_batteries_positions) {
  this._grid = null;
  this._rows = rows;
  this._columns = cols;
  this._initial_position = initial_position;
  this._initial_direction = initial_direction;
  this._batteries_positions = batteries_positions;
  this._leaking_batteries_positions = leaking_batteries_positions;
  this.reset();
}

Lesson02Game.prototype = {
  reset: function() {
    this._grid = new Grid.Grid(this._rows, this._columns);

    for (var i = 0; i < this._rows; i++) {
      for (var j = 0; j < this._columns; j++) {
        this._grid.set(i, j, GridElements.NONE);
      }
    }

    for (var i = 0; i < this._batteries_positions.length; i++) {
      this._grid.set(this._batteries_positions[i].row,
                     this._batteries_positions[i].column,
                     GridElements.BATTERY);
    }

    for (var i = 0; i < this._leaking_batteries_positions.length; i++) {
      this._grid.set(this._leaking_batteries_positions[i].row,
                     this._leaking_batteries_positions[i].column,
                     GridElements.LEAKING_BATTERY);
    }

    this._position = this._initial_position;
    this._direction = this._initial_direction;
    this._batteries = 0;
  },

  batteries: function() {
    return this._batteries_positions;
  },

  leakingBatteries: function() {
    return this._leaking_batteries_positions;
  },

  moveRobot: function() {
    var intended_position = this._position.add(this._direction);

    if (this._grid.valid(intended_position.row, intended_position.column)) {
      this._position = intended_position;
    } else {
      return FailureReasons.LEFT_GRID;
    }

    if (this._grid.get(this._position.row, this._position.column) ===
        GridElements.LEAKING_BATTERY) {
      return FailureReasons.HIT_LEAKING_BATTERY;
    }

    if (this._grid.get(this._position.row, this._position.column) ===
        GridElements.BATTERY) {
      this._batteries++;
      this._grid.set(this._position.row, this._position.column,
                     GridElements.NONE);
    }
  },

  gridCellSize: function() {
    return Math.min(MAX_GRID_CELL_SIZE,
                    (Constants.RUN_VIEW_SQUARE_DIMENSION /
                     Math.max(this._grid.rows(), this._grid.columns())));
  },

  position: function() {
    return this._position;
  },

  direction: function() {
    return this._direction;
  },

  rows: function() {
    return this._grid.rows();
  },

  columns: function() {
    return this._grid.columns();
  },

  turnLeft: function() {
    this._direction = Grid.turnLeft(this._direction);
  },

  turnRight: function() {
    this._direction = Grid.turnRight(this._direction);
  },

  gotAllBatteries: function() {
    return this._batteries === this._batteries_positions.length;
  },
};

function Lesson02ExerciseStepPlayer(is_example, rows, cols, robot_position,
                                    robot_direction,
                                    batteries_positions,
                                    leaking_batteries_positions) {
  Lesson.LessonStepPlayer.call(this);
  this._game = new Lesson02Game(rows, cols,
                                robot_position, robot_direction,
                                batteries_positions,
                                leaking_batteries_positions);
  this._solved = !!is_example;
}

// Types of actions supported in this lesson.
var Actions = {
  MOVE_FORWARD: 1,
  TURN_LEFT: 2,
  TURN_RIGHT: 3,
};

Lesson02ExerciseStepPlayer.prototype = {
  reset: function(canvas) {
    this._animator = new Animator.Animator();
    this._game.reset();
    this._initializeElements();

    if (canvas) {
      this._animator.render(canvas, 0);
    }
  },

  play: function(sourceCode) {
    this.reset();

    var interpreter = new Robolang.Interpreter();
    var compilation_errors = interpreter.parse(sourceCode);

    if (compilation_errors) {
      return {compilation_errors: compilation_errors};
    }

    var actions_list = interpreter.run();
    var runtime_errors = this._render(actions_list);

    if (!runtime_errors.length) {
      this._solved = true;
    }

    return {
      runtime_errors: runtime_errors,
      animator: this._animator,
    };
  },

  isInAcceptingState: function() {
    return this._solved;
  },

  // Creates the elements of the class in their initial position.
  // Good batteries receive the ID "b_i_j" where i is its row and j its column
  // in the grid. This is used to later make them vanish when they're collected.
  // Similarly, leaking batteries receive the id "l_i_j".
  // The robot receives ID "r".
  _initializeElements: function() {
    var grid_cell_size = this._game.gridCellSize();

    // Offsets that centralize the canvas.
    var offset_x = (Constants.RUN_VIEW_SQUARE_DIMENSION / 2 -
                    grid_cell_size * this._game.columns() / 2);
    var offset_y = (Constants.RUN_VIEW_SQUARE_DIMENSION / 2 -
                    grid_cell_size * this._game.rows() / 2);
    this._animator.setOrigin(offset_x, offset_y);

    var grid = new Animator.SimpleGridElement(
        "grid", grid_cell_size, this._game.rows(),
         grid_cell_size, this._game.columns());
    this._animator.addElement(grid);

    for (var i = 0; i < this._game.batteries().length; ++i) {
      var battery = this._game.batteries()[i];
      var element = new ElementFactories.createBattery(
            "b_" + battery.row + "_" + battery.column,
            grid_cell_size / 2,
            grid_cell_size / 2,
            true);
      element.x = (0.5 + battery.column) * grid_cell_size;
      element.y = (0.5 + battery.row) * grid_cell_size;
      this._animator.addElement(element);
    }

    for (var i = 0; i < this._game.leakingBatteries().length; ++i) {
      var battery = this._game.leakingBatteries()[i];
      var element = new ElementFactories.createBattery(
            "l_" + battery.row + "_" + battery.column,
            grid_cell_size / 2,
            grid_cell_size / 2,
            false);
      element.x = (0.5 + battery.column) * grid_cell_size;
      element.y = (0.5 + battery.row) * grid_cell_size;
      this._animator.addElement(element);
    }

    this._character = new ElementFactories.createRobot(
        "r", grid_cell_size, grid_cell_size);
    this._character.x = (0.5 + this._game.position().column) * grid_cell_size;
    this._character.y = (0.5 + this._game.position().row) * grid_cell_size;
    this._animator.addElement(this._character);
    this._animator.addAnimation(this._character.createAnimation(
          "turn_" + Grid.directionName(this._game.direction()),
          0, 0, 1));
  },

  // Renders the execution to the animator.
  // Returns a list of runtime error messages (empty if the player succeeded).
  _render: function(raw_actions) {
    var actions = this._parseActions(raw_actions);
    var grid_cell_size = this._game.gridCellSize();
    var failure_reason = null;

    for (var i = 0; i < actions.length; i++) {
      // Used to decide the animation after the action is processed.
      var isTurnAction = false;

      switch (actions[i]) {
        case Actions.TURN_LEFT:
          failure_reason = this._game.turnLeft();
          isTurnAction = true;
          break;

        case Actions.TURN_RIGHT:
          failure_reason = this._game.turnRight();
          isTurnAction = true;
          break;

        case Actions.MOVE_FORWARD:
          failure_reason = this._game.moveRobot();
          break;
      }

      if (isTurnAction) {
        this._animator.addAnimation(
            this._character.createAnimation(
              "turn_" + Grid.directionName(this._game.direction()),
              i + 0.5, i + 1, 1));
      } else {
        this._animator.addAnimation(AnimationFactories.straightMove(
              'r',
              i,
              i + 1,
              this._game.direction().column * grid_cell_size,
              this._game.direction().row * grid_cell_size));
        this._animator.addAnimation(this._character.createAnimation(
              "walk_" + Grid.directionName(this._game.direction()),
              i, i + 1, 0.5));

        // Hide battery in current position.
        var row = this._game.position().row;
        var column = this._game.position().column;
        var good_battery_id = "b_" + row + "_" + column;
        var bad_battery_id = "l_" + row + "_" + column;

        if (this._animator.hasElement(good_battery_id)) {
          this._animator.addAnimation(
              AnimationFactories.makeInvisible(good_battery_id, i + 1));
        }

        if (this._animator.hasElement(bad_battery_id)) {
          this._animator.addAnimation(
              AnimationFactories.makeInvisible(bad_battery_id, i + 1));
        }
      }

      if (failure_reason)
        break;
    }

    if (!failure_reason && !this._game.gotAllBatteries()) {
      failure_reason = FailureReasons.LEFT_BATTERIES_BEHIND;
    }

    if (!failure_reason)
      return [];

    if (failure_reason === FailureReasons.LEFT_GRID) {
      return [Constants.Lesson02.FAILURE_MESSAGE_LEFT_GRID];
    } else if (failure_reason === FailureReasons.HIT_LEAKING_BATTERY) {
      return [Constants.Lesson02.FAILURE_MESSAGE_HIT_LEAKING_BATTERY];
    } else if (failure_reason === FailureReasons.LEFT_BATTERIES_BEHIND) {
      return [Constants.Lesson02.FAILURE_MESSAGE_LEFT_BATTERIES_BEHIND];
    } else {
      throw "Unknown failure reason " + failure_reason;
    }
  },

  // Converts the list of executed actions given by the interpreter (strings)
  // to values in Actions. If an unknown action is found, its corresponding
  // element in the returned list will be null.
  _parseActions: function(raw_actions) {
    var actions = Array();

    for (var i = 0; i < raw_actions.length; i++) {
      var action = raw_actions[i];

      switch (action) {
        case "L":
          actions.push(Actions.TURN_LEFT);
          break;
        case "R":
          actions.push(Actions.TURN_RIGHT);
          break;
        case "F":
          actions.push(Actions.MOVE_FORWARD);
          break;
        default:
          actions.push(null);
      }
    }

    return actions;
  },
};

function Lesson02() {
  Lesson.Lesson.call(this);

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Pegue as baterias boas (verdes) e não encoste nas que estão
        vazando (vermelhas).
      </p>,
      <div>
        <p>
          Olá de novo! Eu estava mesmo precisando de você.
        </p>
        <p>
          Nossos robôs precisam de ajuda. A chuva de meteoros passou, finalmente,
          e graças a você estão todos a salvo agora. Porém, há um outro problema.
          Eles precisam comer!
        </p>
        <p>
          Este planeta já foi campo de vários centros de pesquisa científica.
          Parece que nossos amigos cientistas deixaram o planeta e se esqueceram
          de levar todas as suas baterias. Podemos usá-las para alimentar nossos robôs.
        </p>
        <p>
          Mas algumas ficaram velhas. Veja: há algumas vermelhas. Essas devem ser
          evitadas a todo custo.
        </p>
      </div>,
      new Lesson02ExerciseStepPlayer(
        false, 5, 5, new Grid.Position(4, 0), Grid.Directions.RIGHT,
        [new Grid.Position(1, 3), new Grid.Position(4, 3)],
        [new Grid.Position(1, 4), new Grid.Position(4, 1)]),
      "LF",
      Constants.Lesson02.SUCCESS_MESSAGE,
      9));
}

Lesson02.prototype = Object.create(Lesson.Lesson.prototype);
Object.assign(Lesson02.prototype, {
  getResourceLoader: function() {
    var loader = new ResourceLoader();
    loader.addImage(ElementFactories.ROBOT_IMAGE_URL);
    loader.addImage(ElementFactories.GOOD_BATTERY_IMAGE_URL);
    loader.addImage(ElementFactories.BAD_BATTERY_IMAGE_URL);
    return loader;
  },
});

module.exports = Lesson02;
