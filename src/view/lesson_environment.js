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
var Constants = require("../constants");
var Game = require("../game/game");
var Loading = require("react-loading");

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
    this._currentAnimator = null;
    this._gameRunner = null;

    return {
      sourceCode: "",
      currentChallenge: this.props.initialChallenge || 0,
      docked: true,
      loaded: false,
    };
  },

  _updateCode: function(code) {
    this.setState({sourceCode: code});
  },

  _startChallenge: function(challengeIndex) {
    // Before the first rendering, we don't have refs.
    if (this.refs.exercise_messages !== undefined) {
      this.refs.exercise_messages.clear();
      this.refs.code_messages.clear();
    }

    var challenge = this.props.lesson.getChallenge(challengeIndex)
    this._gameRunner = Game.newGameRunner(challenge.getGameID());
    this._gameRunner.populateResourceLoader();

    this.setState({currentChallenge: challengeIndex,
                   sourceCode: challenge.getInitialSourceCode(),
                   loaded: false},
                  function() {
                    ResourceLoader.load((function() {
                      this.setState({loaded: true},
                                    function() {
                                      this._reset();
                                      this._showInstructions(challengeIndex);
                                    }.bind(this));
                    }).bind(this));
                  }.bind(this));
  },

  _nextChallenge: function() {
    this._startChallenge(Math.min(this.props.lesson.getNumberOfChallenges() - 1,
                                  this.state.currentChallenge + 1));
  },

  _previousChallenge: function() {
    this._startChallenge(Math.max(0, this.state.currentChallenge - 1));
  },

  _playCode: function() {
    this._stopCurrentAnimation();

    this.refs.exercise_messages.clear();
    this.refs.code_messages.clear();

    var currentChallenge = this.props.lesson.getChallenge(this.state.currentChallenge);
    var result = this._gameRunner.run(this.state.sourceCode);

    if (!!result.compilation_errors) {
      this.refs.code_messages.setErrors(result.compilation_errors);
    } else {
      var animator = result.animator;
      var runtime_errors = result.runtime_errors;
      var exercise_messages = this.refs.exercise_messages;

      animator.start();

      if (Array.isArray(runtime_errors) && runtime_errors.length) {
        animator.onStop(function(ok) {
          if (ok) {
            runtime_errors.map(exercise_messages.addError);
          }
        });
      } else {
        var forceUpdate = this.forceUpdate.bind(this);
        animator.onStop(function(ok) {
          if (ok) {
            exercise_messages.addSuccess(currentChallenge.getSuccessMessage());
            forceUpdate();
          }
        });
      }

      animator.play(this.refs.run_view.getCanvas());
      this._currentAnimator = animator;
    }
  },

  _reset: function() {
    this._stopCurrentAnimation();
    var currentChallenge =
        this.props.lesson.getChallenge(this.state.currentChallenge);
    this._gameRunner.reset(currentChallenge.getGameParameters(),
                           this.refs.run_view.getCanvas());
  },

  _stopCurrentAnimation: function() {
    if (this._currentAnimator) {
      this._currentAnimator.stop();
    }
  },

  _showInstructions: function(challengeIndex) {
    var lesson = this.props.lesson;
    var challenge = lesson.getChallenge(challengeIndex ||
                                        this.state.currentChallenge);
    Popup.create({
      title: "Instruções",
      content: challenge.getInstructions(),
      buttons: {
        right: ["ok"],
      },
    });
  },

  _fastForward: function() {
    if (this._currentAnimator) {
      this._currentAnimator.fastForward(Constants.FAST_FORWARD_FACTOR);
    }
  },

  componentWillMount: function() {
    ButtonBar.populateResourceLoader();
    this._startChallenge(this.state.currentChallenge);
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
    if (!this.state.loaded) {
      return <Loading type="balls" color="black" />
    }

    var currentChallenge = this.props.lesson.getChallenge(this.state.currentChallenge);

    var commandReferenceSidebar = <CommandReferenceSidebar
          onClose={this._closeSidebar}
          content={currentChallenge.getCommandReference()} />;

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
                  <InstructionPane content={currentChallenge.getShortInstructions()} />
                </div>
                <div style={this.state.docked ?
                            this.styles.centerPanelDocked :
                            this.styles.centerPanel}>
                  <div style={this.styles.codeEditor}>
                    <CodeEditor code={this.state.sourceCode}
                                onChange={this._updateCode}
                                limit={currentChallenge.getCodeSizeLimit()}
                                ref={function(editor){
                                  return editor && editor.focus();
                                }}/>
                  </div>
                  <div style={this.styles.buttonBar}>
                    <ButtonBar onPlay={this._playCode}
                               onReset={this._reset}
                               onAdvance={this._nextChallenge}
                               onHelp={this._showInstructions.bind(this, null)}
                               onFastForward={this._fastForward}
                               advanceEnabled={this._gameRunner.challengeSolved()} />

                  </div>
                </div>
                {this.showButton()}
              </div>
            </Sidebar>;
  },

  componentDidMount: function() {
    if (this.loaded) {
      this._reset();
    }
  },

  // "Cheat code" for quickly advancing steps: Ctrl + "9"
  componentDidUpdate: function() {
    if (this.refs.containerDiv) {
      this.refs.containerDiv.onkeyup = this._checkCheatCode;
    }
  },

  _checkCheatCode: function(event) {
    if (!!event.ctrlKey && String.fromCharCode(event.keyCode) === "9") {
      this._nextChallenge();
    }
  },
});

module.exports = LessonEnvironment;
