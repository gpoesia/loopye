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

var Lesson01Game = function(n_rows, n_cols, robot_position,
                            obstacle_positions) {
  var game = this;
  this.n_rows = n_rows || GRID_SIZE;
  this.n_cols = n_cols || GRID_SIZE;
  var robot_position = robot_position || Math.floor(this.n_cols / 2);
  this.character_position = Math.min(this.n_cols - 1, robot_position);
  this.initial_character_position = this.character_position;
  this.obstacles = new Array(this.n_rows);
  for (var i = 0; i < this.n_rows; ++i) {
    this.obstacles[i] = new Array();
  }
  for (var pos in obstacle_positions){
    var position = obstacle_positions[pos];
    this.obstacles[
      Math.floor(position / this.n_cols)].push(position % this.n_cols);
  }

  this.initializeRandomGame = function () {
    game.character_position = game.initial_character_position;
    var mock_character_position = game.character_position;
    for (var i = 1; i < game.n_rows; ++i) {
      mock_character_position += Math.floor(
        -1 + 3 * Math.random());
      if (mock_character_position < 0)
        mock_character_position = 0;
      if (mock_character_position >= game.n_cols)
        mock_character_position = game.n_cols - 1;

      game.obstacles[i] = [Math.floor(game.n_cols * Math.random())];
      if (game.obstacles[i][0] == mock_character_position)
        game.obstacles[i][0] += 1;
    }
  }

  this.moveCharacter = function (step, direction) {
    var intended_position = game.character_position + direction;
    if (intended_position >= 0 && intended_position < game.n_cols)
      game.character_position = intended_position;

    for (var pos in game.obstacles[step]) {
      if (game.obstacles[step][pos] == game.character_position) {
        return false;
      }
    }
    return true;
  }
};

