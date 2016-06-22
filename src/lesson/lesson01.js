/*
 * comp4kids programming 101 lesson 1.
 */

var Lesson = require("./lesson");
var Interpreter = require("../language/interpreter")
var Animator = require("../util/animator");
var AnimationFactories = require("../util/animator/animation_factories");
var ElementFactories = require("../util/animator/element_factories");
var Robolang = require("../language/robolang/robolang");
var Constants = require("../constants");

var GRID_SIZE = 10;
var GRID_CELL_SIZE = Constants.RUN_VIEW_SQUARE_DIMENSION / GRID_SIZE;

var Lesson01Game = function(n_rows, n_cols) {
  var game = this;
  this.n_rows = n_rows || GRID_SIZE;
  this.n_cols = n_cols || GRID_SIZE;
  this.character_position = Math.floor(this.n_cols / 2);
  this.obstacles = new Array();

  this.initializeGame = function () {
    var mock_character_position = game.character_position;
    for (var i = 1; i < game.n_rows; ++i) {
      mock_character_position += Math.floor(
        -1 + 3 * Math.random());
      if (mock_character_position < 0)
        mock_character_position = 0;
      if (mock_character_position >= game.n_cols)
        mock_character_position = game.n_cols - 1;

      game.obstacles[i] = Math.floor(game.n_cols * Math.random());
      if (game.obstacles[i] == mock_character_position)
        game.obstacles[i] += 1;
    }
  }

  this.moveCharacter = function (step, direction) {
    var intended_position = game.character_position + direction;
    if (intended_position >= 0 && intended_position < game.n_cols)
      game.character_position = intended_position;
    return game.obstacles[step] != game.character_position;
  }
};

function Lesson01ExerciseStepPlayer(isExample) {
  Lesson.LessonStepPlayer.call(this);
  this.game = new Lesson01Game();
  this.game.initializeGame();
  this._solved = !!isExample;
}

Lesson01ExerciseStepPlayer.prototype = {
  reset: function(canvas) {
    this._animator = new Animator.Animator();
    this._initializeElements();

    if (canvas) {
      this._animator.render(canvas);
    }
  },

  play: function(sourceCode) {
    var interpreter = new Robolang.Interpreter();
    var compilation_errors = interpreter.parse(sourceCode);

    if (compilation_errors) {
      return {compilation_errors: compilation_errors};
    }

    var actions_list = new Array();
    var next_action = null;

    while (true) {
      next_action = interpreter.runUntilNextAction();

      if (next_action) {
        actions_list.push(next_action);
      } else {
        break;
      }
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

  isInAcceptingState: function() {
    return this._solved;
  },

  // Creates the elements of the class in their initial position.
  _initializeElements: function() {
    var grid = new Animator.SimpleGridElement(
        'grid', GRID_CELL_SIZE, GRID_CELL_SIZE);
    this._animator.addElement(grid);

    var character = new ElementFactories.createRobot(
        'p', GRID_CELL_SIZE, GRID_CELL_SIZE);
    character.x = (0.5 + this.game.character_position) * GRID_CELL_SIZE;
    character.y = (0.5 + this.game.n_rows - 1) * GRID_CELL_SIZE;
    this._animator.addElement(character);

    for (var i = 1; i < this.game.n_rows; ++i) {
      var obstacle = new Animator.CircleElement('o' + i, GRID_CELL_SIZE / 2);
      obstacle.x = (0.5 + this.game.obstacles[i]) * GRID_CELL_SIZE;
      obstacle.y = (0.5 + (this.game.n_rows - 1 - i)) * GRID_CELL_SIZE;
      this._animator.addElement(obstacle);
    }
  },

  // Renders the execution to the animator.
  // Returns a list of runtime error messages (empty if the robot survived).
  _render: function(actions) {
    var directions_success = this._actionsToDirections(actions);
    var directions = directions_success[0];
    var success = directions_success[1];

    for (var i = 1; i < this.game.obstacles.length; ++i) {
      this._animator.addAnimation(AnimationFactories.straightMove(
            'o' + i, 0, directions.length,
            0, GRID_CELL_SIZE * this.game.n_rows));

      this._animator.addAnimation(new Animator.Animation(0, directions.length,
            'o' + i, 'radius',
            function() {
              var max_y = (this.game.n_rows - 1) * GRID_CELL_SIZE;
              function o_radius_fn(t, elem) {
                return elem.y <= max_y ? elem.radius : 0;
              }
              return o_radius_fn;
            }.bind(this)()));
    }

    var character = this._animator.getElement('p');

    for (var i = 0; i < directions.length; i++) {
      var animationName = ((directions[i] == -1) ? 'walk_left':
                           (directions[i] == 1) ? 'walk_right' : 'walk_down');
      var duration = (animationName == 'walk_down' ) ? 0.1 : 1;

      this._animator.addAnimation([
          character.createAnimation(animationName, i, i + duration, 0.5),
          AnimationFactories.straightMove(
            'p', i, i + 1, GRID_CELL_SIZE * directions[i], 0),
      ]);
    }

    if (success)
      return [];

    return [Constants.Lesson01.FAILURE_MESSAGE];
  },

  // Given a list of actions and the game, returns a pair (directions, success)
  // where `directions` is a list of integers (-1, 0 or 1) representing the
  // player's movements, and `success` is a boolean indicating whether the
  // player survived.
  _actionsToDirections: function(actions) {
    var directions = Array();
    var success = true;

    for (var i = 1; i < this.game.n_rows; ++i) {
      var action = actions.shift() || "W";
      var direction = null;

      switch (action) {
        case "L":
          direction = -1;
          directions.push(direction);
          break;
        case "R":
          direction = 1;
          directions.push(direction);
          break;
        case "W":
          direction = 0;
          directions.push(direction);
          break;
      }

      if (!this.game.moveCharacter(i, direction)) {
        success = false;
        break;
      }
    }

    return [directions, success];
  },
};

function Lesson01() {
  Lesson.Lesson.call(this);

  this.addStep(
    new Lesson.LessonStep(
      "Desafio para você! Faça o robô sobreviver. " +
      "Você tem 3 comandos: R, W e L.",
      new Lesson01ExerciseStepPlayer(),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      "Você consegue fazer de novo?",
      new Lesson01ExerciseStepPlayer(),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));
}

Lesson01.prototype = Object.create(Lesson.Lesson.prototype, {});

module.exports = Lesson01;
