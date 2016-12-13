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
var CommandReferenceSidebar = require('./command_reference_sidebar.js');

var LessonEnvironment = React.createClass({
  styles: {
    container: {
      width: "100%",
      height: "100%",
      background: "#FFFFFF",
    },
    leftPanel: {
      float: "left",
      width: "540px",
      height: "100%",
      padding: "20px",
    },
    gameWindow: {
      width: "500px",
      height: "500px",
    },
    centerPanel: {
      position: "relative",
      marginLeft: "540px",
      marginRight: "50px",
      height: "100%",
      padding: "20px 20px 90px 0",
    },
    centerPanelDocked: {
      position: "relative",
      marginLeft: "540px",
      height: "100%",
      padding: "20px 20px 90px 0",
    },
    codeEditor: {
      height: "100%",
    },
    buttonBar: {
      position: "absolute",
      bottom: "20px",
      height: "50px",
      width: "100%",
      paddingRight: "20px",
    },
    commandsButton: {
      width: "50px",
      textAlign: "center",
      position: "absolute",
      top: "20px",
      right: "0",
      backgroundColor: "#03a9f4",
      color: "#FFFFFF",
      padding: "10px",
      cursor: "pointer",
      borderRadius: "5px 0 0 5px",
    },
  },

  getInitialState: function() {
    return {
      sourceCode: "",
      currentStep: this.props.initialStep,
      docked: true,
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
      this.refs.code_messages.setErrors(result.compilation_errors);
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
    this._startStep(this.state.currentStep);
  },

  _closeSidebar: function() {
    this.setState({docked: false});
  },

  _openSidebar: function() {
    this.setState({docked: true});
  },

  showButton: function() {
    if (!this.state.docked) {
      return  <div style={this.styles.commandsButton}
                   onClick={this._openSidebar}>
                C<br/>
                O<br/>
                M<br/>
                A<br/>
                N<br/>
                D<br/>
                O<br/>
                S
              </div>;
    }
    return <div></div>;
  },

  render: function() {
    var currentStep = this.props.lesson.getStep(this.state.currentStep);

    var commandReferenceSidebar = <CommandReferenceSidebar
          onClose={this._closeSidebar}
          content={currentStep.getCommandReference()} />;

    return  <Sidebar sidebar={commandReferenceSidebar}
                    docked={this.state.docked}
                    pullRight={true}
                    touch={false}>
              <div style={this.styles.container} ref="containerDiv">
                <div style={this.styles.leftPanel}>
                  <div style={this.styles.gameWindow}>
                    <RunView ref="run_view" />
                  </div>
                  <MessagePane ref="exercise_messages" />
                  <MessagePane ref="code_messages" />
                  <InstructionPane content={
                    currentStep.getShortInstructions()
                  } />
                </div>
                <div style={this.state.docked ?
                              this.styles.centerPanelDocked :
                              this.styles.centerPanel}>
                  <div style={this.styles.codeEditor}>
                    <CodeEditor code={this.state.sourceCode}
                                onChange={this._updateCode}
                                limit={currentStep.getCodeSizeLimit()} />
                  </div>
                  <div style={this.styles.buttonBar}>
                    <ButtonBar onPlay={this._playCode}
                                onReset={this._reset}
                                onAdvance={this._advanceStep}
                                onHelp={this._showInstructions.bind(this, null)}
                                advanceEnabled={currentStep.canAdvance()} />

                  </div>
                </div>
                {this.showButton()}
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
