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
  _callOnChange: function(callback) {
    if (callback) {
      return function(event) {
        return callback(event.target.value);
      };
    }
  },
  render: function() {
    return <textarea style={this._styles.editor}
                     onChange={this._callOnChange(this.props.onChange)}
                     value={this.props.code} />
  },
});

module.exports = CodeEditor;
