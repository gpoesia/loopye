/**
 * Components with the button bar icons to be inserted into text.
 */

var React = require("react");
var Constants = require("../constants");

var PlayIcon = <img src={Constants.PLAY_ICON_URL} />;
var ResetIcon = <img src={Constants.RESET_ICON_URL} />;
var AdvanceIcon = <img src={Constants.ADVANCE_ICON_URL} />;
var HelpIcon = <img src={Constants.HELP_ICON_URL} />;

module.exports = {
  PlayIcon: PlayIcon,
  ResetIcon: ResetIcon,
  AdvanceIcon: AdvanceIcon,
  HelpIcon: HelpIcon,
};
