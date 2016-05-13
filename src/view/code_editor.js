/*
 * Component that contains the code editor.
 * TODO find a code editor component that works.
 */

var React = require("react");

var CodeEditor = React.createClass({
  _styles: {
    editor: {
      width: "100%",
      height: "100%",
      fontSize: "3em",
      margin: "0px",
      border: "0px",
      resize: "none",
    },
  },
  render: function() {
    var editor = <textarea ref="editor" style={this._styles.editor}>
                 </textarea>;
    return editor;
  },
});

module.exports = CodeEditor;
