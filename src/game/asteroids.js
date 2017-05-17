/*
 * Game in which you write code to save robots from falling asteroids.
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
var Game = require("./game");

var FailureReasons = {
  HIT_BY_ASTEROID: 1,
  LEFT_GRID: 2,
};

// Actions supported in this lesson.
var Actions = {
  WAIT: "A",
  MOVE_LEFT: "E",
  MOVE_RIGHT: "D",
};

var MAX_GRID_CELL_SIZE = Constants.RUN_VIEW_SQUARE_DIMENSION / 8;

function GameState(n_rows, n_cols, robot_position,
                   obstacle_positions) {
  this.n_rows = n_rows;
  this.n_cols = n_cols;
  var robot_position = robot_position || Math.floor(this.n_cols / 2);
  this.character_position = Math.min(this.n_cols - 1, robot_position);
  this.initial_character_position = this.character_position;
  this.obstacle_positions = obstacle_positions || []
  this.obstacles = new Array(this.n_rows);
  for (var i = 0; i < this.n_rows; ++i) {
    this.obstacles[i] = new Array();
  }
  for (var pos = 0; pos < this.obstacle_positions.length; ++pos){
    var position = this.obstacle_positions[pos];
    this.obstacles[
      Math.floor(position / this.n_cols)].push(position % this.n_cols);
  }
}

Object.assign(GameState.prototype, {
  gridCellSize: function() {
    return Math.min(MAX_GRID_CELL_SIZE,
                    (Constants.RUN_VIEW_SQUARE_DIMENSION /
                     Math.max(this.n_rows, this.n_cols)));
  },

  initializeRandomGame: function() {
    this.character_position = this.initial_character_position;
    var mock_character_position = this.character_position;
    for (var i = 1; i < this.n_rows; ++i) {
      mock_character_position += Math.floor(
        -1 + 3 * Math.random());
      if (mock_character_position < 0)
        mock_character_position = 0;
      if (mock_character_position >= this.n_cols)
        mock_character_position = this.n_cols - 1;

      this.obstacles[i] = [Math.floor(this.n_cols * Math.random())];
      if (this.obstacles[i][0] == mock_character_position)
        this.obstacles[i][0] += 1;
    }
  },

  moveCharacter: function(step, direction) {
    var intended_position = this.character_position + direction;
    if (intended_position >= 0 && intended_position < this.n_cols) {
      this.character_position = intended_position;
    } else {
      return FailureReasons.LEFT_GRID;
    }

    for (var pos = 0; pos < this.obstacles[step].length; ++pos) {
      if (this.obstacles[step][pos] == this.character_position) {
        return FailureReasons.HIT_BY_ASTEROID;
      }
    }
    return null;
  },
});

/// asteroids is a game in which the player must save a robot from falling
/// asteroids.
function AsteroidsGameRunner() {
  Game.GameRunner.call(this);
  this._solved = false;
}

AsteroidsGameRunner.prototype = Object.create(Game.GameRunner);
Object.assign(AsteroidsGameRunner.prototype, {
  getGameID: function() {
    return "asteroids";
  },

  reset: function(gameParameters, canvas) {
    this._gameParameters = gameParameters;

    this._state = new GameState(gameParameters.rows,
                                gameParameters.columns,
                                gameParameters.robotPosition,
                                gameParameters.obstaclePositions);
    if (!gameParameters.obstaclePositions) {
      console.log("Initializing random game.");
      this._state.initializeRandomGame();
    }

    this._animator = new Animator.Animator();
    this._initializeElements();

    if (canvas) {
      this._animator.render(canvas);
    }
  },

  run: function(sourceCode) {
    this.reset(this._gameParameters);

    var interpreter = new Robolang.Interpreter();
    var compilation_errors = interpreter.parse(sourceCode,
                                               [Actions.WAIT,
                                                Actions.MOVE_LEFT,
                                                Actions.MOVE_RIGHT]);

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

  challengeSolved: function() {
    return this._solved;
  },

  populateResourceLoader: function() {
    ResourceLoader.addImage(ElementFactories.ROBOT_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.ASTEROIDS_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.ASTEROIDS_BACKGROUND_URL);
    ResourceLoader.addImage(ElementFactories.ALIEN_LEFT_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.ALIEN_RIGHT_IMAGE_URL);
  },

  // Creates the elements of the class in their initial position.
  _initializeElements: function() {
    var grid_cell_size = this._state.gridCellSize();

    // Offsets that centralize the canvas.
    var offset_x = (Constants.RUN_VIEW_SQUARE_DIMENSION / 2 -
                    grid_cell_size * this._state.n_cols / 2);
    var offset_y = (Constants.RUN_VIEW_SQUARE_DIMENSION -
                    grid_cell_size * this._state.n_rows);
    this._animator.setOrigin(offset_x, offset_y);

    var background = ElementFactories.createAsteroidsBackground(
        "background",
        Constants.RUN_VIEW_SQUARE_DIMENSION,
        Constants.RUN_VIEW_SQUARE_DIMENSION,
        this._state.n_rows,
        this._state.n_cols
        );
    background.x = Constants.RUN_VIEW_SQUARE_DIMENSION / 2 - offset_x;
    background.y = Constants.RUN_VIEW_SQUARE_DIMENSION / 2 - offset_y;
    this._animator.addElement(background);

    this._state.character_position = this._state.initial_character_position
    var grid = new Animator.SimpleGridElement(
        'grid', grid_cell_size, this._state.n_rows,
         grid_cell_size, this._state.n_cols,
         'rgba(255,255,255,0.2)', 5);
    this._animator.addElement(grid);

    var alien_size = grid_cell_size;

    var alien01 = new ElementFactories.createAlien('a1', alien_size,
                                                   alien_size);
    alien01.x = (-0.5) * grid_cell_size;
    alien01.y = (0.5 + this._state.n_rows - 1) * grid_cell_size;
    this._animator.addElement(alien01);

    var alien02 = new ElementFactories.createAlien('a2', alien_size,
                                                   alien_size);
    alien02.x = (0.5 + this._state.n_cols) * grid_cell_size;
    alien02.y = (0.5 + this._state.n_rows - 1) * grid_cell_size;
    this._animator.addElement(alien02);
    this._animator.addAnimation(alien02.changeStyle(
        'alien_right', 0));

    var character = new ElementFactories.createRobot(
        'p', grid_cell_size*2, grid_cell_size*2);
    character.x = (0.5 + this._state.character_position) * grid_cell_size;
    character.y = (0.5 + this._state.n_rows - 1) * grid_cell_size;
    this._animator.addElement(character);

    for (var i = 1; i < this._state.n_rows; ++i) {
      for (var obstacle_pos = 0;
            obstacle_pos < this._state.obstacles[i].length; ++obstacle_pos) {
        var obstacle = new ElementFactories.createAsteroid(
            'o' + i + obstacle_pos, grid_cell_size / 2);
        obstacle.x = (0.5 + this._state.obstacles[i][obstacle_pos]) *
          grid_cell_size;
        obstacle.y = (0.5 + (this._state.n_rows - 1 - i)) * grid_cell_size;
        this._animator.addElement(obstacle);
        var asteroid_number = (this._state.n_rows * i + obstacle_pos) % 8;
        this._animator.addAnimation(obstacle.createAnimation(
          'asteroid_' + asteroid_number, 0, 1, 1));
      }
    }
  },

  // Renders the execution to the animator.
  // Returns a list of runtime error messages (empty if the robot survived).
  _render: function(actions) {
    var directions_failure_reason = this._actionsToDirections(actions);
    var directions = directions_failure_reason[0];
    var failure_reason = directions_failure_reason[1];
    var grid_cell_size = this._state.gridCellSize();

    for (var i = 1; i < this._state.obstacles.length; ++i) {
      for (var obstacle_pos = 0;
            obstacle_pos < this._state.obstacles[i].length; ++obstacle_pos) {
        var obstacle = this._animator.getElement('o' + i + obstacle_pos);
        var animationName = 'random';
        this._animator.addAnimation(AnimationFactories.straightMove(
              'o' + i + obstacle_pos, 0, directions.length,
              0, grid_cell_size * directions.length));

        this._animator.addAnimation(
            new Animator.Animation(0, directions.length,
              'o' + i + obstacle_pos, 'radius',
              function() {
                var max_y = this._state.n_rows * grid_cell_size;
                function o_radius_fn(t, elem) {
                  return elem.y <= max_y ? elem.radius : 0;
                }
                return o_radius_fn;
              }.bind(this)()));
      }
    }

    var character = this._animator.getElement('p');
    var alien01 = this._animator.getElement('a1');
    var alien02 = this._animator.getElement('a2');

    for (var i = 0; i < directions.length; i++) {
      var animationName = ((directions[i] == -1) ? 'walk_left':
                           (directions[i] == 1) ? 'walk_right' : 'walk_down');
      var duration = (animationName == 'walk_down' ) ? 0.1 : 1;
      this._animator.addAnimation([
          character.createAnimation(animationName, i, i + duration, 0.5),
          AnimationFactories.straightMove(
            'p', i, i + 1, grid_cell_size * directions[i], 0),
      ]);
      if (i == directions.length-1) {
        if (failure_reason === FailureReasons.LEFT_GRID) {
          if (directions[i] == -1) {
            this._animator.addAnimation([
              alien01.createAnimation('panic', i, i+duration, duration),
              alien01.createAnimation('dead', i+duration, i+duration+1, 1)
            ]);
          }
          if (directions[i] == 1) {
            this._animator.addAnimation([
              alien02.createAnimation('panic', i, i+duration, duration),
              alien02.createAnimation('dead', i+duration, i+duration+1, 1)
            ]);
          }
        }
      }
    }

    if (!failure_reason)
      return [];

    if (failure_reason === FailureReasons.HIT_BY_ASTEROID) {
      return [Constants.Lesson01.FAILURE_MESSAGE_HIT_BY_ASTEROID];
    } else if (failure_reason === FailureReasons.LEFT_GRID) {
      return [Constants.Lesson01.FAILURE_MESSAGE_LEFT_GRID];
    } else {
      throw "Unknown failure reason " + failure_reason;
    }
  },

  // Given a list of actions and the game, returns a pair (directions, success)
  // where `directions` is a list of integers (-1, 0 or 1) representing the
  // player's movements, and `success` is a boolean indicating whether the
  // player survived.
  _actionsToDirections: function(actions) {
    var directions = new Array();
    var failure_reason = null;

    for (var i = 1; i < this._state.n_rows; ++i) {
      var action = actions.shift() || Actions.WAIT;
      var direction = null;

      switch (action) {
        case Actions.MOVE_LEFT:
          direction = -1;
          directions.push(direction);
          break;
        case Actions.MOVE_RIGHT:
          direction = 1;
          directions.push(direction);
          break;
        case Actions.WAIT:
          direction = 0;
          directions.push(direction);
          break;
      }

      failure_reason = this._state.moveCharacter(i, direction);
      if (failure_reason !== null) {
        break;
      }
    }

    return [directions, failure_reason];
  },
});


/// asteroids2 is like asteroids, but two robots must be saved by the same
/// program.
function Asteroids2GameRunner() {
  AsteroidsGameRunner.call(this);
}

Asteroids2GameRunner.prototype = Object.create(AsteroidsGameRunner.prototype);

Object.assign(Asteroids2GameRunner.prototype, {
  getGameID: function() {
    return "asteroids2";
  },

  reset: function(gameParameters, canvas) {
    this._gameParameters = gameParameters;
    this._animator = new Animator.Animator();

    var challengesList = gameParameters.challengesList;
    this._runners  = new Array(challengesList.length);
    for (var i = 0; i < this._runners.length; ++i) {
      this._runners[i] = new AsteroidsGameRunner();
      this._runners[i].reset(challengesList[i]);
    }

    this._initializeElements();

    if (canvas) {
      this._animator.render(canvas);
    }
  },

  _initializeElements: function() {
    var nPlayers = this._runners.length;

    var background = ElementFactories.createAsteroidsBackground(
      "background",
      Constants.RUN_VIEW_SQUARE_DIMENSION,
      Constants.RUN_VIEW_SQUARE_DIMENSION,
      15,
      15
    );
    background.x = Constants.RUN_VIEW_SQUARE_DIMENSION / 2;
    background.y = Constants.RUN_VIEW_SQUARE_DIMENSION / 2;
    this._animator.addElement(background);

    for (var sp = 0; sp < this._runners.length; ++sp) {
      stepPlayer = this._runners[sp];
      var grid_cell_size = stepPlayer._state.gridCellSize() / nPlayers;

      // Offsets that centralize the canvas.
      var offset_x = (Constants.RUN_VIEW_SQUARE_DIMENSION / (2 * nPlayers) +
                      Constants.RUN_VIEW_SQUARE_DIMENSION / nPlayers * sp -
                      grid_cell_size * stepPlayer._state.n_cols / 2);
      var offset_y = (Constants.RUN_VIEW_SQUARE_DIMENSION -
                      grid_cell_size * stepPlayer._state.n_rows);



      stepPlayer._state.character_position =
          stepPlayer._state.initial_character_position;
      var grid = new Animator.SimpleGridElement(
          'grid' + sp, grid_cell_size, stepPlayer._state.n_rows,
          grid_cell_size, stepPlayer._state.n_cols, 'white');
      grid.x = offset_x;
      grid.y = offset_y;
      grid.stroke_color = "#FFFFFF";
      this._animator.addElement(grid);

      var character = new ElementFactories.createRobot(
          'p' + sp, grid_cell_size, grid_cell_size);
      character.x = offset_x + (0.5 + stepPlayer._state.character_position) *
          grid_cell_size;
      character.y = offset_y + (0.5 + stepPlayer._state.n_rows - 1) *
          grid_cell_size;
      this._animator.addElement(character);

      for (var i = 1; i < stepPlayer._state.n_rows; ++i) {
        for (var obstacle_pos = 0;
              obstacle_pos < stepPlayer._state.obstacles[i].length;
              ++obstacle_pos) {
          var obstacle = new ElementFactories.createAsteroid(
              'o' + sp + i + obstacle_pos, grid_cell_size / 2);
          obstacle.x = offset_x +
              (0.5 + stepPlayer._state.obstacles[i][obstacle_pos]) *
              grid_cell_size;
          obstacle.y = offset_y + (0.5 + (stepPlayer._state.n_rows - 1 - i)) *
              grid_cell_size;
          this._animator.addElement(obstacle);
          var asteroid_number = (stepPlayer._state.n_rows * i + obstacle_pos) % 8;
          this._animator.addAnimation(obstacle.createAnimation(
            'asteroid_' + asteroid_number, 0, 1, 1));
          }
      }
    }
  },
  _render: function(actions) {
    var nPlayers = this._runners.length;
    var directions_failure_reason = this._actionsToDirections(actions);
    for (var sp = 0; sp < this._runners.length; ++sp) {
      var stepPlayer = this._runners[sp];
      var directions = directions_failure_reason[0];
      var failure_reason = directions_failure_reason[1];
      var grid_cell_size = stepPlayer._state.gridCellSize() / nPlayers;
      var failure_collector = new Array();

      for (var i = 1; i < stepPlayer._state.obstacles.length; ++i) {
        for (var obstacle_pos = 0;
              obstacle_pos < stepPlayer._state.obstacles[i].length;
              ++obstacle_pos) {
          this._animator.addAnimation(AnimationFactories.straightMove(
                'o' + sp + i + obstacle_pos, 0, directions.length,
                0, grid_cell_size * directions.length));

          var offset_y = (Constants.RUN_VIEW_SQUARE_DIMENSION / 2 -
                          grid_cell_size * stepPlayer._state.n_rows / 2);

          this._animator.addAnimation(
              new Animator.Animation(0, directions.length,
                'o' + sp + i + obstacle_pos, 'radius',
                function() {
                  var max_y = offset_y + this._state.n_rows * grid_cell_size;
                  function o_radius_fn(t, elem) {
                    return elem.y <= max_y ? elem.radius : 0;
                  }
                  return o_radius_fn;
                }.bind(stepPlayer)()));
        }
      }

      var character = this._animator.getElement('p' + sp);

      for (var i = 0; i < directions.length; i++) {
        var animationName = ((directions[i] == -1) ? 'walk_left':
                             (directions[i] == 1) ? 'walk_right' : 'walk_down');
        var duration = (animationName == 'walk_down' ) ? 0.1 : 1;
        this._animator.addAnimation([
            character.createAnimation(animationName, i, i + duration, 0.5),
            AnimationFactories.straightMove(
              'p' + sp, i, i + 1, grid_cell_size * directions[i], 0),
        ]);
      }

      if (failure_reason === FailureReasons.HIT_BY_ASTEROID) {
        failure_collector.push(
            Constants.Lesson01.FAILURE_MESSAGE_HIT_BY_ASTEROID);
      } else if (failure_reason === FailureReasons.LEFT_GRID) {
        failure_collector.push(Constants.Lesson01.FAILURE_MESSAGE_LEFT_GRID);
      } else if (!!failure_reason){
        throw "Unknown failure reason " + failure_reason;
      }
    }
    return failure_collector;
  },
  _actionsToDirections: function(actions) {
    var directions = new Array();
    var failure_reason = null;

    var max_n_rows = Math.max.apply(
        null,
        this._runners.map(function(x) {
            return x._state.n_rows;
        })
    );

    for (var i = 1; i < max_n_rows; ++i) {
      var action = actions.shift() || Actions.WAIT;
      var direction = null;

      switch (action) {
        case Actions.MOVE_LEFT:
          direction = -1;
          directions.push(direction);
          break;
        case Actions.MOVE_RIGHT:
          direction = 1;
          directions.push(direction);
          break;
        case Actions.WAIT:
          direction = 0;
          directions.push(direction);
          break;
      }

      for (var sp = 0; sp < this._runners.length; ++sp) {
        var stepPlayer = this._runners[sp];
        failure_reason = stepPlayer._state.moveCharacter(i, direction);
        if (failure_reason !== null) {
          return [directions, failure_reason];
        }
      }
    }
    return [directions, failure_reason];
  }
});

Game.registerGame("asteroids", AsteroidsGameRunner);
Game.registerGame("asteroids2", Asteroids2GameRunner);

module.exports = {
  AsteroidsGameRunner: AsteroidsGameRunner,
  Asteroids2GameRunner: Asteroids2GameRunner,
};
