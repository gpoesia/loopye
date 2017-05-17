/*
 * "Second mission" lesson: collect all the good batteries.
 */

require("../game/challenges/batteries_challenges");
var T = require("../util/translate").T;
var Lesson = require("./lesson");
var Game = require("../game/game");

var secondMissionLesson = new Lesson.Lesson(
  "second-mission",
  T("Pegar baterias"),
  T("Nossos robôs estão precisando de energia para funcionar. Ajude-os a coletar todas as baterias."),
  [
    Game.findChallenge("batteries", "step01"),
    Game.findChallenge("batteries", "step02"),
    Game.findChallenge("batteries", "step03"),
    Game.findChallenge("batteries", "step04"),
    Game.findChallenge("batteries", "step05"),
    Game.findChallenge("batteries", "pre-step6a"),
    Game.findChallenge("batteries", "pre-step6b"),
    Game.findChallenge("batteries", "pre-step6c"),
    Game.findChallenge("batteries", "pre-step6d"),
    Game.findChallenge("batteries", "pre-step6e"),
    Game.findChallenge("batteries", "pre-step6f"),
    Game.findChallenge("batteries", "step06"),
    Game.findChallenge("batteries", "step07"),
    Game.findChallenge("batteries", "step08"),
    Game.findChallenge("batteries", "step09"),
    Game.findChallenge("batteries", "step10"),
    Game.findChallenge("batteries", "step11"),
    Game.findChallenge("batteries", "pos-step11a"),
    Game.findChallenge("batteries", "pos-step11b"),
    Game.findChallenge("batteries", "pos-step11c"),
    Game.findChallenge("batteries", "pos-step11d"),
    Game.findChallenge("batteries", "pos-step11e"),
    Game.findChallenge("batteries", "pos-step11f"),
    Game.findChallenge("batteries", "pos-step11g"),
    Game.findChallenge("batteries", "pre-step12a"),
    Game.findChallenge("batteries", "pre-step12b"),
    Game.findChallenge("batteries", "pre-step12c"),
    Game.findChallenge("batteries", "pre-step12d"),
    Game.findChallenge("batteries", "pre-step12e"),
    Game.findChallenge("batteries", "pre-step12f"),
    Game.findChallenge("batteries", "step12"),
    Game.findChallenge("batteries", "step13"),
    Game.findChallenge("batteries", "step14"),
    Game.findChallenge("batteries", "step15"),
    Game.findChallenge("batteries", "step16"),
    Game.findChallenge("batteries", "step17"),
  ],
  "/static/images/thumbs/batteries.png"
);

Lesson.registerLesson(secondMissionLesson);
module.exports = secondMissionLesson;
