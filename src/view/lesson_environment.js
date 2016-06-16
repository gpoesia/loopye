/*
 * Graphical environment in which lessons are played.
 */

var React = require("react");
var ButtonBar = require("./button_bar.js");
var CodeEditor = require("./code_editor.js");
var InstructionPane = require("./instruction_pane.js");
var RunView = require("./run_view.js");

var LessonEnvironment = React.createClass({
  styles: {
    instructionPane: {
      width: "30%",
      height: "100%",
      float: "left",
      margin: "0",
    },
    actionSide: {
      width: "70%",
      height: "100%",
      float: "right",
      margin: "0",
    },
    editor: {
      width: "100%",
      height: "50%",
      margin: "0",
    },
    buttonBar: {
      width: "100%",
      height: "5%",
      margin: "0",
    },
    runView: {
      width: "100%",
      height: "45%",
      margin: "0",
    },
  },

  getInitialState: function() {
    return {
      sourceCode: "",
      currentStep: 0,
    };
  },

  _updateCode: function(code) {
    this.setState({sourceCode: code});
  },

  _startStep: function(step) {
    this.setState({
      currentStep: step,
      sourceCode: this.props.lesson.getStep(step).getInitialSourceCode(),
    });
  },

  _advanceStep: function() {
    this._startStep(Math.min(this.props.lesson.getNumberOfSteps() - 1,
                             this.state.currentStep + 1));
  },

  _previousStep: function() {
    this._startStep(Math.max(0, this.state.currentStep - 1));
  },

  _playCode: function() {
    var currentStep = this.props.lesson.getStep(this.state.currentStep);
    var animator = currentStep.play(this.state.sourceCode);
    this.setState({animator: animator});
  },

  render: function() {
    var currentStep = this.props.lesson.getStep(this.state.currentStep);

    return <div style={{width: "100%", height: "100%"}}>
             <div style={this.styles.instructionPane}>
               <InstructionPane content={currentStep.getContent()}
                                canAdvance={currentStep.canAdvance()}
                                onAdvance={this._advanceStep} />
             </div>
             <div style={this.styles.actionSide}>
               <div style={this.styles.editor}>
                 <CodeEditor code={this.state.sourceCode}
                             onChange={this._updateCode} />
               </div>
               <div style={this.styles.buttonBar}>
                 <ButtonBar onPlay={this._playCode} />
               </div>
               <div style={this.styles.runView}>
                 <RunView animator={this.state.animator} />
               </div>
             </div>
           </div>;
  },
});

module.exports = LessonEnvironment;
