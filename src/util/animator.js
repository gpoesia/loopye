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
};

Element.prototype = {
  render: function(canvas) {
    throw "Rendering abstract element not implemented.";
  },
};

// An animation is a change to an element's property during some time period.
// fn = function(t, e, initial) that gives the property's value at time t,
// given the current state of the element (e) and its initial state (initial).
// The element's initial state will only contain primitive properties
// (more specifically, everything that can be serialized in JSON).
var Animation = function(start_time, end_time, element_id, property, fn) {
  this.start_time = start_time;
  this.end_time = end_time;
  this.element_id = element_id;
  this.property = property;
  this.fn = fn;
  this.initial_state = null;
};

Animation.prototype = {
  // Returns whether the animation is active at time `t`.
  isPlayingAt: function(t) {
    return this.start_time <= t && this.end_time >= t;
  },
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
}

RectangleElement.prototype = Object.create(Element.prototype);
Object.assign(RectangleElement.prototype, {
  render: function(canvas) {
    var context = canvas.getContext('2d');
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.fillStyle = this.color;
    context.fill();
    context.lineWidth = this.line_width;
    context.strokeStyle = this.stroke_color;
    context.stroke();
    context.closePath();
  },
});

// An element that is a colored circle.
var CircleElement = function(id, radius, color, stroke_color,
                             line_width) {
  var circle = this;
  Element.apply(circle, [id]);
  this.radius = radius || 0;
  this.color = color || 'black';
  this.stroke_color = stroke_color || 'black';
  this.line_width = line_width || 0;
};

CircleElement.prototype = Object.create(Element.prototype);
Object.assign(CircleElement.prototype, {
  render: function(canvas) {
    var context = canvas.getContext('2d');
    context.beginPath();
    context.arc(this.x + this.radius,
                this.y + this.radius,
                this.radius, 0, 2*Math.PI);
    context.fillStyle = this.color;
    context.fill();
    context.lineWidth = this.line_width;
    context.strokeStyle = this.stroke_color;
    context.stroke();
    context.closePath();
  },
});

// An element that draws a simple grid. Each cell has height equal
// to `cell_height`
// and width equal to `cell_width`. Each grid has `h_cells` X `v_cells` cells.
var SimpleGridElement = function(id, cell_width, h_cells, cell_height, v_cells,
                                 stroke_color, line_width) {
  Element.apply(this, [id]);
  this.cell_width = cell_width || 10;
  this.cell_height = cell_height || this.cell_width;
  this.h_cells = h_cells || 10;
  this.v_cells = v_cells || this.h_cells;
  this.stroke_color = stroke_color || 'black';
  this.line_width = line_width || 1;
}

SimpleGridElement.prototype = Object.create(Element.prototype);
Object.assign(SimpleGridElement.prototype, {
  render: function(canvas) {
    var context = canvas.getContext('2d');
    var width = this.h_cells * this.cell_width;
    var height = this.v_cells * this.cell_height;
    context.beginPath();
    for (var x = 0; x <= this.v_cells; ++x) {
      context.moveTo(this.x + this.cell_height * x, this.y);
      context.lineTo(this.x + this.cell_height * x, this.y + width);
    }
    for (var y = 0; y <= this.h_cells; ++y) {
      context.moveTo(this.x, this.y + this.cell_width * y);
      context.lineTo(this.x + height, this.y + this.cell_width * y);
    }
    context.lineWidth = this.line_width;
    context.strokeStyle = context.stroke_color;
    context.closePath();
    context.stroke();
  },
});

// Represents an animation in a tiled image.
// `name` should be a String with an identifying name for the animation
// (e.g. 'walk_left').
// `tiles` should be an Array with the indexes of the tiles that compose
// the animation in sequence. e.g. [0, 1, 10, 11] means the animation consists
// of 4 frames: the first, second, eleventh and twelfth tiles.
var SpriteAnimation = function(name, tiles) {
  this.name = name;
  this.tiles = tiles;
}

