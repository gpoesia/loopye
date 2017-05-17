/*
 * Challenges for the batteries and batteries2 games.
 */

var React = require("react");
var Game = require("../game");
var Batteries = require("../batteries");
var Icons = require("../../view/icons");
var T = require("../../util/translate").T;
var Constants = require("../../constants");
var Grid = require("../../lesson/utils/grid");

var SUCCESS_MESSAGE = T("Muito bem! :)");

function createBatteriesChallenge(id,
                                  shortInstructions,
                                  longInstructions,
                                  commandReference,
                                  initialCode,
                                  codeSizeLimit,
                                  rows,
                                  cols,
                                  initial_position,
                                  initial_direction,
                                  batteries_positions,
                                  leaking_batteries_position) {
  Game.registerChallenge(
    new Game.Challenge(
      id,
      "batteries",
      shortInstructions,
      longInstructions,
      commandReference,
      initialCode,
      SUCCESS_MESSAGE,
      codeSizeLimit,
      {
        rows: rows,
        cols: cols,
        initial_position: initial_position,
        initial_direction: initial_direction,
        batteries_positions: batteries_positions,
        leaking_batteries_position: leaking_batteries_position,
      }
    )
  );
}

var commandReference = [Constants.References.MOVE_FORWARD];

createBatteriesChallenge(
  "step01",
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
  commandReference,
  "F",
  null,
  3,
  3,
  new Grid.Position(0, 0),
  Grid.Directions.RIGHT,
  [new Grid.Position(0, 2)],
  []
);

commandReference = [Constants.References.MOVE_FORWARD,
                    Constants.References.TURN_RIGHT];

createBatteriesChallenge(
  "step02",
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
  commandReference,
  "",
  null,
  3,
  3,
  new Grid.Position(0, 0),
  Grid.Directions.UP,
  [new Grid.Position(0, 2)],
  []
);

commandReference = [Constants.References.MOVE_FORWARD,
                    Constants.References.TURN_LEFT,
                    Constants.References.TURN_RIGHT];

createBatteriesChallenge(
  "step03",
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
  commandReference,
  "",
  null,
  5,
  3,
  new Grid.Position(4, 1),
  Grid.Directions.UP,
  [new Grid.Position(1, 1), new Grid.Position(1, 0)],
  []
);

createBatteriesChallenge(
  "step04",
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
  commandReference,
  "",
  null,
  5,
  3,
  new Grid.Position(4, 1),
  Grid.Directions.LEFT,
  [
    new Grid.Position(3, 1), new Grid.Position(2, 1),
    new Grid.Position(0, 1), new Grid.Position(1, 0)
  ],
  []
);

createBatteriesChallenge(
  "step05",
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
  commandReference,
  "FFF",
  null,
  4,
  3,
  new Grid.Position(3, 1),
  Grid.Directions.UP,
  [new Grid.Position(2, 1), new Grid.Position(0, 1)],
  [new Grid.Position(1, 1)]
);

createBatteriesChallenge(
  "step06",
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
  commandReference,
  "",
  null,
  6,
  10,
  new Grid.Position(0, 0),
  Grid.Directions.DOWN,
  [
    new Grid.Position(0, 7), new Grid.Position(0, 8),
    new Grid.Position(0, 9), new Grid.Position(5, 9)
  ],
  [
    new Grid.Position(1, 0), new Grid.Position(1, 4),
    new Grid.Position(4, 3), new Grid.Position(3, 8)
  ]
);

createBatteriesChallenge(
  "step07",
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
  commandReference,
  "E\n9{\n  F\n}\nD\n5{\n  F\n}",
  null,
  6,
  10,
  new Grid.Position(0, 0),
  Grid.Directions.DOWN,
  [
    new Grid.Position(0, 7), new Grid.Position(0, 8),
    new Grid.Position(0, 9), new Grid.Position(5, 9)
  ],
  [
    new Grid.Position(1, 0), new Grid.Position(1, 4),
     new Grid.Position(4, 3), new Grid.Position(3, 8)
  ]
);

