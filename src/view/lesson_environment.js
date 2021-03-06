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
var ProgressManager = require("../backend/progress_manager");
var T = require("../util/translate").T;

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
    this._codeLength = 0;

    return {
      sourceCode: "",
      initialCode: "",
      currentChallenge: this.props.initialChallenge || 0,
      docked: true,
      loaded: false,
      highlightingRanges: [],
    };
  },

  _updateCode: function(code, codeLength) {
    this._codeLength = codeLength;
    this._codeEditor.highlightRanges([]);
    this.setState({sourceCode: code});
  },

  _startChallenge: function(challengeIndex) {
    // Before the first rendering, we don't have refs.
    if (this.refs.exercise_messages !== undefined) {
      this.refs.exercise_messages.clear();
      this.refs.code_messages.clear();
      this._codeEditor.highlightRanges([]);
    }

    var challenge = this.props.lesson.getChallenge(challengeIndex)
    this._gameRunner = Game.newGameRunner(challenge.getGameID());
    this._gameRunner.populateResourceLoader();

    this.setState({currentChallenge: challengeIndex,
                   sourceCode: challenge.getInitialSourceCode(),
                   initialCode: challenge.getInitialSourceCode(),
                   loaded: false,
                   highlightingRanges: []},
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
    if (this.state.currentChallenge + 1 === this.props.lesson.getNumberOfChallenges()) {
      if (this.props.onLessonExit) {
        this.props.onLessonFinished(true);
      }
    } else {
      this._startChallenge(this.state.currentChallenge + 1);
    }
  },

  _previousChallenge: function() {
    this._startChallenge(Math.max(0, this.state.currentChallenge - 1));
  },

  _playCode: function() {
    this._stopCurrentAnimation();

    this.refs.exercise_messages.clear();
    this.refs.code_messages.clear();

    var currentChallenge = this.props.lesson.getChallenge(this.state.currentChallenge);
    var errors = [];
    var result;

    if (!!currentChallenge.getCodeSizeLimit() &&
        this._codeLength > currentChallenge.getCodeSizeLimit()) {
      errors.push(
        {
          message: T("Seu código passou do tamanho permitido neste desafio!"),
        }
      );
    } else {
      result = this._gameRunner.run(this.state.sourceCode);
      errors = result.compilation_errors;
    }

    var success = false;

    if (errors && errors.length > 0) {
      this._handleCompilationErrors(errors);
    } else {
      var animator = result.animator;
      var runtime_errors = result.runtime_errors;
      var exercise_messages = this.refs.exercise_messages;

      animator.setEventHandler(this._handleAnimationEvent);
      animator.start();

      if (Array.isArray(runtime_errors) && runtime_errors.length) {
        animator.onStop(function(ok) {
          if (this._codeEditor)
            this._codeEditor.highlightRanges([]);
          if (ok) {
            runtime_errors.map(exercise_messages.addError);
          }
        }.bind(this));
      } else {
        success = true;
        var forceUpdate = this.forceUpdate.bind(this);
        animator.onStop(function(ok) {
          if (ok) {
            if (this._codeEditor)
              this._codeEditor.highlightRanges([]);
            exercise_messages.addSuccess(currentChallenge.getSuccessMessage());
            forceUpdate();
          }
        }.bind(this));
      }

      animator.play(this.refs.run_view.getCanvas());
      this._currentAnimator = animator;
    }

    this.props.progressManager.handleSubmission(this.props.course,
                                                this.props.lesson,
                                                currentChallenge,
                                                this.state.sourceCode,
                                                success);
  },

  _handleCompilationErrors: function(errors) {
    this.refs.code_messages.setErrors(
      errors.map(function(error) { return error.message; }));

    // Highlight relevant code ranges.
    var highlightRanges = [];
    for (var i = 0; i < errors.length; i++) {
      var sourceCodeRange = errors[i].range;
      if (sourceCodeRange) {
        highlightRanges.push(
          {
            beginLine: sourceCodeRange.getBegin().getLine(),
            endLine: sourceCodeRange.getEnd().getLine(),
            beginColumn: sourceCodeRange.getBegin().getColumn(),
            endColumn: sourceCodeRange.getEnd().getColumn(),
            style: {
              backgroundColor: '#ff9999',
            },
            ephemeral: true,
          });
      }
    }
    this._codeEditor.highlightRanges(highlightRanges);
  },

  _handleAnimationEvent: function(event) {
    if (this._codeEditor && event.type === Game.AnimationEventTypes.ACTIVE_CODE_CHANGED) {
      this._codeEditor.highlightRanges(
        [
          {
            beginLine: event.beginLine,
            endLine: event.endLine,
            beginColumn: event.beginColumn,
            endColumn: event.endColumn,
            style: {
              backgroundColor: '#ffff00',
            },
          },
        ]);
    }
  },

  _reset: function() {
    this._stopCurrentAnimation();
    if (this._codeEditor) {
      this._codeEditor.highlightRanges([]);
    }
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
                    <CodeEditor initialCode={this.state.initialCode}
                                onChange={this._updateCode}
                                limit={currentChallenge.getCodeSizeLimit()}
                                highlightingRanges={this.state.highlightingRanges}
                                ref={function(editor){
                                  this._codeEditor = editor;
                                  return editor && editor.focus();
                                }.bind(this)}/>
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

  componentDidUpdate: function() {
    if (this.refs.containerDiv) {
      this.refs.containerDiv.onkeyup = this._checkShortcuts;
    }
  },

  // Shortcuts for quickly advancing steps (Ctrl + 9) and for
  // exiting a lesson (Ctrl + 8).
  _checkShortcuts: function(event) {
    if (!!event.ctrlKey && String.fromCharCode(event.keyCode) === "9") {
      this._nextChallenge();
    } else if (!!event.ctrlKey && String.fromCharCode(event.keyCode) === "8") {
      if (this.props.onLessonExit) {
        this.props.onLessonExit(false);
      }
    }
  },
});

module.exports = LessonEnvironment;
