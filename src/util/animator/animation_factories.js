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

function setProperty(element_id, property, value, time) {
  return new Animation(time, time, element_id, property,
                       function() { return value; });
}

function makeVisible(element_id, time) {
  return setProperty(element_id, 'visible', true, time);
}

function makeInvisible(element_id, time) {
  return setProperty(element_id, 'visible', false, time);
}

module.exports = {
  linearChange,
  straightMove,
  setProperty,
  makeVisible,
  makeInvisible,
};
