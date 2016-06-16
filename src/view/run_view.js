/*
 * Graphically shows the results of a run of the user's code.
 */

var React = require("react");

var RunView = React.createClass({
  render: function() {
    return <div style={{width: "100%", height: "100%"}}>
              <canvas ref="canvas" style={{width: "100%", height: "100%"}} />
           </div>;
  },

  componentDidMount: function() {
    this.forceUpdate();
  },

  componentDidUpdate: function() {
    if (this.props.animator) {
      var canvas = this.refs.canvas;
      this.props.animator.start();
      this.props.animator.play(canvas);
    }
  },
});

module.exports = RunView;
