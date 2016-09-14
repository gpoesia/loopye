/*
 * comp4kids programming 101 lesson 3: conditionals.
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

// Possible runtine errors.
var FailureReasons = {
  NO_COMPONENT_TO_GET: 1,
  NO_COMPONENT_TO_PUT: 2,
  HIT_MACHINE: 3,
  LEFT_GRID: 4,
  TRIED_HOLDING_TWO_COMPONENTS: 5,
  NO_MACHINE_TO_PUT_COMPONENT_IN: 6,
  BROKE_COMPONENT: 7,
  MISSION_UNFINISHED: 8,
};

// Actions supported in this lesson.
var Actions = {
  MOVE_FORWARD: "F",
  TURN_LEFT: "L",
  TURN_RIGHT: "R",
  GET_COMPONENT: "G",
  PUT_COMPONENT: "P",
};

// Possible step goals: just get all components, or also fix all machines.
var Goals = {
  GET_ALL_COMPONENTS: 1,
  FIX_ALL_MACHINES: 2,
};

var MAX_GRID_CELL_SIZE = Constants.RUN_VIEW_SQUARE_DIMENSION / 8;

var GridElements = {
  NONE: 0,
  COMPONENT: 1,
  STOPPED_MACHINE: 2,
  WORKING_MACHINE: 2,
};

var Sensors = {
  MACHINE_SENSOR: "maq",
  COMPONENT_SENSOR: "eng",
};

function Lesson03Game(rows, cols, initial_position, initial_direction,
                      components_positions, machines_positions) {
  this._grid = null;
  this._holding_component = false;
  this._rows = rows;
  this._columns = cols;
  this._initial_position = initial_position;
  this._initial_direction = initial_direction;
  this._components_positions = components_positions;
  this._machines_positions = machines_positions;
  this.reset();
}

Lesson03Game.prototype = {
  /// Resets the game to its initial setting.
  reset: function() {
    this._grid = new Grid.Grid(this._rows, this._columns);

    for (var i = 0; i < this._rows; i++) {
      for (var j = 0; j < this._columns; j++) {
        this._grid.set(i, j, GridElements.NONE);
      }
    }

    for (var i = 0; i < this._components_positions.length; i++) {
      this._grid.set(this._components_positions[i].row,
                     this._components_positions[i].column,
                     GridElements.COMPONENT);
    }

    for (var i = 0; i < this._machines_positions.length; i++) {
      this._grid.set(this._machines_positions[i].row,
                     this._machines_positions[i].column,
                     GridElements.STOPPED_MACHINE);
    }

    this._position = this._initial_position;
    this._direction = this._initial_direction;
    this._holding_component = false;
    this._components_left = this._components_positions.length;
    this._machines_left = this._machines_positions.length;
  },

  /// Returns the positions of all components that haven't been picked up yet.
  components: function() {
    return this._grid.findAll(GridElements.COMPONENT);
  },

  /// Returns the positions of all machines that haven't been fixed yet.
  stoppedMachines: function() {
    return this._grid.findAll(GridElements.STOPPED_MACHINE);
  },

  /// Returns the positions of all machines that have already been fixed.
  workingMachines: function() {
    return this._grid.findAll(GridElements.WORKING_MACHINE);
  },

  /// Returns the positions of all machines in the grid.
  machines: function() {
    return this.stoppedMachines().concat(this.workingMachines());
  },

  /// Tries to move the robot forward one position.
  moveRobot: function() {
    var intended_position = this._position.add(this._direction);

    if (this._grid.valid(intended_position.row, intended_position.column)) {
      this._position = intended_position;
    } else {
      return FailureReasons.LEFT_GRID;
    }

    if (this._grid.get(this._position.row, this._position.column) ===
        GridElements.MACHINE) {
      return FailureReasons.HIT_MACHINE;
    }

    if (this._grid.get(this._position.row, this._position.column) ===
        GridElements.COMPONENT) {
      return FailureReasons.BROKE_COMPONENT;
    }
  },

  /// Returns true if there is a component in front of the robot.
  getComponentSensorValue: function() {
    var next_position = this._position.add(this._direction);

    return (this._grid.valid(next_position.row, next_position.column) &&
            this._grid.get(next_position.row, next_position.column) ===
              GridElements.COMPONENT);
  },

  /// Returns true if there is a machine in front of the robot.
  getMachineSensorValue: function() {
    var next_position = this._position.add(this._direction);

    if (!this._grid.valid(next_position.row, next_position.column))
      return false;
    var next_cell = this._grid.get(next_position.row, next_position.column);
    return (next_cell === GridElements.STOPPED_MACHINE ||
            next_cell === GridElements.WORKING_MACHINE);
  },

  /// Tries to get a component in front of the robot.
  /// If the robot is already holding a component,
  /// returns TRIED_HOLDING_TWO_COMPONENTS.
  /// If there's no component to get in the attempted position, returns
  /// NO_COMPONENT_TO_GET.
  getComponent: function() {
    if (this._holding_component) {
      return FailureReasons.TRIED_HOLDING_TWO_COMPONENTS;
    }
    if (this.getComponentSensorValue()) {
      this._holding_component = true;
      var component_position = this._position.add(this._direction);
      this._grid.set(component_position.row, component_position.column,
                     GridElements.NONE);
      this._components_left--;
    } else {
      return FailureReasons.NO_COMPONENT_TO_GET;
    }
  },

  /// Tries to put the component the robot is holding in the machine in front
  /// of it.
  /// If the robot is not holding a component, returns NO_COMPONENT_TO_PUT.
  /// If the robot is not in front of a machine,
  /// returns NO_MACHINE_TO_PUT_COMPONENT_IN.
  putComponent: function() {
    if (!this._holding_component) {
      return FailureReasons.NO_COMPONENT_TO_PUT;
    }
    var machine_position = this._position.add(this._direction);
    if (this._grid.valid(machine_position.row, machine_position.column) &&
        this._grid.get(machine_position.row, machine_position.column) ===
          GridElements.STOPPED_MACHINE) {
      this._holding_component = false;
      this._grid.set(machine_position.row, machine_position.column,
                     GridElements.WORKING_MACHINE);
      this._machines_left--;
    } else {
      return FailureReasons.NO_MACHINE_TO_PUT_COMPONENT_IN;
    }
  },

  gridCellSize: function() {
    return Math.min(MAX_GRID_CELL_SIZE,
                    (Constants.RUN_VIEW_SQUARE_DIMENSION /
                     Math.max(this._grid.rows(), this._grid.columns())));
  },

  /// Returns the current position of the robot.
  position: function() {
    return this._position;
  },

  /// Returns the current direction of the robot.
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

  /// Returns whether all components have been picked up.
  gotAllComponents: function() {
    return this._components_left === 0;
  },

  /// Returns whether all machines have bene fixed.
  fixedAllMachines: function() {
    return this._machines_left === 0;
  },
};

function Lesson03ExerciseStepPlayer(rows, cols, robot_position,
                                    robot_direction,
                                    components_positions,
                                    machines_positions,
                                    goal) {
  Lesson.LessonStepPlayer.call(this);
  this._game = new Lesson03Game(rows, cols,
                                robot_position, robot_direction,
                                components_positions,
                                machines_positions);
  this._goal = goal || Goals.FIX_ALL_MACHINES;
  this._solved = false;
}

Lesson03ExerciseStepPlayer.prototype = {
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

    var runtime_errors = this._render(interpreter);

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

  // Creates the elements of the lesson in their initial positions.
  // Components receive the ID "c_i_j" where i is its row and j its column.
  // in the grid. This is used to later make them vanish when they're collected.
  // Similarly, machines receive the id "m_i_j".
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

    for (var i = 0; i < this._game.components().length; ++i) {
      var component = this._game.components()[i];
      var element = new ElementFactories.createMachineComponent(
            "c_" + component.row + "_" + component.column,
            grid_cell_size / 4,
            grid_cell_size / 4);
      element.x = (0.5 + component.column) * grid_cell_size;
      element.y = (0.5 + component.row) * grid_cell_size;
      this._animator.addElement(element);
    }

    for (var i = 0; i < this._game.machines().length; ++i) {
      var machine = this._game.machines()[i];
      var element = new ElementFactories.createMachine(
            "m_" + machine.row + "_" + machine.column,
            grid_cell_size / 2,
            grid_cell_size / 2);
      element.x = (0.5 + machine.column) * grid_cell_size;
      element.y = (0.5 + machine.row) * grid_cell_size;
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

  // Updates the values of the robot sensor variables to reflect the current
  // state of the game.
  _updateSensors: function(scope) {
    scope.set(Sensors.COMPONENT_SENSOR, this._game.getComponentSensorValue());
    scope.set(Sensors.MACHINE_SENSOR, this._game.getMachineSensorValue());
  },

  // Parses an action literal into a value from Actions.
  // Returns null if the action is unknown.
  _parseAction: function(literal) {
    for (var action in Actions) {
      if (Actions.hasOwnProperty(action)) {
        console.log("Comparing " + literal + " to " + Actions[action]);
        if (Actions[action] == literal) {
          console.log("Match");
          return action;
        }
        console.log("No match");
      }
    }
    return null;
  },

  // Returns whether the goal has been accomplished.
  _finishedMission: function() {
    if (this._goal === Goals.GET_ALL_COMPONENTS) {
      return this._game.gotAllComponents();
    } else {
      return this._game.fixedAllMachines();
    }
  },

  // Renders the execution to the animator.
  // Returns a list of runtime error messages (empty if the player succeeded).
  _render: function(interpreter) {
    var grid_cell_size = this._game.gridCellSize();
    var failure_reason = null;

    this._updateSensors(interpreter.getGlobalScope());

    for (var action_literal = interpreter.runUntilNextAction(), i = 0;
         !!action_literal;
         action_literal = interpreter.runUntilNextAction(), i++) {
      var player_action = action_literal; //this._parseAction(action_literal);

      // Processes action.
      switch (player_action) {
        case Actions.TURN_LEFT:
          failure_reason = this._game.turnLeft();
          break;

        case Actions.TURN_RIGHT:
          failure_reason = this._game.turnRight();
          break;

        case Actions.MOVE_FORWARD:
          failure_reason = this._game.moveRobot();
          break;

        case Actions.GET_COMPONENT:
          failure_reason = this._game.getComponent();
          break;

        case Actions.PUT_COMPONENT:
          failure_reason = this._game.putComponent();
          break;

        default:
          failure_reason = "Unknown action " + action_literal;
      }

      // Create animations corresponding to the executed action.
      switch (player_action) {
        // Make robot turn left/right.
        case Actions.TURN_LEFT:
        case Actions.TURN_RIGHT:
          this._animator.addAnimation(
              this._character.createAnimation(
                "turn_" + Grid.directionName(this._game.direction()),
                i + 0.5, i + 1, 1));
          break;

        // Make robot walk forward.
        case Actions.MOVE_FORWARD:
          this._animator.addAnimation(AnimationFactories.straightMove(
                'r',
                i,
                i + 1,
                this._game.direction().column * grid_cell_size,
                this._game.direction().row * grid_cell_size));
          this._animator.addAnimation(this._character.createAnimation(
                "walk_" + Grid.directionName(this._game.direction()),
                i, i + 1, 0.5));
          break;

        // If there is a component in front of the robot, make it invisible.
        case Actions.GET_COMPONENT:
          if (!!failure_reason)
            break;
          var component_position =
            this._game.position().add(this._game.direction());
          var component_id =
            "c_" + component_position.row + "_" + component_position.column;

          if (this._animator.hasElement(component_id)) {
            this._animator.addAnimation(
                AnimationFactories.makeInvisible(component_id, i + 0.5));
          }
          break;

        // If there is a machine in front of the robot, change its style to
        // "working_machine".
        case Actions.PUT_COMPONENT:
          if (!!failure_reason)
            break;

          var machine_position =
            this._game.position().add(this._game.direction());
          var machine_id =
            "m_" + machine_position.row + "_" + machine_position.column;

          if (this._animator.hasElement(machine_id)) {
            var element = this._animator.getElement(machine_id);
            this._animator.addAnimation(element.changeStyle(
                  ElementFactories.WORKING_MACHINE_STYLE,
                  i + 0.5));
          }

          break;
      }

      if (!!failure_reason)
        break;

      this._updateSensors(interpreter.getGlobalScope());
    }

    if (!failure_reason && !this._finishedMission()) {
      failure_reason = FailureReasons.MISSION_UNFINISHED;
    }

    if (!failure_reason)
      return [];

    if (failure_reason === FailureReasons.LEFT_GRID) {
      return [Constants.Lesson03.LEFT_GRID];
    } else if (failure_reason === FailureReasons.HIT_MACHINE) {
      return [Constants.Lesson03.HIT_MACHINE];
    } else if (failure_reason === FailureReasons.BROKE_COMPONENT) {
      return [Constants.Lesson03.BROKE_COMPONENT];
    } else if (failure_reason === FailureReasons.MISSION_UNFINISHED) {
      return [Constants.Lesson03.MISSION_UNFINISHED];
    } else if (failure_reason === FailureReasons.NO_COMPONENT_TO_GET) {
      return [Constants.Lesson03.NO_COMPONENT_TO_GET];
    } else if (failure_reason === FailureReasons.NO_COMPONENT_TO_PUT) {
      return [Constants.Lesson03.NO_COMPONENT_TO_PUT];
    } else if (failure_reason ===
               FailureReasons.NO_MACHINE_TO_PUT_COMPONENT_IN) {
      return [Constants.Lesson03.NO_MACHINE_TO_PUT_COMPONENT_IN];
    } else if (failure_reason ===
               FailureReasons.TRIED_HOLDING_TWO_COMPONENTS) {
      return [Constants.Lesson03.FAILURE_MESSAGE_CANNOT_HOLD_TWO_COMPONENTS];
    } else {
      throw "Unknown failure reason " + failure_reason;
    }
  },
};

function Lesson03() {
  Lesson.Lesson.call(this);

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Comandos: P (put), G (get), F (forward), L (left), R (right).
        Sensores: eng (engrenagem), maq (máquina). Exemplo: {"eng?{G}"}
      </p>,
      <div>
        <p>
          Objetivo: pegar engrenagem.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, 3, new Grid.Position(0, 0), Grid.Directions.RIGHT,
        [new Grid.Position(2, 2)],
        [],
        Goals.GET_ALL_COMPONENTS),
      "F",
      Constants.Lesson03.SUCCESS_MESSAGE,
      null));


  this.addStep(
    new Lesson.LessonStep(
      <p>
        Comandos: P (put), G (get), F (forward), L (left), R (right).
        Sensores: eng (engrenagem), maq (máquina). Exemplo: {"eng?{G}"}
      </p>,
      <div>
        <p>
          Objetivo: ligar máquina.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, 9, new Grid.Position(0, 0), Grid.Directions.RIGHT,
        [new Grid.Position(0, 1), new Grid.Position(0, 4), new Grid.Position(0, 7)],
        [new Grid.Position(2, 1), new Grid.Position(2, 4), new Grid.Position(2, 7)],
        Goals.FIX_ALL_MACHINES),
      "F",
      Constants.Lesson03.SUCCESS_MESSAGE,
      null));
}

Lesson03.prototype = Object.create(Lesson.Lesson.prototype);
Object.assign(Lesson03.prototype, {
  getResourceLoader: function() {
    var loader = new ResourceLoader();
    loader.addImage(ElementFactories.ROBOT_IMAGE_URL);
    return loader;
  },
});

module.exports = Lesson03;
