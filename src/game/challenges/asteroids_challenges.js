/*
 * Challenges for the asteroids and asteroids2 games.
 */

var React = require("react");
var Game = require("../game");
var Asteroids = require("../asteroids");
var Icons = require("../../view/icons");
var T = require("../../util/translate").T;
var Constants = require("../../constants");

var SUCCESS_MESSAGE = T("Muito bem! Mais um robô a salvo! :)");

function createAsteroidsChallenge(id,
                                  shortInstructions,
                                  longInstructions,
                                  commandReference,
                                  initialCode,
                                  rows,
                                  columns,
                                  robotPosition,
                                  obstaclePositions) {
  Game.registerChallenge(
    new Game.Challenge(
      id,
      "asteroids",
      shortInstructions,
      longInstructions,
      commandReference,
      initialCode,
      SUCCESS_MESSAGE,
      null,
      {
        rows: rows,
        columns: columns,
        robotPosition: robotPosition,
        obstaclePositions: obstaclePositions,
      }));
}

function createAsteroids2Challenge(id,
                                   shortInstructions,
                                   longInstructions,
                                   commandReference,
                                   initialCode,
                                   rows,
                                   columns,
                                   robotPosition,
                                   obstaclesPositions) {
  var challengesList = [];

  for (var i = 0; i < rows.length; ++i) {
    challengesList.push(
      {
        rows: rows[i],
        columns: columns[i],
        robotPosition: robotPosition[i],
        obstaclePositions: obstaclesPositions[i]
      });
  }

  Game.registerChallenge(
    new Game.Challenge(
      id,
      "asteroids2",
      shortInstructions,
      longInstructions,
      commandReference,
      initialCode,
      SUCCESS_MESSAGE,
      null,
      {
        challengesList: challengesList,
      }));
}


createAsteroidsChallenge(
  "greetings",
  <p>
    Eu já escrevi um programa para salvar este robô, ali do lado esquerdo.
    Ele é "EA". Aperte {Icons.PlayIcon} para ver o que ele faz.
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
    <b> EA</b> no nosso sistema, ali na esquerda. O robô executa cada comando em sequência:
    primeiro o comando <b> E</b>, e em seguida o <b> A</b>. Quando acabam os comandos, ele fica parado,
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
  "EA",
  3, 3, 1,
  [5, 7, 8]
);

var commandsReference = [Constants.References.WAIT,
                         Constants.References.MOVE_LEFT];

createAsteroidsChallenge(
  "first-right-movement",
  <p>
    Para este robô, você precisará usar o comando "D" para ir para a direita.
    Mas não apenas isso: antes, ele precisará esperar o meteoro que vai cair à sua direita.
    Boa sorte! Não tenha medo de tentar, errar e tentar de novo,
    o robô é resistente :-)
  </p>,
  <p>
    Muito bem! Ah, você deve estar se perguntando por que <b> EA</b>. Bom,
    vamos passo-a-passo: a letra <b> E </b> (de <b> esquerda</b>), comanda
    que o robô se movimente para a esquerda. A letra <b> A </b> (de <b> aguardar</b>),
    comanda que o robô permaneça onde está naquele momento.
    Combinando os dois comandos, o robô se movimenta para a esquerda e,
    em sequência, aguarda na posição atual. Não precisamos utilizar a
    letra <b> D </b> para o robô anterior, mas para este, iremos precisar.
    Você consegue descobrir para que ela serve? Clique em {Icons.PlayIcon} para ver
    o que acontece.
  </p>,
  commandsReference,
  "",
  3, 3, 1,
  [3, 5, 6, 7]
);

commandsReference = commandsReference.concat([Constants.References.MOVE_RIGHT]);

createAsteroidsChallenge(
  "fix-simple",
  <p>
    Eu tentei <b>EADE</b>, mas o robô está sendo atingido. Acho que com uma pequena
    correção esse programa já deve ser suficiente.
  </p>,
  <p>
    Certo. Vamos salvar um robô em uma situação um pouco mais difícil.
    Eu estou tentando, mas sinto que cometi um erro
    e escrevi o programa errado. Você consegue corrigir o erro?
  </p>,
  commandsReference,
  "EADE",
  5, 3, 1,
  [4, 7, 8, 9, 11, 12, 13]
);

createAsteroidsChallenge(
  "many-paths",
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
  "",
  5, 4, 1,
  [5, 10, 12, 14, 16, 17, 19]
);

createAsteroidsChallenge(
  "single-path-long",
  <p>
    Esse robô caiu em uma enrascada!
  </p>,
  <p>
    Para alguns casos, existem diversos programas diferentes em que o
    robô seja salvo com sucesso. Por exemplo, o robô anterior poderia
    ser salvo com qualquer um dos programas seguintes: <b>EADD</b>, <b>EDAD</b>, <b>DEAD</b>,
    <b>DDAE</b>. Você acha que o mesmo é verdade para este robô?
  </p>,
  commandsReference,
  "",
  15, 3, 1,
  [3, 4, 6, 8, 9, 11, 12, 14, 15, 17,
    18, 20, 22, 23, 24, 26, 27, 28, 30, 31,
    33, 35, 37, 38, 39, 41, 43, 44]
);

