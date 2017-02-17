/*
 * Named constants.
 */

var React = require("react");

module.exports = {
  PLAY_ICON_URL: "/static/images/icons/play.png",
  RESET_ICON_URL: "/static/images/icons/reset.png",
  ADVANCE_ICON_URL: "/static/images/icons/advance.png",
  HELP_ICON_URL: "/static/images/icons/help.png",

  RUN_VIEW_SQUARE_DIMENSION: 1000,

  MAX_LOOP_TRIPS: 20,
  SemanticAnalysisErrors: {
    TOO_MANY_LOOP_TRIPS: "O seu laço tem uma repetição muito grande. O seu robô vai ficar andando para sempre!",
  },

  Lesson01: {
    FAILURE_MESSAGE_HIT_BY_ASTEROID: "Que pena! O robô foi atingido! Tente novamente.",
    FAILURE_MESSAGE_LEFT_GRID: "Oh, o robô saiu da área de controle e ficou perdido! Ajude-o novamente.",
    SUCCESS_MESSAGE: "Muito bem! Mais um robô a salvo! :)",
  },

  Lesson02: {
    SUCCESS_MESSAGE: "Muito bem! Robô alimentado com sucesso :)",
    FAILURE_MESSAGE_LEFT_GRID: "Oh, o robô saiu da área de controle e ficou perdido! Ajude-o novamente.",
    FAILURE_MESSAGE_HIT_LEAKING_BATTERY: "Ops, o robô pegou uma bateria vencida! Nada bom.... Tente novamente!",
    FAILURE_MESSAGE_LEFT_BATTERIES_BEHIND: "O robô sobreviveu, mas faltaram baterias para serem coletadas. Vamos lá, você consegue pegar todas!",
  },

  Lesson03: {
    SUCCESS_MESSAGE: "É isso aí! Nossa base está cada vez melhor.",
    LEFT_GRID: "Oh não, o robô saiu da área de controle e ficou perdido! Ajude-o novamente.",
    HIT_MACHINE: "O robô colidiu com uma máquina e ela se quebrou! Tente novamente.",
    BROKE_COMPONENT: "O robô passou por cima de uma peça e ela se quebrou! Tente novamente.",
    NO_COMPONENT_TO_GET: "O robô tentou pegar uma peça, mas não havia nenhuma...",
    NO_COMPONENT_TO_PUT: "O robô tentou colocar uma peça na máquina, mas ele não tinha peças em mãos...",
    NO_MACHINE_TO_PUT_COMPONENT_IN: "O robô tentou colocar uma peça, mas não havia uma máquina próxima.",
    CANNOT_HOLD_TWO_COMPONENTS: "O robô tentou pegar uma peça do chão, mas ele só pode carregar uma de cada vez...",
    MISSION_UNFINISHED: "O robô sobreviveu, mas não completou sua missão. Tente novamente.",
    DID_NOT_USE_CONDITIONALS: "O seu código deve usar condicionais neste nível (por exemplo, eng?{G} é um código com um condicional). Leia as instruções e veja a referência de comandos para entender como fazer.",
  },

  Lesson04: {
    IRON_CODE: "IRON",
    GLASS_CODE: "GLASS",
    FUEL_CODE: "FUEL",
    SHIP_HEAD_CODE: "SHIP_HEAD",
    SHIP_BODY_CODE: "SHIP_BODY",
    SHIP_TAIL_CODE: "SHIP_TAIL",
    SUCCESS_MESSAGE: "É isso aí! Nossa nave está quase pronta!",
    MOVED_OUT_OF_LIMITS: "Oh não, o braço mecânico saiu da área de controle e se quebrou! Tente novamente.",
    COLLECTED_FROM_EMPTY_SOURCE: "O braço mecânico tentou coletar de uma fonte vazia. Tente novamente.",
    COLLECTED_FROM_NO_SOURCE: "O braço mecânico tentou coletar neste local, mas não existe uma fonte aqui. Tente novamente.",
    COLLECTED_WHILE_HOLDING_ITEM: "O braço mecânico tentou coletar material nesse local, mas ele só pode transportar um material por vez.",
    DEPOSITED_ON_INVALID_LOCATION: "O braço mecânico tentou depositar material em uma posição que não contém nenhum depósito.",
    NOTHING_TO_DEPOSIT: "O braço mecânico está vazio, não é possível depositar. Tente novamente.",
    ITEM_TYPE_NOT_ACCEPTED: "O depósito em que o braço mecânico tentou depositar não aceita materiais desse tipo. Encontre o depósito correto para este material.",
    CAPACITY_EXCEEDED: "O depósito está cheio! Certifique-se de não estourar a capacidade de nenhum depósito!",
    INVALID_DEPOSIT_POSITION: "O braço mecânico tentou depositar material em uma posição que não contém nenhum depósito.",
    MISSION_UNFINISHED: "Parece que ainda restaram tarefas a serem feitas. Tente novamente.",
  },

  References: {
    WAIT: <p> <b>A</b>: aguardar </p>,
    MOVE_LEFT: <p> <b>E</b>: mover o robô para a esquerda </p>,
    MOVE_RIGHT: <p> <b>D</b>: mover o robô para a direita </p>,
    MOVE_FORWARD: <p> <b>F</b>: mover o robô para frente </p>,
    TURN_LEFT: <p> <b>E</b>: girar o robô para a esquerda </p>,
    TURN_RIGHT: <p> <b>D</b>: girar o robô para a direita </p>,
    PUT_COMPONENT: <p> <b>C</b>: colocar engrenagem na máquina </p>,
    GET_COMPONENT: <p> <b>P</b>: pegar engrenagem </p>,
    COMPONENT_SENSOR: <p> <b>se eng {"{ }"}</b>: fazer o que está entre chaves apenas se houver uma engrenagem à frente </p>,
    MACHINE_SENSOR: <p> <b>se maq {"{ }"}</b>: fazer o que está entre  chaves apenas se houver uma máquina à frente </p>,
    MOVE_ARM_LEFT: <p> <b>E</b>: mover o braço robótico para a esquerda </p>,
    MOVE_ARM_RIGHT: <p> <b>D</b>: mover o braço robótico para a direita </p>,
    GET_MATERIAL: <p> <b>P</b>: pegar o material que estiver à frente do braço robótico </p>,
    PUT_MATERIAL: <p> <b>C</b>: colocar o material que o braço robótico estiver segurando </p>,
    IRON_SENSOR: <p> <b>se ferro {"{ }"}</b>: fazer o que está entre chaves apenas se houver ferro à frente </p>,
    SOLID_SENSOR: <p> <b>se solido {"{ }"}</b>: fazer o que está entre chaves apenas se houver algo sólido à frente </p>,
  },
};