function Lesson01ExerciseStepPlayer(isExample, nRows, nCols, robotPosition,
                                    obstaclePositions) {
  Lesson.LessonStepPlayer.call(this);
  this.game = new Lesson01Game(nRows, nCols, robotPosition, obstaclePositions);
  obstaclePositions || this.game.initializeRandomGame();
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
    this.game.character_position = this.game.initial_character_position
    var grid = new Animator.SimpleGridElement(
        'grid', GRID_CELL_SIZE, this.game.n_rows,
         GRID_CELL_SIZE, this.game.n_cols);
    this._animator.addElement(grid);

    var character = new ElementFactories.createRobot(
        'p', GRID_CELL_SIZE, GRID_CELL_SIZE);
    character.x = (0.5 + this.game.character_position) * GRID_CELL_SIZE;
    character.y = (0.5 + this.game.n_rows - 1) * GRID_CELL_SIZE;
    this._animator.addElement(character);

    for (var i = 1; i < this.game.n_rows; ++i) {
      for (var obstacle_pos in this.game.obstacles[i]) {
        var obstacle = new Animator.CircleElement(
            'o' + i + obstacle_pos, GRID_CELL_SIZE / 2);
        obstacle.x = (0.5 + this.game.obstacles[i][obstacle_pos])
          * GRID_CELL_SIZE;
        obstacle.y = (0.5 + (this.game.n_rows - 1 - i)) * GRID_CELL_SIZE;
        this._animator.addElement(obstacle);
      }
    }
  },

  // Renders the execution to the animator.
  // Returns a list of runtime error messages (empty if the robot survived).
  _render: function(actions) {
    var directions_success = this._actionsToDirections(actions);
    var directions = directions_success[0];
    var success = directions_success[1];

    for (var i = 1; i < this.game.obstacles.length; ++i) {
      for (var obstacle_pos in this.game.obstacles[i]) {
        this._animator.addAnimation(AnimationFactories.straightMove(
              'o' + i + obstacle_pos, 0, directions.length,
              0, GRID_CELL_SIZE * this.game.n_rows));

        this._animator.addAnimation(
            new Animator.Animation(0, directions.length,
              'o' + i + obstacle_pos, 'radius',
              function() {
                var max_y = (this.game.n_rows - 1) * GRID_CELL_SIZE;
                function o_radius_fn(t, elem) {
                  return elem.y <= max_y ? elem.radius : 0;
                }
                return o_radius_fn;
              }.bind(this)()));
      }
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
      "Olá! Você deve ser o novo programador que o Capitão contratou para " +
      "nossa missão. Bom, não sei se ele já te passou as instruções, mas " +
      "a sua tarefa é salvar os nossos robôs da chuva de meteoros que está " +
      "acontecendo no planeta onde eles estão. Eu vou te mostrar como " +
      "funciona. Veja este robô! Existem 3 obstáculos acima dele, prestes " +
      "a cair. Para que ele sobre viva à chuva de meteoros sem ser " +
      "atingido, ele deve se movimentar para a direita. Por isso digitei " +
      "LW no nosso sistema. Clique no botão (>) para enviar a ordem " +
      "para o robô!",
      new Lesson01ExerciseStepPlayer(false, 3, 3, 1, 
                                     [5, 7, 8]),
      "LW",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      "Muito bem! Ah, você deve estar se perguntando porque LW. Bom, " +
      "vamos passo-a-passo: a letra L (de \"left\", ou esquerda), comanda " +
      "que o robô se movimente para a esquerda. A letra \"W\" (de \"wait\", " +
      "ou aguarde), comanda que o robô permaneça onde está naquele momento. " +
      "Combinando os dois comandos, o robô se movimenta para a esquerda e, " +
      "em sequência, aguarda na posição atual. Não precisamos utilizar a " +
      "letra R para o robô anterior, mas para este, iremos precisar. " +
      "Você consegue descobrir para que ela serve? Clique em (>) para ver " +
      "o que acontece.",
      new Lesson01ExerciseStepPlayer(false, 3, 3, 1, 
                                     [3, 5, 6, 7]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));
  
  this.addStep(
    new Lesson.LessonStep(
      "Certo. Vamos salvar um robô em uma situação um pouco mais difícil. " +
      "Eu estou tentando mover este robô, mas sinto que cometi um erro " +
      "e escrevi o programa errado. Você consegue corrigir o erro?",
      new Lesson01ExerciseStepPlayer(false, 5, 3, 1, 
                                     [4, 7, 8, 9, 11, 12, 13]),
      "LWRL",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      "Realmente, havia um erro no meu programa. Bom, eu estou sendo " +
      "transferido para outra unidade, e por isso não poderei mais te " +
      "ajudar com os códigos. Acho que você está pronto para conduzir os " +
      "robôs restantes pela chuva de meteoros sozinho.",
      new Lesson01ExerciseStepPlayer(false, 5, 4, 1, 
                                     [5, 10, 12, 14, 16, 17, 19]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      "Para alguns casos, existem diversos programas diferentes em que o " +
      "robô seja salvo com sucesso. Por exemplo, o robô anterior poderia " +
      "ser salvo com qualquer um dos programas seguintes: LWRR, LRWR, RLWR, " +
      "RRWL. Você acha que o mesmo é verdade para este robô?",
      new Lesson01ExerciseStepPlayer(false, 15, 3, 1, 
                                     [3, 4, 6, 8, 9, 11, 12, 14, 15, 17,
                                      18, 20, 22, 23, 24, 26, 27, 28, 30, 31,
                                      33, 35, 37, 38, 39, 41, 43, 44]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      "Se você respondeu RLWWWWLRRWLLRL para o robô anterior, e acha que é " +
      "o único programa que faz com que o robô desvie corretamente de " +
      "todos os meteoros, você acertou! Igualmente, para este robô, só " +
      "existe um programa que faz com que ele seja salvo sem ser atingido " +
      "por nenhum meteoro.",
      new Lesson01ExerciseStepPlayer(false, 6, 10, 4,
                                     [11, 13, 15, 17, 22, 23, 24, 26,
                                      31, 34, 35, 37, 44, 46, 47, 48,
                                      53, 55, 56]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      "Salve o robô. Você consegue pensar em alguma maneira de salvar este " +
      "robô com um programa de apenas um comando?",
      new Lesson01ExerciseStepPlayer(false, 5, 8, 1,
                                     [9, 17, 18, 25, 26, 27, 33, 35, 36]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      "Para o robô anterior, vimos que existe uma \"região segura\" que, " +
      "após alcançada, significa que o robô não será atingido se todos os " +
      "comandos seguintes forem somente de espera (sequência de Ws). " +
      "Você acha que existe alguma regiao segura para o robô atual?",
      new Lesson01ExerciseStepPlayer(false, 6, 7, 3,
                                     [7, 9, 11, 13, 15, 17, 19,
                                      21, 23, 25, 27, 29, 31, 33,
                                      35, 37, 39, 41]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      "Para o robô anterior, não existia região segura. O que acontece " +
      "se o robô já começar em uma regiao segura?",
      new Lesson01ExerciseStepPlayer(false, 5, 5, 2,
                                     [6, 10, 13, 16, 18, 19, 21, 23]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      "Muito bem. Salve este outro robô. Para este novo robô, é fácil se " +
      "confundir. Então programe com bastante atenção!",
      new Lesson01ExerciseStepPlayer(false, 10, 5, 2,
                                     [7, 11, 12, 13, 17, 22, 26, 27, 28, 29,
                                      32, 36, 38, 42, 45, 46, 47, 48]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      "E isso é tudo! Continue se divertindo salvando robôs, ou pode " +
      "descansar por hoje! :)",
      new Lesson01ExerciseStepPlayer(),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));
}

Lesson01.prototype = Object.create(Lesson.Lesson.prototype, {});

module.exports = Lesson01;