createBatteriesChallenge(
  "step08",
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
  commandReference,
  "DD\n5{\n  F\n}",
  null,
  6,
  10,
  new Grid.Position(5, 0),
  Grid.Directions.DOWN,
  [
    new Grid.Position(0, 7), new Grid.Position(0, 9),
    new Grid.Position(5, 9), new Grid.Position(5, 5),
    new Grid.Position(2, 5)
  ],
  [
    new Grid.Position(1, 1), new Grid.Position(2, 1),
    new Grid.Position(1, 4), new Grid.Position(1, 5),
    new Grid.Position(1, 6), new Grid.Position(2, 6),
    new Grid.Position(2, 4), new Grid.Position(3, 4),
    new Grid.Position(4, 4), new Grid.Position(5, 4)
  ]
);

createBatteriesChallenge(
  "step09",
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
  commandReference,
  "",
  9,
  6,
  6,
  new Grid.Position(0, 0),
  Grid.Directions.RIGHT,
  [new Grid.Position(0, 5), new Grid.Position(5, 5)],
  []
);

createBatteriesChallenge(
  "step10",
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
  commandReference,
  "",
  8,
  5,
  5,
  new Grid.Position(0, 0),
  Grid.Directions.RIGHT,
  [new Grid.Position(0, 4), new Grid.Position(4, 4)],
  [
    new Grid.Position(1, 0), new Grid.Position(3, 1),
    new Grid.Position(3, 3), new Grid.Position(4, 3)
  ]
);

createBatteriesChallenge(
  "step11",
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
  commandReference,
  "",
  8,
  5,
  5,
  new Grid.Position(0, 0),
  Grid.Directions.RIGHT,
  [
    new Grid.Position(0, 4), new Grid.Position(4, 4),
    new Grid.Position(4, 0)
  ],
  [new Grid.Position(3, 0), new Grid.Position(1, 2)]
);

createBatteriesChallenge(
  "step12",
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
  commandReference,
  "",
  13,
  6,
  7,
  new Grid.Position(5, 0),
  Grid.Directions.UP,
  [
    new Grid.Position(4, 0), new Grid.Position(3, 1),
    new Grid.Position(3, 2), new Grid.Position(2, 2),
    new Grid.Position(1, 3), new Grid.Position(1, 4),
    new Grid.Position(4, 4), new Grid.Position(5, 4)
  ],
  [
    new Grid.Position(2, 0), new Grid.Position(2, 1),
    new Grid.Position(4, 2), new Grid.Position(1, 2),
    new Grid.Position(0, 2), new Grid.Position(0, 4),
    new Grid.Position(2, 5), new Grid.Position(3, 6),
    new Grid.Position(4, 6)
  ]
);

createBatteriesChallenge(
  "step13",
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
  commandReference,
  "",
  20,
  6,
  5,
  new Grid.Position(5, 0),
  Grid.Directions.RIGHT,
  [
    new Grid.Position(4, 0), new Grid.Position(2, 0),
    new Grid.Position(1, 0), new Grid.Position(2, 1),
    new Grid.Position(5, 2), new Grid.Position(3, 2),
    new Grid.Position(2, 2), new Grid.Position(5, 3),
    new Grid.Position(4, 3), new Grid.Position(5, 4),
    new Grid.Position(4, 4)
  ],
  [
    new Grid.Position(0, 0), new Grid.Position(1, 2),
    new Grid.Position(3, 1), new Grid.Position(4, 1),
    new Grid.Position(4, 2), new Grid.Position(3, 4)
  ]
);

createBatteriesChallenge(
  "step14",
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
  commandReference,
  "",
  16,
  6,
  6,
  new Grid.Position(5, 0),
  Grid.Directions.UP,
  [
    new Grid.Position(2, 0), new Grid.Position(1, 0),
    new Grid.Position(3, 2), new Grid.Position(2, 2),
    new Grid.Position(0, 3), new Grid.Position(2, 5),
    new Grid.Position(4, 3), new Grid.Position(3, 3),
    new Grid.Position(5, 4), new Grid.Position(5, 5),
    new Grid.Position(4, 5)
  ],
  [
    new Grid.Position(5, 1), new Grid.Position(2, 1),
    new Grid.Position(4, 2), new Grid.Position(1, 2),
    new Grid.Position(5, 3), new Grid.Position(2, 4)
  ]
);

