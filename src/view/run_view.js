/*
 * Graphically shows the results of a run of the user's code.
 */

var React = require("react");

var RunView = React.createClass({
  render: function() {
    return <div style={{backgroundColor: "#ffaaff", width: "100%",
                        height: "100%"}}>
              <p style={{margin: "0"}}>Results</p>
           </div>;
  },
});

module.exports = RunView;
