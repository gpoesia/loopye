/*
 * Game in which you write code to make robots collect batteries.
 */

var React = require("react");
var Interpreter = require("../language/interpreter")
var Animator = require("../util/animator");
var ResourceLoader = require("../util/resource_loader");
var AnimationFactories = require("../util/animator/animation_factories");
var ElementFactories = require("../util/animator/element_factories");
var Robolang = require("../language/robolang/robolang");
var Constants = require("../constants");
var Icons = require("../view/icons");
var Grid = require("../lesson/utils/grid");
var Game = require("./game");

var FailureReasons = {
  HIT_LEAKING_BATTERY: 1,
  LEFT_GRID: 2,
  LEFT_BATTERIES_BEHIND: 3,
};

var Actions = {
  MOVE_FORWARD: "F",
  TURN_LEFT: "E",
  TURN_RIGHT: "D",
};

var GridElements = {
  NONE: 0,
  BATTERY: 1,
  LEAKING_BATTERY: 2,
};
var MAX_GRID_CELL_SIZE = Constants.RUN_VIEW_SQUARE_DIMENSION / 8;

function GameState(rows, cols, initial_position, initial_direction,
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

Object.assign(GameState.prototype, {
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
});

/// Batteries is a game in which the player must make a robot collect
/// good batteries and avoid bad batteries.
function BatteriesGameRunner() {
  Game.GameRunner.call(this);
  this._solved = false;
}

BatteriesGameRunner.prototype = Object.create(Game.GameRunner);
Object.assign(BatteriesGameRunner.prototype, {
  getGameID: function() {
    return "batteries";
  },

  reset: function(gameParameters, canvas) {
    this._gameParameters = gameParameters;

    this._state = new GameState(gameParameters.rows,
                                gameParameters.cols,
                                gameParameters.initial_position,
                                gameParameters.initial_direction,
                                gameParameters.batteries_positions,
                                gameParameters.leaking_batteries_position);

    this._animator = new Animator.Animator();
    this._initializeElements();

    if (canvas) {
      this._animator.render(canvas, 0);
    }
  },

  run: function(sourceCode) {
    this.reset(this._gameParameters);

    var interpreter = new Robolang.Interpreter();
    var compilation_errors = interpreter.parse(sourceCode);

    if (compilation_errors) {
      return {compilation_errors: compilation_errors};
    }

    var actions_list = [];
    var action = null;

    for (var t = 0; !!(action = interpreter.runUntilNextAction()); ++t) {
      actions_list.push(action);
      var location = interpreter.getCurrentLocation();
      this._animator.addEvent(t, {type: Game.AnimationEventTypes.ACTIVE_CODE_CHANGED,
                                  beginLine: location.getBegin().getLine(),
                                  endLine: location.getEnd().getLine(),
                                  beginColumn: location.getBegin().getColumn(),
                                  endColumn: location.getEnd().getColumn()});
    }

    var runtime_errors = this._render(actions_list);

    if (!runtime_errors.length) {
      this._solved = true;
    }

    return {
      runtime_errors: runtime_errors,
      animator: this._animator,
    };
  },

  challengeSolved: function() {
    return this._solved;
  },

  populateResourceLoader: function() {
    ResourceLoader.addImage(ElementFactories.ROBOT_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.GOOD_BATTERY_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.BAD_BATTERY_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.DESERT_BACKGROUND_URL);
    ResourceLoader.addImage(ElementFactories.ROCKS_IMAGE_URL);
  },

  // Creates the elements of the class in their initial position.
  // Good batteries receive the ID "b_i_j" where i is its row and j its column
  // in the grid. This is used to later make them vanish when they're collected.
  // Similarly, leaking batteries receive the id "l_i_j".
  // The robot receives ID "r".
  _initializeElements: function() {
    var grid_cell_size = this._state.gridCellSize();

    // Offsets that centralize the canvas.
    var offset_x = (Constants.RUN_VIEW_SQUARE_DIMENSION / 2 -
                    grid_cell_size * this._state.columns() / 2);
    var offset_y = (Constants.RUN_VIEW_SQUARE_DIMENSION / 2 -
                    grid_cell_size * this._state.rows() / 2);
    this._animator.setOrigin(offset_x, offset_y);

    var background = ElementFactories.createDesertBackground(
        "background",
        Constants.RUN_VIEW_SQUARE_DIMENSION,
        Constants.RUN_VIEW_SQUARE_DIMENSION
        );
    background.x = Constants.RUN_VIEW_SQUARE_DIMENSION / 2 - offset_x;
    background.y = Constants.RUN_VIEW_SQUARE_DIMENSION / 2 - offset_y;
    this._animator.addElement(background);

    var rock_size = grid_cell_size;

    for (i = 0; i < this._state.rows()+2; i++) {
      var rock = new ElementFactories.createRock('r' + i + '0', rock_size);
      rock.x = (-0.5) * grid_cell_size;
      rock.y = (0.5 + i-1) * grid_cell_size;
      this._animator.addElement(rock);
      var rock_number = (this._state.rows() * i + 0) % 8;
      this._animator.addAnimation(rock.createAnimation(
        'rock_' + rock_number, 0, 1, 1));

      rock = new ElementFactories.createRock('r' + i + (this._state.columns()+1),
                                             rock_size);
      rock.x = (0.5 + this._state.columns()) * grid_cell_size;
      rock.y = (0.5 + i-1) * grid_cell_size;
      this._animator.addElement(rock);
      rock_number = (this._state.rows() * i + this._state.columns() + 1) % 8;
      this._animator.addAnimation(rock.createAnimation(
        'rock_' + rock_number, 0, 1, 1));

      if (i == 0 || i == this._state.rows()+1) {
        for (j = 1; j < this._state.columns()+1; j++) {
          rock = new ElementFactories.createRock('r' + i + j, rock_size);
          rock.x = (0.5 + j-1) * grid_cell_size;
          rock.y = (0.5 + i-1) * grid_cell_size;
          this._animator.addElement(rock);
          rock_number = (this._state.rows() * i + j) % 8;
          this._animator.addAnimation(rock.createAnimation(
            'rock_' + rock_number, 0, 1, 1));
        }
      }
    }

    var grid = new Animator.SimpleGridElement(
        "grid", grid_cell_size, this._state.rows(),
        grid_cell_size, this._state.columns(),
        'rgba(255,243,161,1)', 5
        );
    this._animator.addElement(grid);

    var battery_size = grid_cell_size;

    for (var i = 0; i < this._state.batteries().length; ++i) {
      var battery = this._state.batteries()[i];
      var element = new ElementFactories.createBattery(
            "b_" + battery.row + "_" + battery.column,
            battery_size,
            battery_size,
            true);
      element.x = (0.5 + battery.column) * grid_cell_size;
      element.y = (0.5 + battery.row) * grid_cell_size;
      this._animator.addElement(element);
    }

    for (var i = 0; i < this._state.leakingBatteries().length; ++i) {
      var battery = this._state.leakingBatteries()[i];
      var element = new ElementFactories.createBattery(
            "l_" + battery.row + "_" + battery.column,
            battery_size,
            battery_size,
            false);
      element.x = (0.5 + battery.column) * grid_cell_size;
      element.y = (0.5 + battery.row) * grid_cell_size;
      this._animator.addElement(element);
    }

    this._character = new ElementFactories.createRobot(
        "r", grid_cell_size*2, grid_cell_size*2);
    this._character.x = (0.5 + this._state.position().column) * grid_cell_size;
    this._character.y = (0.5 + this._state.position().row) * grid_cell_size;
    this._animator.addElement(this._character);
    this._animator.addAnimation(this._character.createAnimation(
          "turn_" + Grid.directionName(this._state.direction()),
          0, 0, 1));
  },

  // Renders the execution to the animator.
  // Returns a list of runtime error messages (empty if the player succeeded).
  _render: function(raw_actions) {
    var actions = this._parseActions(raw_actions);
    var grid_cell_size = this._state.gridCellSize();
    var failure_reason = null;

    for (var i = 0; i < actions.length; i++) {
      // Used to decide the animation after the action is processed.
      var isTurnAction = false;

      switch (actions[i]) {
        case Actions.TURN_LEFT:
          failure_reason = this._state.turnLeft();
          isTurnAction = true;
          break;

        case Actions.TURN_RIGHT:
          failure_reason = this._state.turnRight();
          isTurnAction = true;
          break;

        case Actions.MOVE_FORWARD:
          failure_reason = this._state.moveRobot();
          break;
      }

      if (isTurnAction) {
        this._animator.addAnimation(
            this._character.createAnimation(
              "turn_" + Grid.directionName(this._state.direction()),
              i + 0.5, i + 1, 1));
      } else {
        this._animator.addAnimation(AnimationFactories.straightMove(
              'r',
              i,
              i + 1,
              this._state.direction().column * grid_cell_size,
              this._state.direction().row * grid_cell_size));
        this._animator.addAnimation(this._character.createAnimation(
              "walk_" + Grid.directionName(this._state.direction()),
              i, i + 1, 0.5));

        // Hide battery in current position.
        var row = this._state.position().row;
        var column = this._state.position().column;
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

    if (!failure_reason && !this._state.gotAllBatteries()) {
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
        case Actions.TURN_LEFT:
          actions.push(Actions.TURN_LEFT);
          break;
        case Actions.TURN_RIGHT:
          actions.push(Actions.TURN_RIGHT);
          break;
        case Actions.MOVE_FORWARD:
          actions.push(Actions.MOVE_FORWARD);
          break;
        default:
          actions.push(null);
      }
    }

    return actions;
  },
});

Game.registerGame("batteries", BatteriesGameRunner);

module.exports = {
  BatteriesGameRunner: BatteriesGameRunner,
};
