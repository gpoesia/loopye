/*
 * Visualize all steps in a lesson.
 */

var React = require("react");
var T = require("../util/translate").T;
var ProgressManager = require("../backend/progress_manager");

var LessonOverview = React.createClass({

  render: function() {
    var lesson = this.props.lesson;
    var course = this.props.course;
    var progressManager = this.props.progressManager;

    var children = [];

    for (var i = 0; i < lesson.getNumberOfChallenges(); i++) {
      var challenge = lesson.getChallenge(i);
      var status = progressManager.getChallengeStatus(course, lesson, challenge);
      var color = "green";

      switch (status) {
      case ProgressManager.ChallengeStatus.SOLVED:
        color = "green";
        break;
      case ProgressManager.ChallengeStatus.UNLOCKED:
        color = "pink"
        break;
      case ProgressManager.ChallengeStatus.LOCKED:
        color = "grey"
        break;
      }

      var onClick = (status === ProgressManager.ChallengeStatus.LOCKED
                     ? null
                     : this.props.onChallengeSelected.bind(null, i));

      var challengeA = <a className={"btn-floating btn waves-effect waves-light " + color}
                        key={i} onClick={onClick}>{i + 1}</a>;
      children.push(challengeA);
    }

    return (
      <div className="row">
        <div className="col s12">
          <div className="card horizontal">
            <div className="card-image">
              <img src={lesson.getThumbnail()} width={"300px"}/>
            </div>
            <div className="card-stacked">
              <div className="card-content">
                  <h5>{lesson.getLessonName()}</h5>
                  <p>{lesson.getLessonDescription()}</p>
              </div>
              <div className="card-action">
                <h6>Níveis:</h6>
                <div>{children}</div>
              </div>
              <div className="card-action">
                  <a className="waves-effect waves-light btn green"
                     onClick={this.props.onLessonSelected}>
                     <i className="material-icons left">play_arrow</i>
                     {T("Jogar")}
                  </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LessonOverview;
