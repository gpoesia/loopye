/*
 * Visualize all steps in a lesson.
 */

var React = require("react");
var T = require("../util/translate").T;
var ProgressManager = require("../backend/progress_manager");

var LessonOverview = React.createClass({
  _styles: {
    container: {
      margin: "1em",
      padding: "1em",
      border: "1px solid black",
    },

    lessonName: {
      fontSize: "2em",
    },

    lessonDescription: {
      fontStyle: "italic",
      fontWeight: "lighter",
      marginTop: "0.5em",
    },

    step: {
      border: "1px solid black",
      margin: 0,
    },

    button: {
      margin: "0.5em 0 0.5em 0",
    },

    solvedChallenge: {
      border: "1px solid black",
      padding: "0.25em",
      backgroundColor: "#AAFFAA",
    },

    unlockedChallenge: {
      border: "1px solid black",
      padding: "0.25em",
      backgroundColor: "white",
    },

    lockedChallenge: {
      border: "1px solid black",
      padding: "0.25em",
      color: "#777777",
      fontWeight: "lighter",
    },
  },

  render: function() {
    var lesson = this.props.lesson;
    var course = this.props.course;
    var progressManager = this.props.progressManager;

    var children = [];

    for (var i = 0; i < lesson.getNumberOfChallenges(); i++) {
      var challenge = lesson.getChallenge(i);
      var status = progressManager.getChallengeStatus(course, lesson, challenge);

      var style = {};

      switch (status) {
      case ProgressManager.ChallengeStatus.SOLVED:
        style = this._styles.solvedChallenge;
        break;

      case ProgressManager.ChallengeStatus.UNLOCKED:
        style = this._styles.unlockedChallenge;
        break;

      case ProgressManager.ChallengeStatus.LOCKED:
        style = this._styles.lockedChallenge;
        break;
      }

      var onClick = (status === ProgressManager.ChallengeStatus.LOCKED
                     ? null
                     : this.props.onChallengeSelected.bind(null, i));

      var challengeSpan = <span key={i} style={style} onClick={onClick}>{i + 1}</span>;
      children.push(challengeSpan);
    }

    return (
        <div style={this._styles.container}>
          <p style={this._styles.lessonName}>
            {lesson.getLessonName()}
          </p>
          <p style={this._styles.lessonDescription}>
            {lesson.getLessonDescription()}
          </p>
          <br/>
          <br/>
          {children}
          <br/>
          <br/>
          <button style={this._styles.button}
                  onClick={this.props.onLessonSelected}>{T("Jogar")}</button>
        </div>
    );
  }
});

module.exports = LessonOverview;
