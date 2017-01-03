/*
 * Component that contains the code editor.
 */

var React = require("react");
var CodeEditorBase = require("codeeditor");

var DEFAULT_KEYWORDS = [
  "senao",
  "se",
  "enquanto",
  "[0-9]+",
];

var DEFAULT_SENSORS = [
  "solido",
  "ferro",
  "material",
  "maq",
  "eng",
];

var DEFAULT_ACTIONS = [
  "[A-Z]",
];

function joinRegexes(regexes) {
  return regexes.join("|");
}

function buildCodeEditorParameters(keywords, sensors, actions, onChange, code) {
  keywords = keywords || DEFAULT_KEYWORDS;
  sensors = sensors || DEFAULT_SENSORS;
  actions = actions || DEFAULT_ACTIONS;

  return {
    style: {
      width: "100%",
      height: "100%",
      fontSize: "2em",
      margin: "0px",
      border: "1px solid #999999",
      padding: "10px",
      borderRadius: "5px",
      fontFamily: "monospace",
    },
    autoIndent: true,
    autoCloseBlocks: true,
    highlightingRules: [
      // Keywords.
      {
        regex: joinRegexes(keywords),
        style: {fontWeight: "bold", color: "#000099"},
      },
      // Sensors.
      {
        regex: joinRegexes(sensors),
        style: {textDecoration: "underline", color: "#009900"},
      },
      // Actions.
      {
        regex: joinRegexes(actions),
        style: {fontStyle: "italic"},
      },
    ],
    onChange: onChange,
    initialCode: code,
  };
}

var CodeEditor = React.createClass({
  _styles: {
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
  getInitialState: function() {
    return {
      code: this.props.code || "",
    };
  },
  focus: function() {
      if (this.refs.base)
          this.refs.base.focus();
  },
  _callOnChange: function(callback) {
    var limit = this.props.limit;
    var length = this._length;

    return function(code) {
      if (!!limit && length(code) > limit) {
        this.forceUpdate();
      } else if (callback) {
        this.setState({code: code});
        return callback(code);
      };
    }.bind(this);
  },

  render: function() {
    var limit_text = null;
    var code_length = this._length(this.state.code);

    if (!!this.props.limit) {
      var color = (code_length == this.props.limit) ? "red" : "black";
      limit_text =
        <p style={{color: color}}>
          Tamanho do código: {this._length(this.state.code)}/{this.props.limit}
        </p>;
    } else {
      limit_text = <span></span>;
    }

    return <div style={this._styles.containingDiv}>
             {limit_text}
             <CodeEditorBase parameters={buildCodeEditorParameters(
                                           this.props.keywords,
                                           this.props.sensors,
                                           this.props.actions,
                                           this._callOnChange(this.props.onChange),
                                           this.state.code)}
                             ref="base"
               />
           </div>;
  },
});

module.exports = CodeEditor;
