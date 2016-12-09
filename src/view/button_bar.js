/*
 * Component that contains the button to interact with the lesson:
 * check for errors in source code, run, execute one instruction, etc.
 */

var React = require("react");
var Constants = require("../constants");
var ResourceLoader = require("../util/resource_loader");

var ButtonBar = React.createClass({
  _styles: {
    barContainer: {
      width: "100%",
      height: "50px",
    },
    playButton: {
      height: "100%",
      width: "100px",
      maxWidth: "22%",
      cursor: "pointer",
      border: "0px",
      borderRadius: "5px",
      backgroundSize: "40px",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundImage: "url(\"" + Constants.PLAY_ICON_URL + "\")",
      backgroundColor: "#8AD700",
    },
    resetButton: {
      height: "100%",
      width: "100px",
      maxWidth: "22%",
      cursor: "pointer",
      border: "0px",
      borderRadius: "5px",
      backgroundSize: "40px",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundImage: "url(\"" + Constants.RESET_ICON_URL + "\")",
      backgroundColor: "#FF8300",
    },
    advanceButton: {
      height: "100%",
      width: "100px",
      maxWidth: "22%",
      cursor: "pointer",
      border: "0px",
      borderRadius: "5px",
      backgroundSize: "40px",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundImage: "url(\"" + Constants.ADVANCE_ICON_URL + "\")",
      backgroundColor: "#078FBC",
    },
    helpButton: {
      height: "100%",
      width: "100px",
      maxWidth: "22%",
      cursor: "pointer",
      border: "0px",
      borderRadius: "5px",
      backgroundSize: "40px",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundImage: "url(\"" + Constants.HELP_ICON_URL + "\")",
      backgroundColor: "#E657A3",
    },
    space: {
      display: "inline-block",
      width: "10px",
      maxWidth: "4%",
    },
  },
  render: function() {
    return  <div style={this._styles.barContainer}>
              <button onClick={this.props.onPlay}
                      style={this._styles.playButton} />
              <div style={this._styles.space}></div>
              <button onClick={this.props.onReset}
                      style={this._styles.resetButton} />
              <div style={this._styles.space}></div>
              <button onClick={this.props.onAdvance}
                      disabled={!this.props.advanceEnabled}
                      style={this._styles.advanceButton} />
              <div style={this._styles.space}></div>
              <button onClick={this.props.onHelp}
                      style={this._styles.helpButton} />
           </div>;
  },
});

ButtonBar.populateResourceLoader = function() {
  ResourceLoader.addImage(Constants.PLAY_ICON_URL);
  ResourceLoader.addImage(Constants.ADVANCE_ICON_URL);
  ResourceLoader.addImage(Constants.HELP_ICON_URL);
  ResourceLoader.addImage(Constants.RESET_ICON_URL);
}

module.exports = ButtonBar;
