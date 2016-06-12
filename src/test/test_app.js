/*
 * Simple module for exporting modules used in visual tests.
 */

module.exports = {
  Animator: require("../util/animator.js"),
  ElementFactories: require("../util/animator/element_factories.js"),
  AnimationFactories: require("../util/animator/animation_factories.js"),
};
