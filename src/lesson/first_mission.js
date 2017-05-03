/*
 * "First mission" lesson: save robots from falling asteroids.
 */

require("../game/challenges/asteroids_challenges");
var T = require("../util/translate").T;
var Lesson = require("./lesson");
var Game = require("../game/game");

var firstMissionLesson = new Lesson.Lesson(
  "first-mission",
  T("Chuva de meteoros"),
  T("Nossos robôs estão sendo atacados por uma chuva de meteoros! Ajude-nos a salvá-los, rápido!"),
  [
    Game.findChallenge("asteroids", "greetings"),
    Game.findChallenge("asteroids", "first-right-movement"),
    Game.findChallenge("asteroids", "fix-simple"),
    Game.findChallenge("asteroids", "many-paths"),
    Game.findChallenge("asteroids", "single-path-long"),
    Game.findChallenge("asteroids", "single-path-medium"),
    Game.findChallenge("asteroids", "single-command"),
    Game.findChallenge("asteroids", "no-safe-region"),
    Game.findChallenge("asteroids", "safe-region"),
    Game.findChallenge("asteroids", "long-trap"),
    Game.findChallenge("asteroids2", "example"),
    Game.findChallenge("asteroids2", "easy"),
    Game.findChallenge("asteroids2", "medium"),
    Game.findChallenge("asteroids2", "hard"),
  ],
  "/static/images/thumbs/asteroids.png"
);

Lesson.registerLesson(firstMissionLesson);
module.exports = firstMissionLesson;
