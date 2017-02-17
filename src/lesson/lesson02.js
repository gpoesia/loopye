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

// Actions supported in this lesson.
var Actions = {
  MOVE_FORWARD: "F",
  TURN_LEFT: "E",
  TURN_RIGHT: "D",
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
};

function Lesson02() {
  Lesson.Lesson.call(this);

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Com mais um "F", esse robô coletará a bateria.
      </p>,
      <div>
        <p>
          Olá de novo! Que bom que você voltou! Eu estava precisando da sua
          ajuda. Nossos robôs escaparam da chuva de meteoros, mas agora
          precisamos alimentá-los.
          Precisamos coletar baterias para que tenhamos energia suficiente
          para seguir nossa missão.
        </p>
        <p>
          As coisas aqui para nós programadores mudaram um pouco,
          agora que estão em terra segura.
          Vou te passar os comandos um a um.
          Cada robô, agora, está olhando em uma direção.
          Vamos ver como girar o robô, mas antes o mais importante:
          como fazer ele se mover?
          Agora, vamos usar o comando <b>F</b> maiúsculo (que significa <b> para frente</b>)
          para mover o robô rumo à bateria.
          Vê esse robô? Ele precisa mover-se duas vezes para chegar
          até a bateria. Eu já coloquei um <b>F</b> lá: basta colocar outro para
          pegarmos esta bateria.
        </p>
      </div>,
      [Constants.References.MOVE_FORWARD],
      new Lesson02ExerciseStepPlayer(
        false, 3, 3, new Grid.Position(0, 0), Grid.Directions.RIGHT,
        [new Grid.Position(0, 2)],
        []),
      Actions.MOVE_FORWARD,
      Constants.Lesson02.SUCCESS_MESSAGE,
      null));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Depois de virar à direita com o comando "D", fica fácil, não?
      </p>,
      <div>
        <p>
          Muito bem! Aquele foi fácil, porque o robô já estava olhando
          na direção certa. Este robô está virado para cima.
          Para que ele vire para a direita, vamos usar o comando <b> D </b>
          (de <b> direita</b>).
          Depois, basta andar duas vezes para frente e pegar a bateria,
          como você já fez antes.
        </p>
      </div>,
      [Constants.References.MOVE_FORWARD,
       Constants.References.TURN_RIGHT],
      new Lesson02ExerciseStepPlayer(
        false, 3, 3, new Grid.Position(0, 0), Grid.Directions.UP,
        [new Grid.Position(0, 2)],
        []),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      null));

  var commandsReference = [Constants.References.MOVE_FORWARD,
                           Constants.References.TURN_LEFT,
                           Constants.References.TURN_RIGHT];

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Lembre-se: use o comando "E" para virar à esquerda.
      </p>,
      <div>
        <p>
          Certo. Olhe este robô: ele está virado para cima,
          e apenas andando para frente conseguimos pegar a primeira bateria.
          Mas, para chegar à outra, vamos precisar virar à esquerda,
          e depois andar em frente novamente.
          Para isso, use o comando <b> E </b> (de <b> esquerda</b>).
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 5, 3, new Grid.Position(4, 1), Grid.Directions.UP,
        [new Grid.Position(1, 1), new Grid.Position(1, 0)],
        []),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      null));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Hmm, vamos precisar virar mais de uma vez nesta situação.
      </p>,
      <div>
        <p>
          Perfeito. Este robô está em uma situação mais complicada,
          pois há várias baterias e precisamos pegar todas elas.
          Mas tenho certeza de que você já pode ajudá-lo.
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 5, 3, new Grid.Position(4, 1), Grid.Directions.LEFT,
        [new Grid.Position(3, 1), new Grid.Position(2, 1),
         new Grid.Position(0, 1), new Grid.Position(1, 0)],
        []),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      null));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Cuidado: o maior pesadelo de um robô é uma bateria estragada.
      </p>,
      <div>
        <p>
          Ah, mais uma coisa. Nem todas as baterias são boas.
          Olhe essa bateria vermelha! Ela está vencida, e vazando.
          Isto é mortal para um robô.
          Evite essas baterias a todo custo!
          Eu escrevi um programa que pega as três baterias,
          mas ele não funciona bem, porque não deveríamos pegar a vermelha.
          Você consegue pegar as duas baterias verdes sem passar pela estragada?
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 4, 3, new Grid.Position(3, 1), Grid.Directions.UP,
        [new Grid.Position(2, 1), new Grid.Position(0, 1)],
        [new Grid.Position(1, 1)]),
      "FFF",
      Constants.Lesson02.SUCCESS_MESSAGE,
      null));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Este robô precisa andar bastante. Ainda bem que será bem recompensado
        com 4 baterias :)
      </p>,
      <div>
        <p>
          Muito bem! Vou te mostrar algo legal, agora.
          Está vendo este robô?
          Ele precisa percorrer uma longa distância para chegar às primeiras
          baterias, e depois virar e seguir outro longo caminho.
          Você já consegue ajudá-lo, mas depois vou te mostrar uma forma mais
          fácil de fazer a mesma coisa.
          Primeiro, faça como você já sabe.
          Lembre-se de não tocar as baterias vermelhas.
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 6, 10, new Grid.Position(0, 0), Grid.Directions.DOWN,
        [new Grid.Position(0, 7), new Grid.Position(0, 8),
         new Grid.Position(0, 9), new Grid.Position(5, 9)],
        [new Grid.Position(1, 0),
         new Grid.Position(1, 4),
         new Grid.Position(4, 3),
         new Grid.Position(3, 8),
        ]),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      null));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Este robô precisa andar bastante. Ainda bem que será bem recompensado
        com 4 baterias :)
      </p>,
      <div>
        <p>
          Ufa! Quanto trabalho, não?
          Vou te mostrar uma forma mais fácil de fazer isso.
          Você sabe que o robô, depois de virar à esquerda,
          tem que se mover 9 vezes.
          Para fazer isso, você pode dizer em seu programa: <b>{"9{F}"}</b>.
          Vou te explicar como funciona. O código que está entre {"{"} e {"}"}
          (que são chamadas de chaves) é o código que será repetido muitas vezes.
          O número que vem antes é quantas vezes o código será executado.
          Essa é outra forma de dizer <b>FFFFFFFFF</b>, mas bem melhor, não?
        </p>
        <p>
          Da mesma forma, podemos depois virar à direita e fazer <b>{"5{F} "}</b>
          para andar cinco vezes. Veja o código que eu escrevi.
          Ele pega todas as baterias e é bem curto e fácil de ler!
          Ah, veja que podemos colocar o código com espaços, e em várias linhas,
          que é a mesma coisa. O robô não se importa, e fica mais fácil de entender.
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 6, 10, new Grid.Position(0, 0), Grid.Directions.DOWN,
        [new Grid.Position(0, 7), new Grid.Position(0, 8),
         new Grid.Position(0, 9), new Grid.Position(5, 9)],
        [new Grid.Position(1, 0),
         new Grid.Position(1, 4),
         new Grid.Position(4, 3),
         new Grid.Position(3, 8),
        ]),
      "L\n9{F}\nD\n5{F}",
      Constants.Lesson02.SUCCESS_MESSAGE,
      null));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Laços são muito úteis para programar. Use-os sempre que precisar.
      </p>,
      <div>
        <p>
          Legal! Vamos ver se você entendeu.
          Este robô tem um longo caminho para percorrer.
          Mas usando laços, que é o nome chique para código que é repetido
          muitas vezes, vai ficar fácil :)
        </p>
        <p>
          Perceba quanto trabalho os laços estão economizando.
          Vamos lá, eu já comecei para você.
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 6, 10, new Grid.Position(5, 0), Grid.Directions.DOWN,
        [new Grid.Position(0, 7),
         new Grid.Position(0, 9), new Grid.Position(5, 9),
         new Grid.Position(5, 5), new Grid.Position(2, 5)],
        [new Grid.Position(1, 1),
         new Grid.Position(2, 1),
         new Grid.Position(1, 4),
         new Grid.Position(1, 5),
         new Grid.Position(1, 6),
         new Grid.Position(2, 6),
         new Grid.Position(2, 4),
         new Grid.Position(3, 4),
         new Grid.Position(4, 4),
         new Grid.Position(5, 4),
        ]),
      "DD\n5{F}",
      Constants.Lesson02.SUCCESS_MESSAGE,
      null));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Só podemos usar 9 caracteres desta vez.
        Mas, usando laços, não teremos problemas.
      </p>,
      <div>
        <p>
          Muito bem! Você está indo muito bem.
          Se conseguir chegar até o final desta missão,
          pegando todas as baterias,
          vou colocar sua foto na nossa parede: "ajudante do mês" :)
        </p>
        <p>
          Oh não, estamos tendo um problema de comunicação com alguns robôs.
          O problema é que não podemos mandar códigos muito grandes para eles.
          Está vendo que agora, acima do código lá na esquerda, há um limite?
          É o número de caracteres que podemos enviar para este robô: apenas 9.
          Espaços não contam, então ainda podemos organizar o código em
          várias linhas sem problemas.
        </p>
        <p>
          Bom, mas com laços será fácil.
          Não se preocupe: sempre será possível ajudar os robôs mesmo com
          os limites, mas talvez tenhamos que pensar um pouco mais
          e usar laços.
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 6, 6, new Grid.Position(0, 0), Grid.Directions.RIGHT,
        [new Grid.Position(0, 5), new Grid.Position(5, 5)],
        []
        ),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      9));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Você está indo muito bem. Os robôs agradecem a sua ajuda!
      </p>,
      <div>
        <p>
          Perfeito! Veja, este robô está em uma situação muito parecida.
          Desta vez, o limite é menor, então não podemos digitar
          <b>{ "4{F} D 4{F}"}</b> nem <b>FFFFDFFFF</b>, porque os dois têm 9
          caracteres, mas só podemos usar 8.
          Vou te mostrar o truque.
          Um laço pode ter mais de um comando para ser repetido.
          Nesse caso, podemos repetir duas vezes o seguinte: <b>FFFFD</b>.
          Com isto, o robô chega à primeira bateria, vira à direita,
          e depois faz o mesmo: chega à segunda bateria e vira à direita.
          Essa última virada à direita não é necessária, mas não importa,
          porque o programa fica mais curto.
        </p>
        <p>
          Basta então escrever um loop que executa <b>FFFFD</b> duas vezes.
          Na linguagem dos robôs, isso seria: <b>{"2{FFFFD}"}</b>. Legal, não?
          Vamos lá, não deixe esse robô morrer de fome...
          ou melhor, sem bateria.
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 5, 5, new Grid.Position(0, 0), Grid.Directions.RIGHT,
        [new Grid.Position(0, 4), new Grid.Position(4, 4)],
        [
          new Grid.Position(1, 0),
          new Grid.Position(3, 1),
          new Grid.Position(3, 3),
          new Grid.Position(4, 3),
        ]),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      8));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        O limite é o mesmo do robô anterior, mas esse precisa andar mais.
        Mas tudo bem, com laços fica fácil.
      </p>,
      <div>
        <p>
          Veja só, um caso muito parecido, mas há três baterias boas agora.
          Você consegue ver como fazer o trajeto usando só 8 caracteres?
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 5, 5, new Grid.Position(0, 0), Grid.Directions.RIGHT,
        [new Grid.Position(0, 4), new Grid.Position(4, 4),
         new Grid.Position(4, 0)],
        [new Grid.Position(3, 0), new Grid.Position(1, 2)]),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      8));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Mais um robô faminto. Vamos lá!
      </p>,
      <div>
        <p>
          Muito bem! Só trocar um 2 por um 3 já fez uma grande diferença, não?
        </p>
        <p>
          Agora ajude este robô. Você não tem muitos caracteres para usar,
          então usar laços vai ser essencial.
          Pense em como fazer um zigue-zague até a bateria mais alta
          usando um laço.
          O que o robô precisa repetir para fazer esse movimento de subir
          uma escada? Sei que você consegue!
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 6, 7, new Grid.Position(5, 0), Grid.Directions.UP,
        [new Grid.Position(4, 0), new Grid.Position(3, 1),
         new Grid.Position(3, 2), new Grid.Position(2, 2),
         new Grid.Position(1, 3), new Grid.Position(1, 4),
         new Grid.Position(4, 4), new Grid.Position(5, 4)],
        [new Grid.Position(2, 0), new Grid.Position(2, 1),
         new Grid.Position(4, 2), new Grid.Position(1, 2),
         new Grid.Position(0, 2), new Grid.Position(0, 4),
         new Grid.Position(2, 5), new Grid.Position(3, 6),
         new Grid.Position(4, 6),
        ]),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      13));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Pense bem em qual ordem você vai pegar as baterias, para conseguir
        respeitar o limite do código.
      </p>,
      <div>
        <p>
          Você é demais! Oh, mais um robô precisando da sua ajuda.
          Esse tem muitas baterias para pegar.
          Escolha bem a ordem em que você vai pegá-las.
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 6, 5, new Grid.Position(5, 0), Grid.Directions.RIGHT,
        [new Grid.Position(4, 0), new Grid.Position(2, 0),
         new Grid.Position(1, 0), new Grid.Position(2, 1),
         new Grid.Position(5, 2), new Grid.Position(3, 2),
         new Grid.Position(2, 2), new Grid.Position(5, 3),
         new Grid.Position(4, 3), new Grid.Position(5, 4),
         new Grid.Position(4, 4)],
        [new Grid.Position(0, 0), new Grid.Position(1, 2),
         new Grid.Position(3, 1), new Grid.Position(4, 1),
         new Grid.Position(4, 2), new Grid.Position(3, 4)]),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      20));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Vamos lá, faltam poucos robôs, agora.
      </p>,
      <div>
        <p>
          Quantas baterias! Esse já é um dos nossos últimos robôs,
          e já estou quase pedindo para pendurarem sua foto de ajudante
          do mês na parede.
        </p>
        <p>
          Eu tenho a impressão de que dois laços resolvem nosso problema,
          neste caso. Bom, nem precisava dizer isso,
          já que você já é profissional agora :)
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 6, 6, new Grid.Position(5, 0), Grid.Directions.UP,
        [new Grid.Position(2, 0), new Grid.Position(1, 0),
         new Grid.Position(3, 2), new Grid.Position(2, 2),
         new Grid.Position(0, 3), new Grid.Position(2, 5),
         new Grid.Position(4, 3), new Grid.Position(3, 3),
         new Grid.Position(5, 4),
         new Grid.Position(5, 5), new Grid.Position(4, 5)],
        [new Grid.Position(5, 1), new Grid.Position(2, 1),
         new Grid.Position(4, 2), new Grid.Position(1, 2),
         new Grid.Position(5, 3), new Grid.Position(2, 4)]),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      16));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Talvez a técnica que você aprendeu para fazer um zigue-zague seja
        útil aqui.
      </p>,
      <div>
        <p>
          Mais um robô precisando de baterias.
          A situação deste é um pouco complicada,
          mas é possível pegar todas as baterias sem passar do limite.
          Se você não estiver conseguindo, tente pegar as baterias em
          uma ordem diferente. Acredito que você vai conseguir. Vamos lá!
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 6, 7, new Grid.Position(5, 0), Grid.Directions.UP,
        [
          new Grid.Position(3, 0), new Grid.Position(3, 1),
          new Grid.Position(1, 1), new Grid.Position(1, 2),
          new Grid.Position(2, 2), new Grid.Position(4, 4),
          new Grid.Position(4, 5), new Grid.Position(1, 5),
          new Grid.Position(1, 4),
        ],
        [
          new Grid.Position(4, 1), new Grid.Position(0, 3),
          new Grid.Position(1, 6), new Grid.Position(5, 5),
          new Grid.Position(2, 3), new Grid.Position(2, 4)]),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      16));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Laços dentro de laços podem ser muito úteis, também!
      </p>,
      <div>
        <p>
          Muito bem! Como você está indo tão bem, vou te ensinar mais um truque.
          Você sabia que um laço pode estar dentro de outro laço?
          Por exemplo, para este robô, queremos que ele percorra um quadrado
          muito grande.
          <b>{"4 { FFFFFFFFF D }"}</b> funcionaria, mas é longo demais,
          pois usa 13 caracteres e só podemos usar 8 desta vez.
          Porém, podemos fazer o seguinte: repetir duas vezes o
          código <b>{"9 {F} D"}</b>. Como fazemos isso?
          É simples: <b>{"2 { 9 {F} D }"}</b>.
        </p>
        <p>
          Tudo que está dentro do <b>{"2 { }"}</b> é repetido duas vezes,
          inclusive o outro laço. <b>{"9{F}"}</b> faz o robô andar 9 vezes,
          como você já sabe.
          Depois, ele vira à direita, e repete tudo isso mais uma vez.
          Legal, não?
          Com isto, fazemos com que ele percorra esse trajeto muito longo
          com pouco código. Experimente você mesmo!
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 10, 10, new Grid.Position(0, 0), Grid.Directions.RIGHT,
        [
          new Grid.Position(0, 2), new Grid.Position(0, 8),
          new Grid.Position(0, 9), new Grid.Position(4, 9),
          new Grid.Position(9, 9), new Grid.Position(9, 7),
          new Grid.Position(9, 0), new Grid.Position(7, 0),
          new Grid.Position(3, 0), new Grid.Position(2, 0),
        ],
        [
          new Grid.Position(1, 5), new Grid.Position(2, 8),
          new Grid.Position(8, 8), new Grid.Position(3, 7),
          new Grid.Position(7, 4), new Grid.Position(1, 6)
        ]),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      8));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Nosso último robô de hoje!
        Mais dois laços aninhados e terminamos a missão!
      </p>,
      <div>
        <p>
          Muito bem!
          Quando um laço está dentro de outro,
          dizemos que eles estão aninhados.
          Mas não se preocupe, é só o nome.
        </p>
        <p>
          Este é nosso último robô precisando de ajuda hoje.
          Com certeza vai ficar muito feliz com tantas baterias por aí!
          Hmm, como são tantas, talvez seja mais fácil fazer o robô passar por
          todos os lugares possíveis.
          Ou melhor, quase todos: cuidado com as baterias ruins.
          Você pode fazer isso com laços aninhados :)
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 10, 10, new Grid.Position(9, 9), Grid.Directions.UP,
        [
          new Grid.Position(9, 3), new Grid.Position(9, 4),
          new Grid.Position(9, 5), new Grid.Position(9, 8),
          new Grid.Position(8, 2), new Grid.Position(8, 6),
          new Grid.Position(8, 5), new Grid.Position(8, 3),
          new Grid.Position(8, 7), new Grid.Position(8, 8),
          new Grid.Position(7, 4), new Grid.Position(7, 5),
          new Grid.Position(7, 8), new Grid.Position(7, 6),
          new Grid.Position(6, 3), new Grid.Position(6, 9),
          new Grid.Position(6, 5), new Grid.Position(5, 4),
          new Grid.Position(5, 9), new Grid.Position(5, 8),
          new Grid.Position(4, 5), new Grid.Position(4, 8),
          new Grid.Position(4, 4), new Grid.Position(4, 6),
          new Grid.Position(3, 2), new Grid.Position(3, 9),
          new Grid.Position(3, 5), new Grid.Position(3, 8),
          new Grid.Position(2, 2), new Grid.Position(2, 6),
          new Grid.Position(1, 2), new Grid.Position(1, 7),
          new Grid.Position(1, 9), new Grid.Position(1, 5),
          new Grid.Position(0, 2), new Grid.Position(0, 3),
          new Grid.Position(0, 4), new Grid.Position(0, 5),
          new Grid.Position(0, 6), new Grid.Position(0, 7),
          new Grid.Position(0, 9), new Grid.Position(0, 8),
        ],
        [
          new Grid.Position(0, 0), new Grid.Position(0, 1),
          new Grid.Position(2, 0), new Grid.Position(3, 1),
          new Grid.Position(3, 0), new Grid.Position(8, 1),
          new Grid.Position(9, 0), new Grid.Position(2, 1),
        ]),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      20));

  this.addStep(
    new Lesson.LessonStep(
      <p>
        Missão cumprida! Parabéns!
      </p>,
      <div>
        <p>
          Muito obrigado pela ajuda! Isso é tudo por hoje.
          Agora temos energia suficiente para seguir
          nossa missão neste planeta. Pode descansar, ou, se quiser,
          seguir brincando com este robô :)
        </p>
        <p>
          Em breve você será chamado para a continuação da nossa missão.
          Na verdade, ainda não contei o que estamos fazendo, certo?
          Não se preocupe: na hora certa você vai descobrir.
        </p>
      </div>,
      commandsReference,
      new Lesson02ExerciseStepPlayer(
        false, 10, 10, new Grid.Position(9, 9), Grid.Directions.UP,
        [
          new Grid.Position(8, 5), new Grid.Position(8, 3),
          new Grid.Position(1, 2), new Grid.Position(1, 7),
          new Grid.Position(3, 5), new Grid.Position(3, 8),
          new Grid.Position(3, 2), new Grid.Position(3, 9),
          new Grid.Position(2, 2), new Grid.Position(2, 6),
          new Grid.Position(0, 9), new Grid.Position(0, 8),
          new Grid.Position(6, 3), new Grid.Position(6, 9),
          new Grid.Position(7, 8), new Grid.Position(7, 6),
          new Grid.Position(6, 5), new Grid.Position(5, 4),
          new Grid.Position(0, 6), new Grid.Position(0, 7),
          new Grid.Position(1, 9), new Grid.Position(1, 5),
          new Grid.Position(0, 2), new Grid.Position(0, 3),
        ],
        [
          new Grid.Position(5, 9), new Grid.Position(5, 8),
          new Grid.Position(7, 8), new Grid.Position(7, 6),
          new Grid.Position(3, 0), new Grid.Position(8, 1),
          new Grid.Position(0, 4), new Grid.Position(0, 5),
          new Grid.Position(9, 5), new Grid.Position(9, 8),
          new Grid.Position(9, 3), new Grid.Position(9, 4),
          new Grid.Position(9, 0), new Grid.Position(2, 1),
          new Grid.Position(8, 2), new Grid.Position(8, 6),
          new Grid.Position(8, 7), new Grid.Position(8, 8),
          new Grid.Position(4, 5), new Grid.Position(4, 8),
          new Grid.Position(7, 4), new Grid.Position(7, 5),
          new Grid.Position(4, 4), new Grid.Position(4, 6),
          new Grid.Position(0, 0), new Grid.Position(0, 1),
          new Grid.Position(2, 0), new Grid.Position(3, 1),
        ]),
      "",
      Constants.Lesson02.SUCCESS_MESSAGE,
      null));
}

Lesson02.prototype = Object.create(Lesson.Lesson.prototype);
Object.assign(Lesson02.prototype, {
  populateResourceLoader: function() {
    ResourceLoader.addImage(ElementFactories.ROBOT_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.GOOD_BATTERY_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.BAD_BATTERY_IMAGE_URL);
  },
});

module.exports = Lesson02;
