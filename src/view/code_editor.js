/*
 * Component that contains the code editor.
 */

var React = require("react");

var CodeEditor = React.createClass({
  render: function() {
    return <div style={{backgroundColor: "#ffffaa", width: "100%",
                        height: "100%"}}>
              <p style={{margin: "0"}}>Code editor</p>
           </div>;
  },
});

module.exports = CodeEditor;
