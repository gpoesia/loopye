/*
 * Component that shows a sidebar explaining the commands used in 
 * a lesson step
 */

var React = require("react");
var Constants = require("../constants");
var ResourceLoader = require("../util/resource_loader");
var Sidebar = require('react-sidebar').default;

var CommandReferenceSidebar = React.createClass({
  styles: {
    root: {
      fontWeight: 300,
    },
    header: {
      backgroundColor: '#03a9f4',
      color: 'white',
      padding: '16px',
      fontSize: '1.5em',
    },
    content: {
      marginLeft: '16px',
      marginRight: '16px',
      height: '100%',
      backgroundColor: 'white',
      marginBottom: "4%",
    },
    link: {
      textDecoration: 'none',
      color: 'white',
      padding: '8px',
    },
  },

  render: function() {
    var commandReference = [];
    for (var i = 0; i < this.props.content.length; i++) {
      commandReference.push(this.props.content[i]);
    }
      
    return <div style={{width: "100%", height: "100%"}}>
              <div style={this.styles.root}>
                <div style={this.styles.header}> 
                  <span> Comandos </span> 
                  <span style={{float: "right"}}>
                    <a href='#'
                       onClick={this.props.onClose}
                       style={this.styles.link}> 
                      X 
                    </a>
                  </span>
                </div>
                <div style={this.styles.content}>
                  {commandReference}
                </div>
              </div>
           </div>;
  },
});

module.exports = CommandReferenceSidebar;
