/*
 * Named constants.
 */

module.exports = {
  PLAY_ICON_URL: "/static/images/icons/play.png",
  RESET_ICON_URL: "/static/images/icons/reset.png",
  ADVANCE_ICON_URL: "/static/images/icons/advance.png",
  HELP_ICON_URL: "/static/images/icons/help.png",

  RUN_VIEW_SQUARE_DIMENSION: 1000,

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
  },
};
