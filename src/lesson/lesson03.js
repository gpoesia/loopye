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
                      components_positions, machines_positions,
                      initially_holding) {
  this._grid = null;
  this._holding_component = initially_holding || false;
  this._rows = rows;
  this._columns = cols;
  this._initial_position = initial_position;
  this._initial_direction = initial_direction;
  this._initially_holding = initially_holding || false;
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
    this._holding_component = this._initially_holding;
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

  /// Returns if the robot is holding a component.
  holding: function() {
    return this._holding_component;
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
                                    initially_holding,
                                    components_positions,
                                    machines_positions,
                                    goal) {
  Lesson.LessonStepPlayer.call(this);
  this._game = new Lesson03Game(rows, cols,
                                robot_position, robot_direction,
                                components_positions,
                                machines_positions,
                                initially_holding);
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
            grid_cell_size / 3,
            grid_cell_size / 3);
      element.x = (0.5 + component.column) * grid_cell_size;
      element.y = (0.5 + component.row) * grid_cell_size;
      this._animator.addElement(element);
    }

    for (var i = 0; i < this._game.machines().length; ++i) {
      var machine = this._game.machines()[i];
      var element = new ElementFactories.createMachine(
            "m_" + machine.row + "_" + machine.column,
            grid_cell_size / 1.5,
            grid_cell_size / 1.5);
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
    if (this._game.holding()) {
      this._animator.addAnimation(this._character.changeStyle(
          ElementFactories.ROBOT_HOLDING_STYLE, 0));
    }
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
            this._animator.addAnimation(this._character.changeStyle(
                ElementFactories.ROBOT_HOLDING_STYLE,
                i + 0.5));
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
            this._animator.addAnimation(this._character.changeStyle(
                  "default",
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

  // Step 1
  this.addStep(
    new Lesson.LessonStep(
      <p>
        O robô precisa andar para frente e pegar a engrenagem.
      </p>,
      <div>
        <p>
          Olá! Da última vez que nos encontramos conseguimos coletar muitas
          baterias, e agora temos bastante energia para que o robô consiga
          cumprir a sua missão. Agora, precisamos garantir que todas as
          máquinas na nossa base de operações estejam funcionando.
        </p>
        <p>
          A chuva de
          meteoros provocou tremores na nossa base e várias máquinas pararam de
          funcionar, porque suas engrenagens se soltaram. Elas não
          estavam preparadas para tanto impacto. A missão do robô agora
          é pegar todas as engrenagens e
          colocá-las de volta nas máquinas.
        </p>
        <p>
          Olhe só, nesse cenário existe uma engrenagem solta.
          Você precisa fazer o robô pegá-la. Para isso, você só precisa
          utilizar o comando “<b>F</b>” (do inglês <i>Forward</i>,
          que significa <b>pra frente</b>) para o robô andar uma vez
          e ficar em frente à engrenagem, e depois utilizar
          o comando “<b>G</b>” (do inglês <i>Get</i>, que
          significa <b>pegar</b>) para o robô pegar a engrenagem.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, // rows
        3, // cols
        new Grid.Position(1, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [new Grid.Position(1, 2)], // components_positions
        [], // machines_positions
        // [], // hidden_positions
        Goals.GET_ALL_COMPONENTS // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 2
  this.addStep(
    new Lesson.LessonStep(
      <p>
        O robô precisa chegar em frente à máquina e colocar a engrenagem.
      </p>,
      <div>
        <p>
          Muito bem, o robô pegou uma engrenagem, e está segurando
          ela. Agora, ele precisa colocá-la em uma máquina que
          está com uma engrenagem faltando.
          Para isso, ele precisa chegar em frente à máquina e utilizar o seu
          comando “<b>P</b>” (do inglês <i>Put</i>, que significa
          &nbsp;<b>colocar</b>).
        </p>
        <p>
          Lembre-se que quando precisar virar à esquerda, você pode utilizar
          o comando “<b>L</b>” (do inglês, <i>Left</i>), ou para virar à
          direita o comando “<b>R</b>” (do inglês, <i>Right</i>).
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, // rows
        3, // cols
        new Grid.Position(0, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        true, // initially_holding
        [], // components_positions
        [new Grid.Position(2, 2)], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 3
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Pegue a engrenagem e coloque na máquina.
      </p>,
      <div>
        <p>
          Parabéns! Você conseguiu consertar uma máquina colocando a engrenagem
          que faltava nela. Agora temos que continuar consertando todas as
          máquinas na nossa base. Olhe nessa sala, existe uma engrenagem solta e
          uma máquina quebrada. Conserte a máquina pegando a engrenagem e depois
          colocado ela na máquina. Lembre-se, o comando para pegar é
          “<b>G</b>” (<i>Get</i>), e para colocar é “<b>P</b>” (<i>Put</i>).
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, // rows
        3, // cols
        new Grid.Position(0, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [new Grid.Position(0, 2)], // components_positions
        [new Grid.Position(2, 2)], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 4
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Pegue a engrenagem e coloque na máquina. O robô vai ter que andar muito.
        Você pode utilizar um laço para repetir o código.
      </p>,
      <div>
        <p>
          Agora temos mais uma máquina funcionando! Mas o trabalho
          não acabou, ainda. Nessa sala também temos uma máquina
          estragada, mas sua engrenagem
          foi parar muito longe! Você se lembra como andar longas distâncias
          utilizando pouco código? Você pode executar 9 vezes o comando
          “<b>F</b>” (pra frente) se utilizar o código <b>{"9{F}"}</b>. Lembra
          do nome desse tipo de estratégia? Isso é um <b>laço</b>. Acho que
          você vai precisar utilizar um laço agora.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, // rows
        10, // cols
        new Grid.Position(0, 0), // robot_position
        Grid.Directions.DOWN, // robot_direction
        false, // initially_holding
        [new Grid.Position(2, 0)], // components_positions
        [new Grid.Position(2, 9)], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      9
    )
  );

  // Step 5
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Pegue uma engrenagem de cada vez para consertar as duas máquinas.
      </p>,
      <div>
        <p>
          Muito bem! Olha só, nessa sala tem duas máquinas para consertar.
          Mas o robô só pode carregar uma engrenagem de cada vez. Você vai ter
          que programar o robô para pegar uma engrenagem e colocar em uma
          máquina, para só depois pegar a outra engrenagem e colocar na outra
          máquina.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        4, // rows
        3, // cols
        new Grid.Position(1, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [
          new Grid.Position(0, 1), new Grid.Position(0, 2)
        ], // components_positions
        [
          new Grid.Position(3, 1), new Grid.Position(3, 2)
        ], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 6
  this.addStep(
    new Lesson.LessonStep(
      <p>
        São muitas máquinas para consertar! Seria bom escrever um código
        que possa repetir várias vezes em um laço.
      </p>,
      <div>
        <p>
          Muito bem! Naquela sala tinha apenas duas máquinas, mas nessa
          sala existem 9 máquinas. O que fazer? Acho que resolver esse
          problema usando um laço que repete 9 vezes um código que
          conserta uma máquina deixará o programa bem mais simples.
          Vamos tentar?
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        4, // rows
        10, // cols
        new Grid.Position(1, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [
          new Grid.Position(0, 1), new Grid.Position(0, 2),
          new Grid.Position(0, 3), new Grid.Position(0, 4),
          new Grid.Position(0, 5), new Grid.Position(0, 6),
          new Grid.Position(0, 7), new Grid.Position(0, 8),
          new Grid.Position(0, 9)
        ], // components_positions
        [
          new Grid.Position(3, 1), new Grid.Position(3, 2),
          new Grid.Position(3, 3), new Grid.Position(3, 4),
          new Grid.Position(3, 5), new Grid.Position(3, 6),
          new Grid.Position(3, 7), new Grid.Position(3, 8),
          new Grid.Position(3, 9)
        ], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "9{}",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      14
    )
  );

  // Step 7
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Nessa sala grande, podemos utilizar laços para andar, dentro
        de outro laço para consertar todas as máquinas.
      </p>,
      <div>
        <p>
          É bem melhor utilizar laços do que escrever aquele monte de
          comando tudo de novo, não é mesmo? Agora, olha essa sala, a
          situação é bem parecida com a anterior. Mas essa sala é
          muito grande e todas as engrenagens foram parar muito longe.
          Ainda bem que podemos usar um laço dentro do outro no nosso
          programa. Lembra quando fizemos isso, e chamamos de laços
          aninhados, quando um está dentro do outro? Acho que isso vai
          ser útil agora.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        10, // rows
        10, // cols
        new Grid.Position(1, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [
          new Grid.Position(0, 1), new Grid.Position(0, 2),
          new Grid.Position(0, 3), new Grid.Position(0, 4),
          new Grid.Position(0, 5), new Grid.Position(0, 6),
          new Grid.Position(0, 7), new Grid.Position(0, 8),
          new Grid.Position(0, 9)
        ], // components_positions
        [
          new Grid.Position(9, 1), new Grid.Position(9, 2),
          new Grid.Position(9, 3), new Grid.Position(9, 4),
          new Grid.Position(9, 5), new Grid.Position(9, 6),
          new Grid.Position(9, 7), new Grid.Position(9, 8),
          new Grid.Position(9, 9)
        ], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      20
    )
  );

  // Step 8
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Programe o robô para consertar todas as máquinas.
      </p>,
      <div>
        <p>
          Você está indo muito bem! Veja agora essa outra sala. Aqui, as
          engrenagens caíram pertinho das máquinas. Programe o robô para
          consertar todas elas. Acho que você conseguirá ver um padrão
          de repetição aqui também.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        9, // rows
        9, // cols
        new Grid.Position(1, 1), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [
          new Grid.Position(0, 2), new Grid.Position(0, 4),
          new Grid.Position(0, 6),
          new Grid.Position(2, 8), new Grid.Position(4, 8),
          new Grid.Position(6, 8),
          new Grid.Position(8, 2), new Grid.Position(8, 4),
          new Grid.Position(8, 6),
          new Grid.Position(2, 0), new Grid.Position(4, 0),
          new Grid.Position(6, 0)
        ], // components_positions
        [
          new Grid.Position(0, 3), new Grid.Position(0, 5),
          new Grid.Position(0, 7),
          new Grid.Position(3, 8), new Grid.Position(5, 8),
          new Grid.Position(7, 8),
          new Grid.Position(8, 1), new Grid.Position(8, 3),
          new Grid.Position(8, 5),
          new Grid.Position(1, 0), new Grid.Position(3, 0),
          new Grid.Position(5, 0)
        ], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      15
    )
  );

  // Step 9
  this.addStep(
    new Lesson.LessonStep(
      <p>
         Ande até a área desconhecida, verifique se existe uma engrenagem,
         e só pegue se ela existir.
      </p>,
      <div>
        <p>
          Nossa! Chegando aqui, descobrimos uma situação imprevista.
          A chuva de meteoros danificou a câmera de algumas salas,
          e não conseguimos ver o que tem debaixo das áreas pretas
          na imagem. Porém, pode ser que ali tenha uma engrenagem perdida.
          Precisamos descobrir se tem ou não.
        </p>
        <p>
          Para isso, temos que mandar o robô verificar se ali
          naquele quadrado existe uma engrenagem. O robô possui
          um sensor de engrenagens,
          um equipamento que diz se na frente dele existe uma engrenagem ou
          não. E nós podemos usar esse sensor no nosso programa para
          executar um código apenas se ele encontrar uma engrenagem.
        </p>
        <p>
          Para isso, utilizamos o seguinte código: <b>{"eng?{G}"}</b>
        </p>
        <p>
          É como se estivessemos fazendo uma pergunta: “Existe uma
          engrenagem na frente do robô?”. Se a resposta for sim, o código
          que está entre <b>{"{"}</b> e <b>{"}"}</b> será executado.
          Se a resposta for não, o programa pula tudo que está entre
          as chaves. Nesse caso, ele só vai pegar a engrenagem com o
          comando “G” se existir uma engrenagem escondida na área escura.
          Senão o comando “G” não vai ser executado.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, // rows
        3, // cols
        new Grid.Position(0, 0), // robot_position
        Grid.Directions.DOWN, // robot_direction
        false, // initially_holding
        [new Grid.Position(1, 2)], // components_positions
        [], // machines_positions
        // [new Grid.Position(1, 2)], // hidden_positions
        Goals.GET_ALL_COMPONENTS // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 10
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Você vai precisar verificar se a engrenagem está em dois
        locais diferentes.
      </p>,
      <div>
        <p>
          Muito bem! Encontramos uma engrenagem na área escura
          da sala anterior. Para isso, você utilizou
          &nbsp;<b>{"eng?{G}"}</b>, que só executa o comando G se a
          engrenagem estiver em frente ao robô. Esse tipo de código
          é chamado de <b>condicional</b>. Nesse caso, a condição
          para executar o código entre chaves é existir uma
          engrenagem na frente do robô.
        </p>
        <p>
          Agora, a engrenagem que achamos na sala anterior pertence
          a uma máquina nessa sala. A primeira missão aqui é
          colocá-la em uma das máquinas.
        </p>
        <p>
          Porém aqui também temos lugares em que a câmera está
          danificada, e não conseguimos ver o que tem ali. A
          engrenagem da outra máquina deve estar escondida em
          um desses lugares. Você agora tem que verificar se a
          engrenagem está em cada um deles, utilizando o sensor
          de engrenagens, do mesmo jeito que fizemos na sala anterior.
          Depois de achar a engrenagem, é só colocar na outra máquina.
          Então vamos lá, vai ser fácil.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, // rows
        3, // cols
        new Grid.Position(0, 0), // robot_position
        Grid.Directions.DOWN, // robot_direction
        true, // initially_holding
        [new Grid.Position(1, 2)], // components_positions
        [
          new Grid.Position(1, 0), new Grid.Position(2, 2)
        ], // machines_positions
        // [
        //   new Grid.Position(0, 2), new Grid.Position(1, 2)
        // ], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 11
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Encontre a engrenagem, pegue ela quando encontrar, e
        conserte a máquina dessa sala.
      </p>,
      <div>
        <p>
          Muito bem, você conseguiu encontrar a engrenagem e
          consertar a máquina na última sala. E nessa sala?
          A câmera está bem ruim, há vários pontos cegos.
          A engrenagem tem que estar em algum lugar. Você
          terá que programar o nosso robô para verificar
          todos eles!
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, // rows
        10, // cols
        new Grid.Position(1, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [new Grid.Position(0, 4)], // components_positions
        [new Grid.Position(2, 9)], // machines_positions
        // [
        //   new Grid.Position(0, 1), new Grid.Position(0, 2),
        //   new Grid.Position(0, 3), new Grid.Position(0, 4),
        //   new Grid.Position(0, 5), new Grid.Position(0, 6),
        //   new Grid.Position(0, 7), new Grid.Position(0, 8)
        // ], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 12
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Mesmo sem lugares escuros, utilizar o sensor de engrenagens
        pode ser muito útil. Vamos tentar!
      </p>,
      <div>
        <p>
          Nas últimas salas, as câmeras estavam com defeito,
          por isso tivemos que utilizar o sensor de engrenagens
          para achar a engrenagem faltando nas máquinas. Agora
          voltamos para uma sala que temos uma visão completa.
          Mas olha que curioso, as engrenagens soltas estão
          exatamente na frente de cada máquina.
        <p>
        </p>
          Você sabia que nós não precisamos utilizar apenas um
          comando quando utilizamos a condicional do sensor de
          engrenagens. Por exemplo, se a gente escrever o
          código <b>{"eng?{GFPRRFR}"}</b> o robô vai executar esses
          comandos entre chaves apenas se tiver uma engrenagem na
          frente dele. Senão, ele pula para o próximo. Será que
          desse jeito conseguimos resolver o problema nessa sala?
          Acho que usando um laço vai ficar fácil.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, // rows
        10, // cols
        new Grid.Position(0, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [
          new Grid.Position(1, 1), new Grid.Position(1, 3),
          new Grid.Position(1, 4), new Grid.Position(1, 5),
          new Grid.Position(1, 8)
        ], // components_positions
        [
          new Grid.Position(2, 1), new Grid.Position(2, 3),
          new Grid.Position(2, 4), new Grid.Position(2, 5),
          new Grid.Position(2, 8)
        ], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      20
    )
  );

  // Step 13
  this.addStep(
    new Lesson.LessonStep(
      <p>
        O problema nessa sala é muito parecido com o da sala anterior.
      </p>,
      <div>
        <p>
          Muito bem! Você conseguiu utilizar o condicional para
          resolver o problema naquela sala. Agora, olha só essa
          nova sala. A situação aqui é muito parecida com a da
          sala anterior. Será que vai ser muito difícil resolver
          o problema dessa sala? Ou será que vai ser bem parecido
          com a sala anterior? Pense um pouco e resolva.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, // rows
        10, // cols
        new Grid.Position(0, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [
          new Grid.Position(1, 2), new Grid.Position(1, 6),
          new Grid.Position(1, 7), new Grid.Position(1, 8)
        ], // components_positions
        [
          new Grid.Position(2, 2), new Grid.Position(2, 6),
          new Grid.Position(2, 7), new Grid.Position(2, 8)
        ], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      20
    )
  );

  // Step 14
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Como consertar todas as máquinas dessa sala?
      </p>,
      <div>
        <p>
          Viu que legal? Ao utilizar condicionais, você torna o
          código mais genérico, e ele serve pra mais de uma
          situação diferente.
        </p>
        <p>
          Agora temos aqui um pequeno desafio, mas tenho certeza
          que conseguimos utilizar a lógica e programar o robô de
          uma maneira que ele vai consertar todas as máquinas
          nessa sala também.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        6, // rows
        10, // cols
        new Grid.Position(2, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [
          new Grid.Position(1, 1), new Grid.Position(1, 2),
          new Grid.Position(1, 4), new Grid.Position(1, 7),
          new Grid.Position(3, 2), new Grid.Position(3, 4),
          new Grid.Position(3, 5), new Grid.Position(3, 6),
          new Grid.Position(3, 8), new Grid.Position(3, 9)
        ], // components_positions
        [
          new Grid.Position(0, 1), new Grid.Position(0, 2),
          new Grid.Position(0, 4), new Grid.Position(0, 7),
          new Grid.Position(5, 2), new Grid.Position(5, 4),
          new Grid.Position(5, 5), new Grid.Position(5, 6),
          new Grid.Position(5, 8), new Grid.Position(5, 9)
        ], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 15
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Você vai precisar encontrar a máquina na área escura dessa vez.
      </p>,
      <div>
        <p>
          Mais uma sala com a câmera defeituosa. Mas olha só,
          desta vez conseguimos ver uma engrenagem solta, porém
          não sabemos onde está a máquina. Pode ser que ela
          esteja em qualquer área que não conseguimos ver.
        </p>
        <p>
          Para descobrir onde está a máquina, o nosso robô também
          conta com um sensor de máquinas, que indica se existe
          uma máquina na frente dele. Você pode utilizar esse
          sensor através do condicional <b>{"maq?{P}"}</b>.
          Ele funciona como o sensor de engrenagens. Esse código
          irá executar o comando P somente se o robô estiver em
          frente a uma máquina.
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, // rows
        5, // cols
        new Grid.Position(1, 0), // robot_position
        Grid.Directions.DOWN, // robot_direction
        false, // initially_holding
        [new Grid.Position(2, 0)], // components_positions
        [new Grid.Position(0, 2)], // machines_positions
        // [
        //   new Grid.Position(0, 1), new Grid.Position(0, 2),
        //   new Grid.Position(0, 3), new Grid.Position(0, 4)
        // ], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 16
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Os espaços entre as engrenagens e as máquinas são diferentes.
        Condicionais vão ajudar a resolver esse problema.
      </p>,
      <div>
        <p>
          Agora sabemos utilizar condicionais para saber se
          existem engrenagens ou máquinas na frente do robô. E
          também não precisamos utilizar um só, podemos utilizar
          os dois condicionais no mesmo código. Pensando nisso,
          como fazer para consertar todas as máquinas dessa sala?
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        2, // rows
        10, // cols
        new Grid.Position(1, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [
          new Grid.Position(0, 1), new Grid.Position(0, 4),
          new Grid.Position(0, 8)
        ], // components_positions
        [
          new Grid.Position(0, 2), new Grid.Position(0, 6),
          new Grid.Position(0, 9)
        ], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 17
  this.addStep(
    new Lesson.LessonStep(
      <p>
        De novo, esse problema é parecido com o anterior.
      </p>,
      <div>
        <p>
          Lembre-se que condicionais ajudam a deixar o código
          genérico, e que isso significa que o mesmo código
          serve para várias situações diferentes. Então qual
          programa vai fazer o robô resolver o problema nessa sala?
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        2, // rows
        10, // cols
        new Grid.Position(1, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [
          new Grid.Position(0, 2), new Grid.Position(0, 7)
        ], // components_positions
        [
          new Grid.Position(0, 6), new Grid.Position(0, 8)
        ], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 18
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Conserte todas essas máquinas.
      </p>,
      <div>
        <p>
          A partir de agora temos só mais algumas salas com
          máquinas para consertar. Utilize todo o seu conhecimento
          e logo logo toda a nossa base estará funcionando!
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, // rows
        10, // cols
        new Grid.Position(1, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [
          new Grid.Position(0, 1), new Grid.Position(0, 2),
          new Grid.Position(0, 4), new Grid.Position(0, 6)
        ], // components_positions
        [
          new Grid.Position(2, 1), new Grid.Position(2, 3),
          new Grid.Position(2, 5), new Grid.Position(2, 9)
        ], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 19
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Estamos quase lá, conserte as máquinas dessa sala também.
      </p>,
      <div>
        <p>
          Um novo desafio, mas tenho certeza que você consegue resolvê-lo!
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        3, // rows
        10, // cols
        new Grid.Position(1, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [
          new Grid.Position(0, 1), new Grid.Position(0, 5),
          new Grid.Position(2, 3), new Grid.Position(2, 7)
        ], // components_positions
        [
          new Grid.Position(0, 4), new Grid.Position(0, 8),
          new Grid.Position(2, 2), new Grid.Position(2, 6)
        ], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 20
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Essa é nossa última sala. A missão está quase completa.
      </p>,
      <div>
        <p>
          Essa é a nossa última sala! Quando essas máquinas
          estiverem funcionando, nossa missão estará completa.
          Vale lembrar que qualquer código pode ir entre as
          chaves do condicional, inclusive laços!
        </p>
      </div>,
      new Lesson03ExerciseStepPlayer(
        8, // rows
        10, // cols
        new Grid.Position(1, 0), // robot_position
        Grid.Directions.RIGHT, // robot_direction
        false, // initially_holding
        [
          new Grid.Position(0, 1), new Grid.Position(0, 3),
          new Grid.Position(0, 8), new Grid.Position(0, 9),
          new Grid.Position(7, 2), new Grid.Position(7, 4),
          new Grid.Position(7, 5), new Grid.Position(7, 7)
        ], // components_positions
        [
          new Grid.Position(0, 2), new Grid.Position(0, 4),
          new Grid.Position(0, 5), new Grid.Position(0, 7),
          new Grid.Position(6, 1), new Grid.Position(6, 3),
          new Grid.Position(6, 8), new Grid.Position(6, 9)
        ], // machines_positions
        // [], // hidden_positions
        Goals.FIX_ALL_MACHINES // goal
      ),
      "",  // initialCode
      Constants.Lesson03.SUCCESS_MESSAGE,
      null
    )
  );

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
