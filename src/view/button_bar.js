/*
 * Component that contains the button to interact with the lesson:
 * check for errors in source code, run, execute one instruction, etc.
 */

var React = require("react");
var Constants = require("../constants");
var ResourceLoader = require("../util/resource_loader");

var ButtonBar = React.createClass({
  _styles: {
    playButton: {
      height: "100%",
      width: "10%",
      backgroundImage: "url(\"" + Constants.PLAY_ICON_URL + "\")",
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    resetButton: {
      height: "100%",
      width: "10%",
      backgroundImage: "url(\"" + Constants.RESET_ICON_URL + "\")",
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    advanceButton: {
      height: "100%",
      width: "10%",
      backgroundImage: "url(\"" + Constants.ADVANCE_ICON_URL + "\")",
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    helpButton: {
      height: "100%",
      width: "10%",
      backgroundImage: "url(\"" + Constants.HELP_ICON_URL + "\")",
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
  },
  render: function() {
    return <div style={{backgroundColor: "#eeffee", width: "100%",
                        height: "100%"}}>
              <button onClick={this.props.onPlay}
                      style={this._styles.playButton} />

              <button onClick={this.props.onReset}
                      style={this._styles.resetButton} />

              <button onClick={this.props.onAdvance}
                      disabled={!this.props.advanceEnabled}
                      style={this._styles.advanceButton} />

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
