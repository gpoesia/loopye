/*
 * A simple animation framework using HTML canvas.
 *
 * An animation consists of elements and a description of how their visual
 * properties change over time. The animator plays such changes in a canvas.
 */

// An identified element of the animation.
var Element = function(id) {
  if (!id)
    throw "Element must have an id.";

  this.x = 0;
  this.y = 0;
  this.id = id;
  this.angle = 0;
  this.render = function(canvas) {
    throw "Rendering abstract element not implemented.";
  };
};

// An element that is a colored rectangle.
var RectangleElement = function(id, width, height, color, stroke_color,
                                line_width) {
  var rectangle = this;
  Element.apply(rectangle, [id]);
  this.width = width || 0;
  this.height = height || 0;
  this.color = color || 'black';
  this.stroke_color = stroke_color || 'black';
  this.line_width = line_width || 0;

  this.render = function(canvas) {
    var context = canvas.getContext('2d');
    context.beginPath();
    context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    context.fillStyle = rectangle.color;
    context.fill();
    context.lineWidth = rectangle.line_width;
    context.strokeStyle = rectangle.stroke_color;
    context.stroke();
  };
};

// An element that is a colored circle.
var CircleElement = function(id, radius, color, stroke_color,
                             line_width) {
  var circle = this;
  Element.apply(circle, [id]);
  this.radius = radius || 0;
  this.color = color || 'black';
  this.stroke_color = stroke_color || 'black';
  this.line_width = line_width || 0;

  this.render = function(canvas) {
    var context = canvas.getContext('2d');
    context.beginPath();
    context.arc(circle.x + circle.radius,
                circle.y + circle.radius,
                circle.radius, 0, 2*Math.PI);
    context.fillStyle = circle.color;
    context.fill();
    context.lineWidth = circle.line_width;
    context.strokeStyle = circle.stroke_color;
    context.stroke();
  };
};

// An element that draws a simple grid. Each cell has height equal
// to `cell_height`
// and width equal to `cell_width`. Each grid has `h_cells` X `v_cells` cells.
var SimpleGridElement = function(id, cell_width, h_cells, cell_height, v_cells,
                                 stroke_color, line_width) {
  var grid = this;
  Element.apply(grid, [id]);
  this.cell_width = cell_width || 10;
  this.cell_height = cell_height || this.cell_width;
  this.h_cells = h_cells || 10;
  this.v_cells = v_cells || this.h_cells;
  this.stroke_color = stroke_color || 'black';
  this.line_width = line_width || 1;

  this.render = function(canvas) {
    var context = canvas.getContext('2d');
    var width = grid.h_cells * grid.cell_width;
    var height = grid.v_cells * grid.cell_height;
    for (var x = 0; x <= grid.v_cells; ++x) {
      context.moveTo(grid.x + grid.cell_height * x, grid.y);
      context.lineTo(grid.x + grid.cell_height * x, grid.y + width);
    }
    for (var y = 0; y <= grid.h_cells; ++y) {
      context.moveTo(grid.x, grid.y + grid.cell_width * y);
      context.lineTo(grid.x + height, grid.y + grid.cell_width * y);
    }
    context.lineWidth = grid.line_width;
    context.strokeStyle = context.stroke_color;
    context.stroke();
  }
}

// An animation is a change to an element's properties, which can happen
// smoothly during some time period.
// fn = function(t, e) that gives the property's value at time t, given the
// current state of the element.
var Animation = function(start_time, end_time, element_id, property, fn) {
  this.start_time = start_time;
  this.end_time = end_time;
  this.element_id = element_id;
  this.property = property;
  this.fn = fn;
};

// An Animator has elements, animations, and plays the scene in a canvas.
var Animator = function() {
  var animator = this;
  animator.elements = new Object();
  animator.animations = new Array();
  animator.start_time = 0;

  // Adds an element to the scene.
  this.addElement = function(element) {
    animator.elements[element.id] = element;
  };

  // Adds an animation to the scene.
  this.addAnimation = function(animation) {
    animator.animations.push(animation);
  };
  
  // Clears all animations on the scene.
  this.clearAllAnimations = function() {
    animator.animations = new Array();
  };

  // Starts the animation timer. Needs to be called before play().
  this.start = function() {
    animator.start_time = new Date().getTime();
  };

  // Play the animation in a canvas. Must be called after start().
  this.play = function(canvas) {
    this.render(canvas);
    window.requestAnimationFrame(function() {animator.play(canvas);});
  };

  // Renders the current state of the animation in a canvas.
  this.render = function(canvas) {
    this._animateElements();
    this._renderFrame(canvas);
  };

  // Renders the current state of the elements.
  this._renderFrame = function(canvas) {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (var id in animator.elements) {
      if (animator.elements.hasOwnProperty(id)) {
        animator.elements[id].render(canvas);
      }
    }
  };

  // Updates the elements according to the animations.
  this._animateElements = function() {
    var t = (new Date().getTime() - animator.start_time) / 1000;
    var animations = animator.animations;
    // This can be optimized by sorting events that mark the beginning or end
    // of an animation and maintaining a structure with the "active" animations.
    // Then unstarted/finished animations won't add overhead to other frames.
    for (var i = 0; i < animations.length; ++i) {
      var animation = animations[i];
      if (animations[i].start_time <= t && animations[i].end_time >= t) {
        var element = animator.elements[animation.element_id];
        element[animation.property] = 
          animation.fn(t - animation.start_time, element);
      }
    }
  };
};

module.exports = {
  Element: Element,
  RectangleElement: RectangleElement,
  CircleElement: CircleElement,
  SimpleGridElement: SimpleGridElement,
  Animation: Animation,
  Animator: Animator,
};
