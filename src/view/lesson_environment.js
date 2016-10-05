/*
 * Graphical environment in which lessons are played.
 */

var React = require("react");
var ButtonBar = require("./button_bar.js");
var CodeEditor = require("./code_editor.js");
var InstructionPane = require("./instruction_pane.js");
var RunView = require("./run_view.js");
var MessagePane = require("./message_pane.js");
var ResourceLoader = require("../util/resource_loader");
var Popup = require("react-popup").default;
var Sidebar = require('react-sidebar').default;

var LessonEnvironment = React.createClass({
  styles: {
    instructionPane: {
      width: "100%",
      height: "20%",
      margin: "0",
    },
    actionSide: {
      width: "70%",
      height: "100%",
      float: "right",
      margin: "0",
    },
    editor: {
      float: "left",
      width: "25%",
      height: "100%",
      margin: "0px",
    },
    buttonBar: {
      width: "100%",
      height: "5%",
      margin: "0",
    },
    runView: {
      width: "100%",
      height: "75%",
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
    // Before the first rendering, we don't have refs.
    if (this.refs.exercise_messages !== undefined) {
      this.refs.exercise_messages.clear();
      this.refs.code_messages.clear();
    }

    this.setState({
        currentStep: step,
        sourceCode: this.props.lesson.getStep(step).getInitialSourceCode(),
      },
      this._reset);

    this._showInstructions(step);
  },

  _advanceStep: function() {
    this._startStep(Math.min(this.props.lesson.getNumberOfSteps() - 1,
                             this.state.currentStep + 1));
  },

  _previousStep: function() {
    this._startStep(Math.max(0, this.state.currentStep - 1));
  },

  _playCode: function() {
    this.refs.exercise_messages.clear();
    this.refs.code_messages.clear();

    var currentStep = this.props.lesson.getStep(this.state.currentStep);
    var result = currentStep.play(this.state.sourceCode);

    if (!!result.compilation_errors) {
      result.compilation_errors.map(this.refs.code_messages.addError);
    } else {
      var animator = result.animator;
      var runtime_errors = result.runtime_errors;
      var exercise_messages = this.refs.exercise_messages;

      animator.start();

      if (Array.isArray(runtime_errors) && runtime_errors.length) {
        animator.onStop(function() {
          runtime_errors.map(exercise_messages.addError);
        });
      } else {
        var forceUpdate = this.forceUpdate.bind(this);
        animator.onStop(function() {
          exercise_messages.addSuccess(currentStep.getSuccessMessage());
          forceUpdate();
        });
      }

      animator.play(this.refs.run_view.getCanvas());
    }
  },

  _reset: function() {
    var currentStep = this.props.lesson.getStep(this.state.currentStep);
    currentStep.reset(this.refs.run_view.getCanvas());
  },

  _showInstructions: function(step) {
    Popup.create({
      title: "Instruções",
      content: (this.props.lesson.getStep(step || this.state.currentStep)
                .getInstructions()),
      buttons: {
        right: ["ok"],
      },
    });
  },

  componentWillMount: function() {
    this._startStep(0);
  },

  render: function() {
    var currentStep = this.props.lesson.getStep(this.state.currentStep);

    return <Sidebar sidebar={currentStep.getCommandReference()}
                    docked={true}
                    pullRight={true}>
             <div style={{width: "100%", height: "95%"}} ref="containerDiv">
               <div style={this.styles.editor}>
                 <MessagePane ref="code_messages" />
                 <CodeEditor code={this.state.sourceCode}
                             onChange={this._updateCode}
                             limit={currentStep.getCodeSizeLimit()} />
               </div>
               <div style={this.styles.actionSide}>
                 <div style={this.styles.instructionPane}>
                   <MessagePane ref="exercise_messages" />
                   <InstructionPane content={currentStep.getShortInstructions()} />
                 </div>
                 <div style={this.styles.buttonBar}>
                   <ButtonBar onPlay={this._playCode}
                              onReset={this._reset}
                              onAdvance={this._advanceStep}
                              onHelp={this._showInstructions.bind(this, null)}
                              advanceEnabled={currentStep.canAdvance()} />
                 </div>
                 <div style={this.styles.runView}>
                   <RunView ref="run_view" />
                 </div>
               </div>
             </div>
           </Sidebar>;
  },

  componentDidMount: function() {
    this._reset();

    // "Cheat code" for quickly advancing steps: Ctrl + "9"
    var advanceStep = this._advanceStep;
    this.refs.containerDiv.onkeyup = function(event) {
      if (!!event.ctrlKey && String.fromCharCode(event.keyCode) === "9") {
        advanceStep();
      }
    };
  },
});

LessonEnvironment.populateResourceLoader = function() {
  ButtonBar.populateResourceLoader();
}

module.exports = LessonEnvironment;
