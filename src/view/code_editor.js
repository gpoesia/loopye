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

function buildCodeEditorParameters(keywords, sensors, actions, onChange, initialCode,
                                   highlightingRanges) {
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
    highlightingRanges: highlightingRanges,
    onChange: onChange,
    initialCode: initialCode,
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
      highlightingRanges: [],
      codeLength: this._length(this.props.initialCode.length),
    };
  },
  focus: function() {
      if (this.refs.base)
          this.refs.base.focus();
  },
  _callOnChange: function(callback) {
    return function(code) {
      var length = this._length(code);
      this.setState({codeLength: length});
      if (callback) {
        return callback(code, length);
      }
    }.bind(this);
  },

  highlightRanges: function(ranges) {
    this.setState({highlightRanges: ranges});
  },

  render: function() {
    var limitText = null;
    var codeLength = this.state.codeLength;

    if (!!this.props.limit) {
      var color = (codeLength > this.props.limit) ? "red" : "black";
      limitText =
        <p style={{color: color}}>
          Tamanho do código: {codeLength}/{this.props.limit}
        </p>;
    } else {
      limitText = <span></span>;
    }

    return <div style={this._styles.containingDiv}>
             {limitText}
             <CodeEditorBase parameters={buildCodeEditorParameters(
                                           this.props.keywords,
                                           this.props.sensors,
                                           this.props.actions,
                                           this._callOnChange(this.props.onChange),
                                           this.props.initialCode,
                                           this.state.highlightRanges
                                         )}
                             ref="base"
               />
           </div>;
  },

  componentDidUpdate: function() {
    if (this.refs.base) {
      this.refs.base.forceUpdate();
    }
  },
});

module.exports = CodeEditor;