createBatteriesChallenge(
  "step15",
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
  commandReference,
  "",
  16,
  6,
  7,
  new Grid.Position(5, 0),
  Grid.Directions.UP,
  [
    new Grid.Position(3, 0), new Grid.Position(3, 1),
    new Grid.Position(1, 1), new Grid.Position(1, 2),
    new Grid.Position(2, 2), new Grid.Position(4, 4),
    new Grid.Position(4, 5), new Grid.Position(1, 5),
    new Grid.Position(1, 4)
  ],
  [
    new Grid.Position(4, 1), new Grid.Position(0, 3),
    new Grid.Position(1, 6), new Grid.Position(5, 5),
    new Grid.Position(2, 3), new Grid.Position(2, 4)
  ]
);

createBatteriesChallenge(
  "step16",
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
  commandReference,
  "",
  8,
  10,
  10,
  new Grid.Position(0, 0),
  Grid.Directions.RIGHT,
  [
    new Grid.Position(0, 2), new Grid.Position(0, 8),
    new Grid.Position(0, 9), new Grid.Position(4, 9),
    new Grid.Position(9, 9), new Grid.Position(9, 7),
    new Grid.Position(9, 0), new Grid.Position(7, 0),
    new Grid.Position(3, 0), new Grid.Position(2, 0)
  ],
  [
    new Grid.Position(1, 5), new Grid.Position(2, 8),
    new Grid.Position(8, 8), new Grid.Position(3, 7),
    new Grid.Position(7, 4), new Grid.Position(1, 6)
  ]
);

createBatteriesChallenge(
  "step17",
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
  commandReference,
  "",
  20,
  10,
  10,
  new Grid.Position(9, 9),
  Grid.Directions.UP,
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
    new Grid.Position(0, 9), new Grid.Position(0, 8)
  ],
  [
    new Grid.Position(0, 0), new Grid.Position(0, 1),
    new Grid.Position(2, 0), new Grid.Position(3, 1),
    new Grid.Position(3, 0), new Grid.Position(8, 1),
    new Grid.Position(9, 0), new Grid.Position(2, 1)
  ]
);

createBatteriesChallenge(
  "pre-step6a", // id
  <p>
    Temos poucas baterias aqui, podemos pegar todas facilmente.
  </p>,
  <div>
    <p>
      Temos poucas baterias aqui, podemos pegar todas facilmente.
    </p>
  </div>,
  commandReference,
  "", // codigo inicial
  null, // limit
  3, // height
  8, // width
  new Grid.Position(1, 0), // robot position
  Grid.Directions.RIGHT, // robot direction
  [
    new Grid.Position(1, 1), new Grid.Position(1, 2),
    new Grid.Position(1, 3), new Grid.Position(1, 4),
    new Grid.Position(1, 5), new Grid.Position(1, 6),
    new Grid.Position(1, 7)
  ], // good batteries
  [] // bad batteries
);

createBatteriesChallenge(
  "pre-step6b", // id
  <p>
    Dessa vez o código só pode ter quatro caracteres! Acho que utilizar um
    laço pode ajudar!
  </p>,
  <div>
    <p>
      Dessa vez o código só pode ter quatro caracteres! Acho que utilizar um
      laço pode ajudar! Tente <b>{"5{F}"}</b>, por exemplo.
    </p>
  </div>,
  commandReference,
  "", // codigo inicial
  4, // limit
  3, // height
  8, // width
  new Grid.Position(1, 0), // robot position
  Grid.Directions.RIGHT, // robot direction
  [
    new Grid.Position(1, 1), new Grid.Position(1, 2),
    new Grid.Position(1, 3), new Grid.Position(1, 4),
    new Grid.Position(1, 5), new Grid.Position(1, 6),
    new Grid.Position(1, 7)
  ], // good batteries
  [] // bad batteries
);

