/*
 * Component that shows the instructions of a lesson and
 * allows the student to advance or go back.
 */

var React = require("react");

var InstructionPane = React.createClass({
  render: function() {
    return <div style={{backgroundColor: "#aaaaff", width: "100%",
                        height: "100%"}}>
              <p style={{margin: "0"}}>Instructions</p>
           </div>;
  },
});

module.exports = InstructionPane;
