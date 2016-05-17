/*
 * Component that shows the instructions of a lesson and
 * allows the student to advance or go back.
 */

var React = require("react");

var InstructionPane = React.createClass({
  render: function() {
    var advanceButton = <span/>;

    if (this.props.canAdvance) {
      advanceButton = <input type="button"
                             value="Next"
                             onClick={this.props.onAdvance} />;
    }

    return <div style={{backgroundColor: "#eeeeff", width: "100%",
                        height: "100%"}}>
              <p style={{margin: "0"}}>{this.props.content}</p>
              {advanceButton}
           </div>;
  },
});

module.exports = InstructionPane;
