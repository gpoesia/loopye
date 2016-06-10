
var Lesson = require("./lesson");
var Animator = require("../util/animator");

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

var Action = function(action) {
  this.action = action;
};

var Lesson01Interpreter = function() {
  Lesson.Interpreter.call(this);
  this.actionList = new Array();
};

Lesson01Interpreter.prototype = {
  parse: function(code) {
    actionList = new Array();
    for (var i = 0; i < code.length; ++i) {
      if (code[i] == ' ')
        continue;
      switch(code[i]) {
        case 'L':
          actionList.push(new Action('LEFT'));
          break;
        case 'R':
          actionList.push(new Action('RIGHT'));
          break;
        case 'W':
          actionList.push(new Action('WAIT'));
          break;
        default:
          return "Invalid command: " + code[i];
      }
    }
    this.actionList = actionList;
    return null;
  },
  runUntilNextAction: function() {
    if (this.actionList.length == 0)
      return null;
    return this.actionList.shift();
  }
};

var game = new Lesson01Game();

function Lesson01ExerciseStepPlayer() {
  Lesson.LessonStepPlayer.call(this);
  this.gameEndedSuccessfully = false;
};

Lesson01ExerciseStepPlayer.prototype = {
  render: function(actions, game, animator) {
  var success = true;
  var directions = Array();
  console.log("Action list: ", actions);
  for (var i = 1; i < game.n_rows; ++i) {
    var action = actions.shift();
    switch(action.action) {
      case "LEFT":
        direction = -1;
        directions.push(direction);
        break;
      case "RIGHT":
        direction = 1;
        directions.push(direction);
        break;
      case "WAIT":
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
  animator.addAnimation(new Animator.Animation(0, directions.length,
        'p', 'x', function() {
          var initial_pos = animator.elements['p'].x;
          var positions = Array();
          var last_direction = Number(0);
          positions.push(last_direction);
          for (var i in directions) {
            positions.push(last_direction + directions[i]);
            last_direction = positions[positions.length - 1];
          }
          console.log("directions: ", directions);
          console.log("positions: ", positions);
          function p_x_fn(t, elem) {
            return initial_pos +
              positions[Math.floor(t)] * 10 +
              directions[Math.floor(t)] * 10 * (t - Math.floor(t));
          };
          return p_x_fn;
        }()));
  },
  play: function(sourceCode) {
  var animator = new Animator.Animator();

  var grid = new Animator.SimpleGridElement(
      'grid', 10, 10);

  var character = new Animator.RectangleElement(
    'p', 10, 10);

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

  var interpreter = new Lesson01Interpreter();
  interpreter.parse(sourceCode);

  this.render(interpreter.actionList, game, animator);

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

  var character = new Animator.RectangleElement(
    'p', 10, 10);

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
