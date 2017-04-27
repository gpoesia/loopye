/*
 * Visualize all steps in a lesson.
 */

var React = require("react");
var T = require("../util/translate").T;

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

    challenge: {
      border: '1px solid black',
    },
  },

  render: function() {
    var lesson = this.props.lesson;

    var children = [];

    for (var i = 0; i < lesson.getNumberOfChallenges(); i++) {
      children.push(<span key={i} style={this._styles.challenge}
                          onClick={this.props.onChallengeSelected.bind(null, i)}>{i + 1}</span>);
    }

    return (
        <div style={this._styles.container}>
          <p style={this._styles.lessonName}>
            {lesson.getLessonName()}
          </p>
          <p style={this._styles.lessonDescription}>
            {lesson.getLessonDescription()}
          </p>
          {children}
          <br/>
          <button style={this._styles.button}
                  onClick={this.props.onLessonSelected}>{T("Jogar")}</button>
        </div>
    );
  }
});

module.exports = LessonOverview;
