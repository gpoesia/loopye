/*
 * Container for displaying  two kinds of messages to the user:
 * errors and successes.
 */

var React = require("react");

var MessagePane = React.createClass({
  styles: {
    error: {
      backgroundColor: 'rgb(255, 100, 100)',
    },
    success: {
      backgroundColor: 'rgb(100, 255, 100)',
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
    var error_messages = React.createElement('ul', {style: this.styles.error},
                                             errors);

    var successes = []
    for (var i = 0; i < this.state.successes.length; i++) {
      successes.push(<li key={i}>{this.state.successes[i]}</li>);
    }
    var success_messages = React.createElement('ul',
                                               {style: this.styles.success},
                                               successes);
    return <div>
             {error_messages}
             {success_messages}
           </div>;
  },
});

module.exports = MessagePane;
