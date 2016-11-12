/*
 * comp4kids programming 101 lesson 1.
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

var FailureReasons = {
  HIT_BY_ASTEROID: 1,
  LEFT_GRID: 2,
};

var MAX_GRID_CELL_SIZE = Constants.RUN_VIEW_SQUARE_DIMENSION / 8;

var Lesson01Game = function(n_rows, n_cols, robot_position,
                            obstacle_positions) {
  var game = this;
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

  this.gridCellSize = function() {
    return Math.min(MAX_GRID_CELL_SIZE,
                    (Constants.RUN_VIEW_SQUARE_DIMENSION /
                     Math.max(this.n_rows, this.n_cols)));
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
    if (intended_position >= 0 && intended_position < game.n_cols) {
      game.character_position = intended_position;
    } else {
      return FailureReasons.LEFT_GRID;
    }

    for (var pos = 0; pos < game.obstacles[step].length; ++pos) {
      if (game.obstacles[step][pos] == game.character_position) {
        return FailureReasons.HIT_BY_ASTEROID;
      }
    }
    return null;
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
    this.reset();

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
    var grid_cell_size = this.game.gridCellSize();

    // Offsets that centralize the canvas.
    var offset_x = (Constants.RUN_VIEW_SQUARE_DIMENSION / 2 -
                    grid_cell_size * this.game.n_cols / 2);
    var offset_y = (Constants.RUN_VIEW_SQUARE_DIMENSION -
                    grid_cell_size * this.game.n_rows);
    this._animator.setOrigin(offset_x, offset_y);

    var background = ElementFactories.createAsteroidsBackground(
        "background",
        Constants.RUN_VIEW_SQUARE_DIMENSION,
        Constants.RUN_VIEW_SQUARE_DIMENSION,
        this.game.n_rows,
        this.game.n_cols
        );
    background.x = Constants.RUN_VIEW_SQUARE_DIMENSION / 2 - offset_x;
    background.y = Constants.RUN_VIEW_SQUARE_DIMENSION / 2 - offset_y;
    this._animator.addElement(background);

    this.game.character_position = this.game.initial_character_position
    var grid = new Animator.SimpleGridElement(
        'grid', grid_cell_size, this.game.n_rows,
         grid_cell_size, this.game.n_cols,
         'white');
    this._animator.addElement(grid);

    var character = new ElementFactories.createRobot(
        'p', grid_cell_size, grid_cell_size);
    character.x = (0.5 + this.game.character_position) * grid_cell_size;
    character.y = (0.5 + this.game.n_rows - 1) * grid_cell_size;
    this._animator.addElement(character);

    for (var i = 1; i < this.game.n_rows; ++i) {
      for (var obstacle_pos = 0;
            obstacle_pos < this.game.obstacles[i].length; ++obstacle_pos) {
        var obstacle = new ElementFactories.createAsteroid(
            'o' + i + obstacle_pos, grid_cell_size / 2);
        obstacle.x = (0.5 + this.game.obstacles[i][obstacle_pos]) *
          grid_cell_size;
        obstacle.y = (0.5 + (this.game.n_rows - 1 - i)) * grid_cell_size;
        this._animator.addElement(obstacle);
        var asteroid_number = (this.game.n_rows * i + obstacle_pos) % 8;
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
    var grid_cell_size = this.game.gridCellSize();

    for (var i = 1; i < this.game.obstacles.length; ++i) {
      for (var obstacle_pos = 0;
            obstacle_pos < this.game.obstacles[i].length; ++obstacle_pos) {
        var obstacle = this._animator.getElement('o' + i + obstacle_pos);
        var animationName = 'random';
        this._animator.addAnimation(AnimationFactories.straightMove(
              'o' + i + obstacle_pos, 0, directions.length,
              0, grid_cell_size * directions.length));

        this._animator.addAnimation(
            new Animator.Animation(0, directions.length,
              'o' + i + obstacle_pos, 'radius',
              function() {
                var max_y = this.game.n_rows * grid_cell_size;
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
            'p', i, i + 1, grid_cell_size * directions[i], 0),
      ]);
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

      failure_reason = this.game.moveCharacter(i, direction);
      if (failure_reason !== null) {
        break;
      }
    }

    return [directions, failure_reason];
  },
};

function Lesson01ExerciseStepPlayerMulti(isExample, nGames, nRowsList,
                                         nColsList, robotPositionList,
                                         obstaclePositionsList) {
  Lesson.LessonStepPlayer.call(this);
  this.lessonStepPlayers = new Array(nGames);
  for (var i = 0; i < nGames; ++i) {
    this.lessonStepPlayers[i] = new Lesson01ExerciseStepPlayer(
      isExample, nRowsList[i], nColsList[i], robotPositionList[i],
      obstaclePositionsList[i]);
  }
  this._solved = !!isExample;
}

Lesson01ExerciseStepPlayerMulti.prototype = Object.create(
    Lesson01ExerciseStepPlayer.prototype);

Object.assign(Lesson01ExerciseStepPlayerMulti.prototype, {
  _initializeElements: function() {
    var nPlayers = this.lessonStepPlayers.length;

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

    for (var sp = 0; sp < this.lessonStepPlayers.length; ++sp) {
      stepPlayer = this.lessonStepPlayers[sp];
      var grid_cell_size = stepPlayer.game.gridCellSize() / nPlayers;

      // Offsets that centralize the canvas.
      var offset_x = (Constants.RUN_VIEW_SQUARE_DIMENSION / (2 * nPlayers) +
                      Constants.RUN_VIEW_SQUARE_DIMENSION / nPlayers * sp -
                      grid_cell_size * stepPlayer.game.n_cols / 2);
      var offset_y = (Constants.RUN_VIEW_SQUARE_DIMENSION -
                      grid_cell_size * stepPlayer.game.n_rows);



      stepPlayer.game.character_position =
          stepPlayer.game.initial_character_position;
      var grid = new Animator.SimpleGridElement(
          'grid' + sp, grid_cell_size, stepPlayer.game.n_rows,
          grid_cell_size, stepPlayer.game.n_cols, 'white');
      grid.x = offset_x;
      grid.y = offset_y;
      grid.stroke_color = "#FFFFFF";
      this._animator.addElement(grid);

      var character = new ElementFactories.createRobot(
          'p' + sp, grid_cell_size, grid_cell_size);
      character.x = offset_x + (0.5 + stepPlayer.game.character_position) *
          grid_cell_size;
      character.y = offset_y + (0.5 + stepPlayer.game.n_rows - 1) *
          grid_cell_size;
      this._animator.addElement(character);

      for (var i = 1; i < stepPlayer.game.n_rows; ++i) {
        for (var obstacle_pos = 0;
              obstacle_pos < stepPlayer.game.obstacles[i].length;
              ++obstacle_pos) {
          var obstacle = new ElementFactories.createAsteroid(
              'o' + sp + i + obstacle_pos, grid_cell_size / 2);
          obstacle.x = offset_x +
              (0.5 + stepPlayer.game.obstacles[i][obstacle_pos]) *
              grid_cell_size;
          obstacle.y = offset_y + (0.5 + (stepPlayer.game.n_rows - 1 - i)) *
              grid_cell_size;
          this._animator.addElement(obstacle);
          var asteroid_number = (stepPlayer.game.n_rows * i + obstacle_pos) % 8;
          this._animator.addAnimation(obstacle.createAnimation(
            'asteroid_' + asteroid_number, 0, 1, 1));
          }
      }
    }
  },
  _render: function(actions) {
    var nPlayers = this.lessonStepPlayers.length;
    var directions_failure_reason = this._actionsToDirections(actions);
    for (var sp = 0; sp < this.lessonStepPlayers.length; ++sp) {
      var stepPlayer = this.lessonStepPlayers[sp];
      var directions = directions_failure_reason[0];
      var failure_reason = directions_failure_reason[1];
      var grid_cell_size = stepPlayer.game.gridCellSize() / nPlayers;
      var failure_collector = new Array();

      for (var i = 1; i < stepPlayer.game.obstacles.length; ++i) {
        for (var obstacle_pos = 0;
              obstacle_pos < stepPlayer.game.obstacles[i].length;
              ++obstacle_pos) {
          this._animator.addAnimation(AnimationFactories.straightMove(
                'o' + sp + i + obstacle_pos, 0, directions.length,
                0, grid_cell_size * directions.length));

          var offset_y = (Constants.RUN_VIEW_SQUARE_DIMENSION / 2 -
                          grid_cell_size * stepPlayer.game.n_rows / 2);

          this._animator.addAnimation(
              new Animator.Animation(0, directions.length,
                'o' + sp + i + obstacle_pos, 'radius',
                function() {
                  var max_y = offset_y + this.game.n_rows * grid_cell_size;
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
        this.lessonStepPlayers.map(function(x) {
            return x.game.n_rows;
        })
    );

    for (var i = 1; i < max_n_rows; ++i) {
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

      for (var sp = 0; sp < this.lessonStepPlayers.length; ++sp) {
        var stepPlayer = this.lessonStepPlayers[sp];
        failure_reason = stepPlayer.game.moveCharacter(i, direction);
        if (failure_reason !== null) {
          return [directions, failure_reason];
        }
      }
    }
    return [directions, failure_reason];
  }
});

function Lesson01() {
  Lesson.Lesson.call(this);

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Eu já escrevi um programa para salvar este robô, ali do lado esquerdo.
        Ele é "LW". Aperte {Icons.PlayIcon} para ver o que ele faz.
      </p>,
      <div>
        <p>
          Olá! Você deve ser o novo programador que o Capitão contratou para
          nossa missão. Bom, não sei se ele já te passou as instruções, mas
          a sua tarefa é salvar os nossos robôs da chuva de meteoros que está
          acontecendo no planeta onde eles estão. Eu vou te mostrar como
          funciona.
        </p>
        <p>
          Veja este robô! Existem 3 obstáculos acima dele, prestes
          a cair. Para que ele sobreviva à chuva de meteoros sem ser
          atingido, ele deve se movimentar para a esquerda. Por isso já digitei
          LW no nosso sistema, ali na esquerda. O robô executa cada comando em sequência:
          primeiro o comando L, e em seguida o W. Quando acabam os comandos, ele fica parado,
          esperando que a chuva passe. Todos os comandos são letras maiúsculas.
          Vamos ver o que acontece e já te explico o que cada um faz.
        </p>
        <p>
          O seu painel de controle te permite fazer várias coisas.
          Clique no botão {Icons.PlayIcon} para enviar a ordem
          para o robô. Caso você consiga salvar o robô, vamos para o próximo, apertando
          o botão {Icons.AdvanceIcon}. Se você precisar tentar novamente, é só usar
          o botão {Icons.ResetIcon}. E para ver estas instruções de novo, você
          pode apertar o {Icons.HelpIcon}. Minha principal lição é: não entre em pânico!
        </p>
      </div>,
      [],
      new Lesson01ExerciseStepPlayer(false, 3, 3, 1,
                                     [5, 7, 8]),
      "LW",
      Constants.Lesson01.SUCCESS_MESSAGE));

  var commandsReference = [Constants.References.WAIT,
                           Constants.References.MOVE_LEFT,
                           Constants.References.MOVE_RIGHT];

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Para este robô, você precisará usar o comando "R" para ir para a direita.
        Mas não apenas isso: antes, ele precisará esperar o meteoro que vai cair à sua direita.
        Boa sorte! Não tenha medo de tentar, errar e tentar de novo,
        o robô é resistente :-)
      </p>,
      <p>
        Muito bem! Ah, você deve estar se perguntando porque LW. Bom,
        vamos passo-a-passo: a letra L (de "left", ou esquerda em inglês), comanda
        que o robô se movimente para a esquerda. A letra "W" (de "wait",
        aguarde), comanda que o robô permaneça onde está naquele momento.
        Combinando os dois comandos, o robô se movimenta para a esquerda e,
        em sequência, aguarda na posição atual. Não precisamos utilizar a
        letra R para o robô anterior, mas para este, iremos precisar.
        Você consegue descobrir para que ela serve? Clique em {Icons.PlayIcon} para ver
        o que acontece.
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayer(false, 3, 3, 1,
                                     [3, 5, 6, 7]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Eu tentei "LWRL", mas o robô está sendo atingido. Acho que com uma pequena
        correção esse programa já deve ser suficiente.
      </p>,
      <p>
        Certo. Vamos salvar um robô em uma situação um pouco mais difícil.
        Eu estou tentando, mas sinto que cometi um erro
        e escrevi o programa errado. Você consegue corrigir o erro?
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayer(false, 5, 3, 1,
                                     [4, 7, 8, 9, 11, 12, 13]),
      "LWRL",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Ainda poderei te ajudar, mas escrever os programas agora é com você. Boa sorte!
      </p>,
      <p>
        Muito bem! Realmente, havia um erro no meu programa. Bom, eu estou sendo
        transferido para outra unidade, e por isso não poderei mais te
        ajudar com os códigos. Acho que você está pronto para conduzir os
        robôs restantes pela chuva de meteoros sozinho.
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayer(false, 5, 4, 1,
                                     [5, 10, 12, 14, 16, 17, 19]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Esse robô caiu em uma enrascada!
      </p>,
      <p>
        Para alguns casos, existem diversos programas diferentes em que o
        robô seja salvo com sucesso. Por exemplo, o robô anterior poderia
        ser salvo com qualquer um dos programas seguintes: LWRR, LRWR, RLWR,
        RRWL. Você acha que o mesmo é verdade para este robô?
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayer(false, 15, 3, 1,
                                     [3, 4, 6, 8, 9, 11, 12, 14, 15, 17,
                                      18, 20, 22, 23, 24, 26, 27, 28, 30, 31,
                                      33, 35, 37, 38, 39, 41, 43, 44]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Outro robô em apuros...
      </p>,
      <p>
        Se você respondeu RLWWWWLRRWLLRL para o robô anterior, e acha que é
        o único programa que faz com que o robô desvie corretamente de
        todos os meteoros, você acertou! Igualmente, para este robô, só
        existe um programa que faz com que ele seja salvo sem ser atingido
        por nenhum meteoro.
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayer(false, 6, 10, 4,
                                     [11, 13, 15, 17, 22, 23, 24, 26,
                                      31, 34, 35, 37, 44, 46, 47, 48,
                                      53, 55, 56]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Esse será moleza :)
      </p>,
      <p>
        Ah, um caso mais fácil. Você pode economizar seus dedos desta vez.
        Consegue pensar em alguma maneira de salvar este
        robô com um programa de apenas um comando?
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayer(false, 5, 8, 1,
                                     [9, 17, 18, 25, 26, 27, 33, 35, 36]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Hmm, não sei se esse robô terá o luxo de ficar parado esperando
        que a chuva passe...
      </p>,
      <p>
        Para o robô anterior, vimos que existe uma "região segura" que,
        após alcançada, significa que o robô não será atingido se todos os
        comandos seguintes forem somente de espera (sequência de Ws).
        Você acha que existe alguma regiao segura para o robô atual?
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayer(false, 6, 7, 3,
                                     [7, 9, 11, 13, 15, 17, 19,
                                      21, 23, 25, 27, 29, 31, 33,
                                      35, 37, 39, 41]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Todo robô queria estar em uma situação assim :)
      </p>,
      <p>
        Para o robô anterior, não existia região segura. O que acontece
        se o robô já começar em uma regiao segura?
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayer(false, 5, 5, 2,
                                     [6, 10, 13, 16, 18, 19, 21, 23]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Cuidado por onde leva o robô! Mas a esta altura sei que você já é profissional.
      </p>,
      <p>
        Muito bem! Essa foi fácil. Salve este outro robô. Para este novo robô, é fácil se
        confundir. Então programe com bastante atenção!
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayer(false, 10, 5, 2,
                                     [7, 11, 12, 13, 17, 22, 26, 27, 28, 29,
                                      32, 36, 38, 42, 45, 46, 47, 48]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Salve os dois robôs!
      </p>,
      <p>
        Alguns de nossos robôs recebem comandos do mesmo computador e, por isso,
         o programa que for escrito para salvá-los deve ser único e deve funcionar
         igualmente para os dois robôs. Veja neste exemplo: o programa WLWW
         salva o primeiro robô, mas faz com que o segundo seja atingido por um meteoro.
         Já o programa LLWW salva o segundo robô, mas faz com que o primeiro
         seja atingido por um meteoro. O único programa que salva os dois
         robôs, ao mesmo tempo, é WRLW (ou WRL).
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayerMulti(true, 2, [5, 5], [5, 5], [2, 2],
                                          [[6, 8, 12, 15, 18], [8, 11, 19]]),
      "WRL",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Salve os dois robôs ao mesmo tempo!
      </p>,
      <p>
        Agora é sua vez. Escreva um programa que salve os dois robôs ao mesmo tempo.
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayerMulti(false, 2, [5, 5], [5, 5], [2, 2],
                                          [[6, 12, 13, 15, 19, 21, 23],
                                           [7, 11, 12, 15, 23, 24]]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Salve os dois robôs ao mesmo tempo!
      </p>,
      <p>
        Salve mais estes robôs. Estamos quase salvando todos eles! :)
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayerMulti(false, 2, [6, 6], [8, 8], [1, 4],
                                          [[9, 13, 16, 18, 19, 22, 26, 29, 32, 35,
                                            36, 41, 46], [8, 11, 18, 19, 22, 25, 28,
                                            37, 38, 41, 43, 44]]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Salve os dois robôs ao mesmo tempo!
      </p>,
      <p>
        Com estes robôs, finalizamos por hoje. Todos os robôs terão sido
        salvos com sucesso, e tudo graças a você! Espero que possamos
        trabalhar juntos novamente, e boa sorte nessa nova jornada!
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayerMulti(false, 2, [10, 10], [5, 5], [2, 2],
                                          [[7, 11, 13, 22, 26, 27, 38, 42, 46, 49],
                                           [11, 12, 13, 17, 25, 28, 32, 36, 47, 48]]),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Parabéns! Os robôs agradecem a sua ajuda!
      </p>,
      <p>
        E isso é tudo! Continue se divertindo salvando robôs, ou pode
        descansar por hoje! :)
      </p>,
      commandsReference,
      new Lesson01ExerciseStepPlayer(false, 10, 10),
      "",
      Constants.Lesson01.SUCCESS_MESSAGE));
}

Lesson01.prototype = Object.create(Lesson.Lesson.prototype);
Object.assign(Lesson01.prototype, {
  populateResourceLoader: function() {
    ResourceLoader.addImage(ElementFactories.ROBOT_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.ASTEROIDS_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.ASTEROIDS_BACKGROUND_URL);
  },
});

module.exports = Lesson01;