createBatteriesChallenge(
  "pre-step6c", // id
  <p>
    Pegue todas as baterias boas!
  </p>,
  <div>
    <p>
      Resolva esse problema do jeito que achar melhor.
    </p>
  </div>,
  commandReference,
  "", // codigo inicial
  null, // limit
  3, // height
  8, // width
  new Grid.Position(0, 0), // robot position
  Grid.Directions.RIGHT, // robot direction
  [
    new Grid.Position(0, 1), new Grid.Position(0, 2),
    new Grid.Position(0, 3), new Grid.Position(0, 4),
    new Grid.Position(0, 5), new Grid.Position(0, 6),
    new Grid.Position(0, 7), new Grid.Position(1, 7),
    new Grid.Position(2, 7), new Grid.Position(2, 6),
    new Grid.Position(2, 5), new Grid.Position(2, 4),
    new Grid.Position(2, 3), new Grid.Position(2, 2),
    new Grid.Position(2, 1), new Grid.Position(2, 0),
  ], // good batteries
  [] // bad batteries
);

createBatteriesChallenge(
  "pre-step6d", // id
  <p>
    Pegue todas as baterias boas! Você pode usar laços!
  </p>,
  <div>
    <p>
      Esse problema é bem parecido com o anterior, só que agora você só tem
      14 caracteres para usar! Você pode usar laços!
    </p>
  </div>,
  commandReference,
  "", // codigo inicial
  14, // limit
  3, // height
  8, // width
  new Grid.Position(0, 0), // robot position
  Grid.Directions.RIGHT, // robot direction
  [
    new Grid.Position(0, 1), new Grid.Position(0, 2),
    new Grid.Position(0, 3), new Grid.Position(0, 4),
    new Grid.Position(0, 5), new Grid.Position(0, 6),
    new Grid.Position(0, 7), new Grid.Position(1, 7),
    new Grid.Position(2, 7), new Grid.Position(2, 6),
    new Grid.Position(2, 5), new Grid.Position(2, 4),
    new Grid.Position(2, 3), new Grid.Position(2, 2),
    new Grid.Position(2, 1), new Grid.Position(2, 0),
  ], // good batteries
  [] // bad batteries
);

createBatteriesChallenge(
  "pre-step6e", // id
  <p>
    Vamos ver se consegue resolver esse também!
  </p>,
  <div>
    <p>
      Vamos ver se consegue resolver esse também!
    </p>
  </div>,
  commandReference,
  "", // codigo inicial
  14, // limit
  3, // height
  8, // width
  new Grid.Position(0, 0), // robot position
  Grid.Directions.RIGHT, // robot direction
  [
    new Grid.Position(2, 0),
  ], // good batteries
  [
    new Grid.Position(1, 0), new Grid.Position(1, 1),
    new Grid.Position(1, 2), new Grid.Position(1, 3),
    new Grid.Position(1, 4), new Grid.Position(1, 5),
    new Grid.Position(1, 6),
  ] // bad batteries
);

createBatteriesChallenge(
  "pre-step6f", // id
  <p>
    Esse aqui vai ser bem fácil pra você agora!
  </p>,
  <div>
    <p>
      Esse aqui vai ser bem fácil pra você agora!
    </p>
  </div>,
  commandReference,
  "", // codigo inicial
  14, // limit
  8, // height
  8, // width
  new Grid.Position(0, 0), // robot position
  Grid.Directions.RIGHT, // robot direction
  [
    new Grid.Position(0, 1), new Grid.Position(0, 2),
    new Grid.Position(0, 3), new Grid.Position(0, 4),
    new Grid.Position(0, 5), new Grid.Position(0, 6),
    new Grid.Position(0, 7), new Grid.Position(1, 7),
    new Grid.Position(2, 7), new Grid.Position(3, 7),
    new Grid.Position(4, 7), new Grid.Position(5, 7),
    new Grid.Position(6, 7), new Grid.Position(7, 7),
    new Grid.Position(7, 6), new Grid.Position(7, 5),
    new Grid.Position(7, 4), new Grid.Position(7, 3),
    new Grid.Position(7, 2), new Grid.Position(7, 1),
    new Grid.Position(7, 0),
  ], // good batteries
  [] // bad batteries
);


