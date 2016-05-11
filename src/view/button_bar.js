/*
 * Component that contains the button to interact with the code:
 * check for errors, run, execute one instruction, etc.
 */

var React = require("react");

var ButtonBar = React.createClass({
  render: function() {
    return <div style={{backgroundColor: "#aaffaa", width: "100%",
                        height: "100%"}}>
              <p style={{margin: "0"}}>Button bar</p>
           </div>;
  },
});

module.exports = ButtonBar;
