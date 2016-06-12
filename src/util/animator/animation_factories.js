/*
 * Functions for creating common animations.
 */

var Animation = require("../animator").Animation;

function linearChange(element_id, start_time, end_time, property, delta) {
  return new Animation(start_time, end_time, element_id, property,
                       function(t, element, initialState) {
                         var initialValue = initialState[property];
                         return (initialValue +
                                 t * delta / (end_time - start_time));
                       });
}

function straightMove(element_id, start_time, end_time, delta_x, delta_y) {
  return [
    linearChange(element_id, start_time, end_time, 'x', delta_x),
    linearChange(element_id, start_time, end_time, 'y', delta_y),
  ];
}

module.exports = {
  linearChange,
  straightMove,
};
