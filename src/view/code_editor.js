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
      border: "1px solid #999999",
      resize: "none",
      padding: "10px",
      borderRadius: "5px",
    },
    containingDiv: {
      width: "100%",
      height: "100%",
    },
  },
  _length: function(code) {
    var l = 0;
    for (var i = 0; i < code.length; i++) {
      l += code[i].trim().length;
    }
    return l;
  },
  _callOnChange: function(callback) {
    var limit = this.props.limit;
    var length = this._length;

    return function(event) {
      if (!!limit &&
          length(event.target.value) > limit) {
        event.preventDefault();
        return;
      }
      if (callback) {
        return callback(event.target.value);
      };
    };
  },
  render: function() {
    var limit_text = null;
    var code_length = this._length(this.props.code);

    if (!!this.props.limit) {
      var color = (code_length == this.props.limit) ? "red" : "black";
      limit_text =
        <p style={{color: color}}>
          Tamanho do código: {this._length(this.props.code)}/{this.props.limit}
        </p>;
    } else {
      limit_text = <span></span>;
    }

    return <div style={this._styles.containingDiv}>
             {limit_text}
             <textarea style={this._styles.editor}
                       onChange={this._callOnChange(this.props.onChange)}
                       value={this.props.code} />
           </div>;
  },
});

module.exports = CodeEditor;