createBatteriesChallenge(
  "pos-step11a", // id
  <p>
    Resolva esse problema com quantos caracteres você quiser. Já comecei
    o código para você.
  </p>,
  <div>
    <p>
      Resolva esse problema com quantos caracteres você quiser. Já comecei
      o código para você.
    </p>
  </div>,
  commandReference,
  "FDFE\nFDFE\n", // codigo inicial
  null, // limit
  9, // height
  9, // width
  new Grid.Position(8, 0), // robot position
  Grid.Directions.UP, // robot direction
  [
    new Grid.Position(7, 0), new Grid.Position(7, 1),
    new Grid.Position(6, 1), new Grid.Position(6, 2),
    new Grid.Position(5, 2), new Grid.Position(5, 3),
    new Grid.Position(4, 3), new Grid.Position(4, 4),
    new Grid.Position(3, 4), new Grid.Position(3, 5),
    new Grid.Position(2, 5), new Grid.Position(2, 6),
    new Grid.Position(1, 6), new Grid.Position(1, 7),
    new Grid.Position(0, 7), new Grid.Position(0, 8),
  ], // good batteries
  [] // bad batteries
);

createBatteriesChallenge(
  "pos-step11b", // id
  <p>
    Agora só podemos usar 7 caracteres. Mas tem como resolver!
  </p>,
  <div>
    <p>
      Agora só podemos usar 7 caracteres. Mas tem como resolver!
    </p>
  </div>,
  commandReference,
  "", // codigo inicial
  7, // limit
  9, // height
  9, // width
  new Grid.Position(8, 0), // robot position
  Grid.Directions.UP, // robot direction
  [
    new Grid.Position(7, 0), new Grid.Position(7, 1),
    new Grid.Position(6, 1), new Grid.Position(6, 2),
    new Grid.Position(5, 2), new Grid.Position(5, 3),
    new Grid.Position(4, 3), new Grid.Position(4, 4),
    new Grid.Position(3, 4), new Grid.Position(3, 5),
    new Grid.Position(2, 5), new Grid.Position(2, 6),
    new Grid.Position(1, 6), new Grid.Position(1, 7),
    new Grid.Position(0, 7), new Grid.Position(0, 8),
  ], // good batteries
  [] // bad batteries
);

createBatteriesChallenge(
  "pos-step11c", // id
  <p>
    Apenas uma bateria boa aqui. Vai ser fácil!
  </p>,
  <div>
    <p>
      Apenas uma bateria boa aqui. Vai ser fácil!
    </p>
  </div>,
  commandReference,
  "", // codigo inicial
  7, // limit
  6, // height
  6, // width
  new Grid.Position(0, 0), // robot position
  Grid.Directions.RIGHT, // robot direction
  [
    new Grid.Position(5, 5),
  ], // good batteries
  [
    new Grid.Position(0, 2), new Grid.Position(0, 3),
    new Grid.Position(1, 3), new Grid.Position(1, 4),
    new Grid.Position(2, 4), new Grid.Position(2, 5),
    new Grid.Position(3, 5),
    new Grid.Position(1, 0),
    new Grid.Position(2, 0), new Grid.Position(2, 1),
    new Grid.Position(3, 1), new Grid.Position(3, 2),
    new Grid.Position(4, 2), new Grid.Position(4, 3),
    new Grid.Position(5, 3), new Grid.Position(5, 4),
  ] // bad batteries
);

createBatteriesChallenge(
  "pos-step11d", // id
  <p>
    Será que tem como usar a mesma ideia dos passos anteriores?
  </p>,
  <div>
    <p>
      Será que tem como usar a mesma ideia dos passos anteriores?
    </p>
  </div>,
  commandReference,
  "", // codigo inicial
  7, // limit
  8, // height
  8, // width
  new Grid.Position(0, 7), // robot position
  Grid.Directions.LEFT, // robot direction
  [
    new Grid.Position(1, 6), new Grid.Position(2, 5),
    new Grid.Position(3, 4), new Grid.Position(4, 3),
    new Grid.Position(5, 2), new Grid.Position(6, 1),
    new Grid.Position(7, 0),
  ], // good batteries
  [] // bad batteries
);