// An element that renders animations in a tiled image.
// `image` should be an HTMLImageElement containing the full image.
// `xdivs` should be the number of tiles in a row of the image.
// `ydivs` should be the number of tiles in a column of the image.
// Thus, the full image is interpreted as a grid containin `xdivs` * `ydivs`
// tiles. When used as frames in animations, tiles are numbered from 0 to
// `xdivs` * `ydivs` - 1 in row-major order.
// `animations` should be an array of SpriteAnimations.
var AnimatedImageElement = function(id, image, animations,
                                    xdivs,
                                    ydivs,
                                    rendered_tile_width,
                                    rendered_tile_height) {
  Element.apply(this, [id]);

  this.image = image;
  this.animations = {};
  this.rendered_tile_width = rendered_tile_width;
  this.rendered_tile_height = rendered_tile_height;
  this.xdivs = xdivs;
  this.ydivs = ydivs;

  for (var i = 0; i < animations.length; ++i) {
    this.animations[animations[i].name] = animations[i];
  }

  this.current_frame = 0;
};

AnimatedImageElement.prototype = {
  // Returns a new animation to be added to an Animator.
  // `start_time` and `end_time` are the times in which the animation starts
  // and ends, and `length` should be the duration of one playback of the
  // animation. The image animation will loop to fill the whole time interval
  // between `start_time` and `end_time`, each playback playing for `length`
  // seconds.
  createAnimation: function(name, start_time, end_time, length) {
    var image_animation = this.animations[name];

    return new Animation(start_time, end_time, this.id, 'current_frame',
                         function(t, element, initial_state) {
                           var playback_t = t % length;
                           var number_of_tiles = image_animation.tiles.length;
                           var tile_length = length / number_of_tiles;
                           var current_tile =
                               Math.floor(playback_t / tile_length);
                           return image_animation.tiles[current_tile];
                         });
  },

  render: function(canvas) {
    var tile_width = this.image.width / this.xdivs;
    var tile_height = this.image.height / this.ydivs;
    var rendered_tile_width = this.rendered_tile_width || tile_width;
    var rendered_tile_height = this.rendered_tile_height || tile_height;

    var tile_row = Math.floor(this.current_frame / this.xdivs);
    var tile_column = this.current_frame % this.xdivs;

    var tile_x = tile_width * tile_column;
    var tile_y = tile_height * tile_row;

    var context = canvas.getContext('2d');
    context.drawImage(this.image, tile_x, tile_y, tile_width, tile_height,
                      this.x, this.y,
                      rendered_tile_width, rendered_tile_height);
  },
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
  // If `animation` is an array, each element is expected to be an animation
  // to be added.
  this.addAnimation = function(animation) {
    if (Array.isArray(animation)) {
      for (var i = 0; i < animation.length; i++) {
        this.addAnimation(animation[i]);
      }
    } else {
      animator.animations.push(animation);
    }
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

    // Save the elements' current state as their initial state in animations
    // that will start playing in this tick. It's better to do this before
    // any animation actually modifies elements' properties since otherwise two
    // animations that modify the same element could interfere in one another
    for (var i = 0; i < animations.length; ++i) {
      var animation = animations[i];
      if (animation.isPlayingAt(t) && animation.initial_state === null) {
        animation.initial_state = JSON.parse(JSON.stringify(
              animator.elements[animation.element_id]));
      }
    }

    // Update elements' properties based on active animations.
    // This can be optimized by sorting events that mark the beginning or end
    // of an animation and maintaining a structure with the "active" animations.
    // Then unstarted/finished animations won't add overhead to other frames.
    for (var i = 0; i < animations.length; ++i) {
      var animation = animations[i];
      if (animation.isPlayingAt(t)) {
        var element = animator.elements[animation.element_id];
        element[animation.property] =
          animation.fn(t - animation.start_time, element,
                       animation.initial_state);
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
  AnimatedImageElement: AnimatedImageElement,
  SpriteAnimation: SpriteAnimation,
};
