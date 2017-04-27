/*
 * Component that shows the instructions of a lesson and
 * allows the student to advance or go back.
 */

var React = require("react");

var InstructionPane = React.createClass({
  styles: {
    instructionBox: {
      backgroundColor: "#CEE3EA",
      width: "100%",
      padding: "20px",
      marginTop: "20px",
      borderRadius: "10px",
      lineHeight: "150%",
    },
  },
  render: function() {
    return <div style={this.styles.instructionBox}>
              {this.props.content}
           </div>;
  },
});

module.exports = InstructionPane;