createBatteriesChallenge(
  "pos-step11e", // id
  <p>
    Agora temos que andar um pouco mais antes de pegar essas baterias.
  </p>,
  <div>
    <p>
      Agora temos que andar um pouco mais antes de pegar essas baterias.
    </p>
  </div>,
  commandReference,
  "", // codigo inicial
  13, // limit
  8, // height
  8, // width
  new Grid.Position(0, 0), // robot position
  Grid.Directions.RIGHT, // robot direction
  [
    new Grid.Position(0, 7),
    new Grid.Position(1, 6), new Grid.Position(2, 5),
    new Grid.Position(3, 4), new Grid.Position(4, 3),
    new Grid.Position(5, 2), new Grid.Position(6, 1),
    new Grid.Position(7, 0),
  ], // good batteries
  [] // bad batteries
);

createBatteriesChallenge(
  "pos-step11f", // id
  <p>
    E aquela última bateria lá? Como pegar?
  </p>,
  <div>
    <p>
      E aquela última bateria lá? Como pegar?
    </p>
  </div>,
  commandReference,
  "", // codigo inicial
  17, // limit
  8, // height
  8, // width
  new Grid.Position(0, 0), // robot position
  Grid.Directions.RIGHT, // robot direction
  [
    new Grid.Position(0, 7),
    new Grid.Position(1, 6), new Grid.Position(2, 5),
    new Grid.Position(3, 4), new Grid.Position(4, 3),
    new Grid.Position(5, 2), new Grid.Position(6, 1),
    new Grid.Position(7, 0), new Grid.Position(7, 7),
  ], // good batteries
  [] // bad batteries
);

createBatteriesChallenge(
  "pos-step11g", // id
  <p>
    Essa vai ser bem legal!
  </p>,
  <div>
    <p>
      Essa vai ser bem legal!
    </p>
  </div>,
  commandReference,
  "", // codigo inicial
  21, // limit
  8, // height
  8, // width
  new Grid.Position(0, 0), // robot position
  Grid.Directions.RIGHT, // robot direction
  [
    new Grid.Position(0, 7),
    new Grid.Position(1, 6), new Grid.Position(2, 5),
    new Grid.Position(3, 4), new Grid.Position(4, 3),
    new Grid.Position(5, 2), new Grid.Position(6, 1),
    new Grid.Position(7, 0), new Grid.Position(7, 7),
    new Grid.Position(6, 6), new Grid.Position(5, 5),
    new Grid.Position(4, 4), new Grid.Position(3, 3),
    new Grid.Position(2, 2), new Grid.Position(1, 1),
  ], // good batteries
  [] // bad batteries
);

createBatteriesChallenge(
  "pre-step12a",
  <p>
    Utilizando laços para criar padrões: Zigue-Zague.
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
  commandReference,
  "",
  9,
  5,
  5,
  new Grid.Position(4, 0),
  Grid.Directions.UP,
  [
    new Grid.Position(3, 0), new Grid.Position(2, 0),
    new Grid.Position(2, 1), new Grid.Position(2, 2),
    new Grid.Position(1, 2), new Grid.Position(0, 2),
    new Grid.Position(0, 3), new Grid.Position(0, 4)
  ],
  []
);

createBatteriesChallenge(
  "pre-step12b",
  <p>
    Utilizando laços para criar padrões: Zigue-Zague.
  </p>,
  <div>
    <p>
      Muito bem! Este robô também pode ser salvo com um zigue-zague. Pense em
      como você pode alterar o código do robô anterior para salvar este robô.
    </p>
  </div>,
  commandReference,
  "",
  9,
  5,
  5,
  new Grid.Position(4, 4),
  Grid.Directions.UP,
  [
    new Grid.Position(3, 4), new Grid.Position(2, 4),
    new Grid.Position(2, 3), new Grid.Position(2, 2),
    new Grid.Position(1, 2), new Grid.Position(0, 2),
    new Grid.Position(0, 1), new Grid.Position(0, 0)
  ],
  []
);

