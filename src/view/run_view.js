/*
 * Component that graphically shows the results of a run of the user's code.
 */

var React = require("react");
var Constants = require("../constants");

var RunView = React.createClass({
  styles: {
    canvas: {
      height: "100%",
      marginLeft: "auto",
      marginRight: "auto",
      display: "block",
      border: "1px solid black",
    },
  },

  render: function() {
    return <canvas ref="canvas" style={this.styles.canvas} moz-opaque
                   width={Constants.RUN_VIEW_SQUARE_DIMENSION}
                   height={Constants.RUN_VIEW_SQUARE_DIMENSION} />;

  },

  componentDidMount: function() {
    this.refs.canvas.style.width = this.refs.canvas.offsetHeight + "px";
    this.forceUpdate();
  },

  getCanvas: function() {
    return this.refs.canvas;
  },
});

module.exports = RunView;
