/*
 * Component that contains the button to interact with the code:
 * check for errors, run, execute one instruction, etc.
 */

var React = require("react");
var Constants = require("../constants");

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
  },
  render: function() {
    return <div style={{backgroundColor: "#eeffee", width: "100%",
                        height: "100%"}}>
              <button onClick={this.props.onPlay}
                      style={this._styles.playButton} />
           </div>;
  },
});

module.exports = ButtonBar;