createBatteriesChallenge(
  "pre-step12c",
  <p>
    Utilizando laços para criar padrões: Zigue-Zague.
  </p>,
  <div>
    <p>
      Muito bem! Este robô também pode ser salvo com um zigue-zague. Pense em
      como você pode alterar o código do robô anterior para salvar este robô.
    </p>
  </div>,
  commandReference,
  "",
  9,
  5,
  5,
  new Grid.Position(0, 4),
  Grid.Directions.LEFT,
  [
    new Grid.Position(3, 0), new Grid.Position(2, 0),
    new Grid.Position(2, 1), new Grid.Position(2, 2),
    new Grid.Position(1, 2), new Grid.Position(0, 2),
    new Grid.Position(0, 3), new Grid.Position(4, 0)
  ],
  []
);

createBatteriesChallenge(
  "pre-step12d",
  <p>
    Utilizando laços para criar padrões: Zigue-Zague.
  </p>,
  <div>
    <p>
      Muito bem! Este robô também pode ser salvo com um zigue-zague. Pense em
      como você pode alterar o código do robô anterior para salvar este robô.
    </p>
  </div>,
  commandReference,
  "",
  9,
  5,
  5,
  new Grid.Position(0, 0),
  Grid.Directions.RIGHT,
  [
    new Grid.Position(3, 4), new Grid.Position(2, 4),
    new Grid.Position(2, 3), new Grid.Position(2, 2),
    new Grid.Position(1, 2), new Grid.Position(0, 2),
    new Grid.Position(0, 1), new Grid.Position(4, 4)
  ],
  []
);



createBatteriesChallenge(
  "pre-step12e",
  <p>
    Utilizando laços para criar padrões: Zigue-Zague.
  </p>,
  <div>
    <p>
      Este robô também pode ser salvo utilizando um zigue-zague.
      Você consegue pensar em como escrever um padrão de zigue-zague,
      utilizando laços, para este robô?
    </p>
  </div>,
  commandReference,
  "",
  8,
  6,
  5,
  new Grid.Position(5, 4),
  Grid.Directions.UP,
  [
    new Grid.Position(4, 4),
    new Grid.Position(3, 4), new Grid.Position(3, 3),
    new Grid.Position(2, 3), new Grid.Position(2, 2),
    new Grid.Position(1, 2), new Grid.Position(1, 1),
    new Grid.Position(0, 1), new Grid.Position(0, 0)
  ],
  [
    new Grid.Position(2, 4), new Grid.Position(1, 3),
    new Grid.Position(0, 2),
    new Grid.Position(4, 3), new Grid.Position(3, 2),
    new Grid.Position(2, 1), new Grid.Position(1, 0)
  ]
);

createBatteriesChallenge(
  "pre-step12f",
  <p>
    Utilizando laços para criar padrões: Zigue-Zague.
  </p>,
  <div>
    <p>
      Muito bem! Este robô pode ser salvo com um zigue-zague, assim como o
      robô anterior. O que precisa mudar?
    </p>
  </div>,
  commandReference,
  "",
  8,
  6,
  5,
  new Grid.Position(5, 0),
  Grid.Directions.UP,
  [
    new Grid.Position(4, 0),
    new Grid.Position(3, 0), new Grid.Position(3, 1),
    new Grid.Position(2, 1), new Grid.Position(2, 2),
    new Grid.Position(1, 2), new Grid.Position(1, 3),
    new Grid.Position(0, 3), new Grid.Position(0, 4)
  ],
  [
    new Grid.Position(2, 0), new Grid.Position(1, 1),
    new Grid.Position(0, 2),
    new Grid.Position(4, 1), new Grid.Position(3, 2),
    new Grid.Position(2, 3), new Grid.Position(1, 4)
  ]
);
