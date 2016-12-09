/*
 * Container for displaying  two kinds of messages to the user:
 * errors and successes.
 */

var React = require("react");

var MessagePane = React.createClass({
  styles: {
    success: {
      backgroundColor: "#85E085",
      width: "100%",
      padding: "20px",
      marginTop: "20px",
      borderRadius: "10px",
      lineHeight: "150%",
      listStyleType: "none",
    },
    error: {
      backgroundColor: "#FF9999",
      width: "100%",
      padding: "20px",
      marginTop: "20px",
      borderRadius: "10px",
      lineHeight: "150%",
      listStyleType: "none",
    },
  },

  getInitialState: function() {
    return {
      errors: [],
      successes: [],
    };
  },

  clear: function() {
    this.setState(this.getInitialState());
  },

  addError: function(error) {
    var errors = this.state.errors;
    this.setState({errors: errors.concat([error])});
  },

  addSuccess: function(success) {
    var successes = this.state.successes;
    this.setState({successes: successes.concat([success])});
  },

  render: function() {
    var errors = [];
    for (var i = 0; i < this.state.errors.length; i++) {
      errors.push(<li key={i}>{this.state.errors[i]}</li>);
    }
    if (errors.length > 0) {
      var error_messages = React.createElement('ul',
                                               {style: this.styles.error},
                                               errors);
    }
    var successes = []
    for (var i = 0; i < this.state.successes.length; i++) {
      successes.push(<li key={i}>{this.state.successes[i]}</li>);
    }
    if (successes.length > 0) {
      var success_messages = React.createElement('ul',
                                                 {style: this.styles.success},
                                                 successes);
    }
    return <div>
             {error_messages}
             {success_messages}
           </div>;
  },
});

module.exports = MessagePane;
