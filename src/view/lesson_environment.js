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

  render: function() {
    return <div class='lesson-environment' style={{width: "100%", height: "100%"}}>
             <div style={this.styles.instructionPane}>
               <InstructionPane/>
             </div>
             <div style={this.styles.actionSide}>
               <div style={this.styles.editor}>
                 <CodeEditor/>
               </div>
               <div style={this.styles.buttonBar}>
                 <ButtonBar/>
               </div>
               <div style={this.styles.runView}>
                 <RunView/>
               </div>
             </div>
           </div>;
  },
});

module.exports = LessonEnvironment;