createAsteroidsChallenge(
  "single-path-medium",
  <p>
    Outro robô em apuros...
  </p>,
  <p>
    Se você respondeu <b> DEAAAAEDDAEEDE</b> para o robô anterior, e acha que é
    o único programa que faz com que o robô desvie corretamente de
    todos os meteoros, você acertou! Igualmente, para este robô, só
    existe um programa que faz com que ele seja salvo sem ser atingido
    por nenhum meteoro.
  </p>,
  commandsReference,
  "",
  6, 10, 4,
  [11, 13, 15, 17, 22, 23, 24, 26,
    31, 34, 35, 37, 44, 46, 47, 48,
    53, 55, 56]
);

createAsteroidsChallenge(
  "single-command",
  <p>
    Esse será moleza :)
  </p>,
  <p>
    Ah, um caso mais fácil. Você pode economizar seus dedos desta vez.
    Consegue pensar em alguma maneira de salvar este
    robô com um programa de apenas um comando?
  </p>,
  commandsReference,
  "",
  5, 8, 1,
  [9, 17, 18, 25, 26, 27, 33, 35, 36]
);

createAsteroidsChallenge(
  "no-safe-region",
  <p>
    Hmm, não sei se esse robô terá o luxo de ficar parado esperando
    que a chuva passe...
  </p>,
  <p>
    Para o robô anterior, vimos que existe uma "região segura" que,
    após alcançada, significa que o robô não será atingido se todos os
    comandos seguintes forem somente de espera (sequência de <b>A</b>s).
    Você acha que existe alguma regiao segura para o robô atual?
  </p>,
  commandsReference,
  "",
  6, 7, 3,
  [7, 9, 11, 13, 15, 17, 19,
    21, 23, 25, 27, 29, 31, 33,
    35, 37, 39, 41]
);

createAsteroidsChallenge(
  "safe-region",
  <p>
    Todo robô queria estar em uma situação assim :)
  </p>,
  <p>
    Para o robô anterior, não existia região segura. O que acontece
    se o robô já começar em uma regiao segura?
  </p>,
  commandsReference,
  "",
  5, 5, 2,
  [6, 10, 13, 16, 18, 19, 21, 23]
);

createAsteroidsChallenge(
  "long-trap",
  <p>
    Cuidado por onde leva o robô! Mas a esta altura sei que você já é profissional.
  </p>,
  <p>
    Muito bem! Essa foi fácil. Salve este outro robô. Para este novo robô, é fácil se
    confundir. Então programe com bastante atenção!
  </p>,
  commandsReference,
  "",
  10, 5, 2,
  [7, 11, 12, 13, 17, 22, 26, 27, 28, 29,
    32, 36, 38, 42, 45, 46, 47, 48]
);


createAsteroids2Challenge(
  "example",
  <p>
    Salve os dois robôs!
  </p>,
  <p>
    Alguns de nossos robôs recebem comandos do mesmo computador e, por isso,
    o programa que for escrito para salvá-los deve ser único e deve funcionar
    igualmente para os dois robôs. Veja neste exemplo: o programa <b>AEAA </b>
    salva o primeiro robô, mas faz com que o segundo seja atingido por um meteoro.
    Já o programa <b>EEAA</b> salva o segundo robô, mas faz com que o primeiro
    seja atingido por um meteoro. O único programa que salva os dois
    robôs, ao mesmo tempo, é <b>ADEA</b> (ou <b>ADE</b>).
  </p>,
  commandsReference,
  "ADE",
  [5, 5], [5, 5], [2, 2],
  [[6, 8, 12, 15, 18], [8, 11, 19]]
);

createAsteroids2Challenge(
  "easy",
  <p>
    Salve os dois robôs ao mesmo tempo!
  </p>,
  <p>
    Agora é sua vez. Escreva um programa que salve os dois robôs ao mesmo tempo.
  </p>,
  commandsReference,
  "",
  [5, 5], [5, 5], [2, 2],
  [[6, 12, 13, 15, 19, 21, 23],
    [7, 11, 12, 15, 23, 24]]
);

createAsteroids2Challenge(
  "medium",
  <p>
    Salve os dois robôs ao mesmo tempo!
  </p>,
  <p>
    Salve mais estes robôs. Estamos quase salvando todos eles!
  </p>,
  commandsReference,
  "",
  [6, 6], [8, 8], [1, 4],
  [[9, 13, 16, 18, 19, 22, 26, 29, 32, 35, 36, 41, 46],
    [8, 11, 18, 19, 22, 25, 28, 37, 38, 41, 43, 44]]
);

createAsteroids2Challenge(
  "hard",
  <p>
    Salve os dois robôs ao mesmo tempo!
  </p>,
  <p>
    Com estes robôs, finalizamos por hoje. Todos os robôs terão sido
    salvos com sucesso, e tudo graças a você! Espero que possamos
    trabalhar juntos novamente, e boa sorte nessa nova jornada!
  </p>,
  commandsReference,
  "",
  [10, 10], [5, 5], [2, 2],
  [[7, 11, 13, 22, 26, 27, 38, 42, 46, 49],
    [11, 12, 13, 17, 25, 28, 32, 36, 47, 48]]
);
