/*
 * comp4kids programming 101 lesson 1.
 */

var Lesson = require("./lesson");
var Interpreter = require("../language/interpreter")
var Animator = require("../util/animator");
var AnimationFactories = require("../util/animator/animation_factories");
var ElementFactories = require("../util/animator/element_factories");
var Robolang = require("../language/robolang/robolang");

var Lesson01Game = function(n_rows, n_cols) {
  var game = this;
  this.n_rows = n_rows || 10;
  this.n_cols = n_cols || 10;
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

var game = new Lesson01Game();

function Lesson01ExerciseStepPlayer() {
  Lesson.LessonStepPlayer.call(this);
  this.gameEndedSuccessfully = false;
}

Lesson01ExerciseStepPlayer.prototype = {
  render: function(actions, game, animator) {
    var success = true;
    var directions = Array();
    for (var i = 1; i < game.n_rows; ++i) {
      var action = actions.shift();
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

      if (!game.moveCharacter(i, direction)) {
        success = false;
        break;
      }
    }
    var character_animation = function(t) {
      return directions[Math.floor(t)];
    }
    for (var i = 1; i < game.obstacles.length; ++i) {
      var bla = function() {
        var initial_pos = animator.elements['o' + i].y;
        function ble(t, elem) {
          return initial_pos + 10*t;
        };
        return ble;
      };
      animator.addAnimation(new Animator.Animation(0, directions.length,
            'o' + i, 'y',
            function() {
              var initial_pos = animator.elements['o' + i].y;
              function o_y_fn(t, elem) {
                return initial_pos + 10*t;
              };
              return o_y_fn;
            }()));
      animator.addAnimation(new Animator.Animation(0, directions.length,
            'o' + i, 'radius',
            function() {
              var max_y = (game.n_rows - 1) * 10;
              function o_radius_fn(t, elem) {
                return elem.y <= max_y ? elem.radius : 0;
              }
              return o_radius_fn;
            }()));
    }

    var character = animator.elements['p'];

    for (var i = 0; i < directions.length; i++) {
      var animationName = ((directions[i] == -1) ? 'walk_left':
                           (directions[i] == 1) ? 'walk_right' : 'walk_down');
      var duration = (animationName == 'walk_down' ) ? 0.1 : 1;

      animator.addAnimation([
          animator.elements['p'].createAnimation(
              animationName, i, i + duration, 0.5),
          AnimationFactories.straightMove('p', i, i + 1, 10 * directions[i], 0),
      ]);
    }

    return success;
  },

  play: function(sourceCode) {
    var animator = new Animator.Animator();

    var grid = new Animator.SimpleGridElement(
        'grid', 10, 10);

    var character = new ElementFactories.createRobot('p', 10, 10);

    character.x = game.character_position * 10;
    character.y = (game.n_rows - 1) * 10;

    animator.addElement(grid);
    animator.addElement(character);

    for (var i = 1; i < game.n_rows; ++i) {
      var obstacle = new Animator.CircleElement(
          'o' + i, 5);

      obstacle.x = game.obstacles[i] * 10;
      obstacle.y = (game.n_rows - 1 - i) * 10;

      animator.addElement(obstacle);
    }

    var interpreter = new Robolang.Interpreter();
    interpreter.parse(sourceCode);

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

    this.render(actions_list, game, animator);

    return animator;
  },

  isInAcceptingState: function() {
    return true;
  },
};

function Lesson01StatementStepPlayer() {
  Lesson.LessonStepPlayer.call(this);
}

Lesson01StatementStepPlayer.prototype = {
  play: function(sourceCode) {
    var animator = new Animator.Animator();

    var grid = new Animator.SimpleGridElement(
        'grid', 10, 10);

    var character = new ElementFactories.createRobot('p', 10, 10);

    game.initializeGame();

    character.x = game.character_position * 10;
    character.y = (game.n_rows - 1) * 10;

    animator.addElement(grid);
    animator.addElement(character);

    for (var i = 1; i < game.n_rows; ++i) {
      var obstacle = new Animator.CircleElement(
          'o' + i, 5);

      obstacle.x = game.obstacles[i] * 10;
      obstacle.y = (game.n_rows - 1 - i) * 10;

      animator.addElement(obstacle);
    }

    return animator;
  },

  isInAcceptingState: function() {
    return true;
  },
};

function Lesson01() {
  Lesson.Lesson.call(this);

  this.addStep(
    new Lesson.LessonStep(
      "This is the puzzle you'll have to solve.",
      new Lesson01StatementStepPlayer(),
      ""));

  this.addStep(
    new Lesson.LessonStep(
      "Write code and solve it.",
      new Lesson01ExerciseStepPlayer(),
      ""));
}

Lesson01.prototype = Object.create(Lesson.Lesson.prototype, {});

module.exports = Lesson01;
