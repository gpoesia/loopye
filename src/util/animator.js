/*
 * A simple animation framework using HTML canvas.
 *
 * An animation consists of elements and a description of how their visual
 * properties change over time. The animator plays such changes in a canvas.
 */

// An identified element of the animation.
// Element's (x, y) position is its center. In the animator's plane, the
// top-left corner is the origin, with x growing to the right and y growing to
// the bottom of the screen.
// The visible property indicates whether this element is being rendered.
// Elements are also animated when invisible.
var Element = function(id) {
  if (!id)
    throw "Element must have an id.";

  this.x = 0;
  this.y = 0;
  this.id = id;
  this.angle = 0;
  this.visible = true;
};

Element.prototype = {
  render: function(canvas, origin_x, origin_y) {
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
  // Indicates whether this animation has already reached its final state.
  this.finalized = false;
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
  render: function(canvas, origin_x, origin_y) {
    var context = canvas.getContext('2d');
    context.beginPath();
    context.rect(origin_x + this.x - (this.width / 2),
                 origin_y + this.y - (this.height / 2),
                 this.width, this.height);
    context.fillStyle = this.color;
    context.fill();
    context.lineWidth = this.line_width;
    context.strokeStyle = this.stroke_color;
    context.stroke();
    context.closePath();
  },
});

// An element that is a colored circle.
var CircleElement = function(id, radius, color, stroke_color, line_width) {
  var circle = this;
  Element.apply(circle, [id]);
  this.radius = radius || 0;
  this.color = color || 'black';
  this.stroke_color = stroke_color || 'black';
  this.line_width = line_width || 0;
};

CircleElement.prototype = Object.create(Element.prototype);
Object.assign(CircleElement.prototype, {
  render: function(canvas, origin_x, origin_y) {
    var context = canvas.getContext('2d');
    context.beginPath();
    context.arc(origin_x + this.x, origin_y + this.y,
                this.radius, 0, 2 * Math.PI);
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
  this.line_width = line_width || 2;
}

SimpleGridElement.prototype = Object.create(Element.prototype);
Object.assign(SimpleGridElement.prototype, {
  render: function(canvas, origin_x, origin_y) {
    var context = canvas.getContext('2d');
    var width = this.h_cells * this.cell_width;
    var height = this.v_cells * this.cell_height;
    context.beginPath();
    for (var x = 0; x <= this.v_cells; ++x) {
      context.moveTo(origin_x + this.x + this.cell_height * x,
                     origin_y + this.y);
      context.lineTo(origin_x + this.x + this.cell_height * x,
                     origin_y + this.y + width);
    }
    for (var y = 0; y <= this.h_cells; ++y) {
      context.moveTo(origin_x + this.x,
                     origin_y + this.y + this.cell_width * y);
      context.lineTo(origin_x + this.x + height,
                     origin_y + this.y + this.cell_width * y);
    }
    context.lineWidth = this.line_width;
    context.strokeStyle = this.stroke_color;
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
// `image` should be either a single HTMLImageElement, or an object where
// keys are strings (style names), and values are the corresponding images.
// Styles are used to facilitate changing the state of the element during the
// course of the animation. For example, a robot animation might have
// two styles: 'robot_red', and 'default', each with the exact same format
// (i.e. same animations, number of x/y divisions, etc), which are
// easily interchangeable when the robot e.g. gets hurt and turns red for a
// while.
// If `image` is a single image, the element will have only one style with that
// image.
// Otherwise, the image *must* have one style called "default".
// `xdivs` should be the number of tiles in a row of the image.
// `ydivs` should be the number of tiles in a column of the image.
// Thus, the full image is interpreted as a grid containin `xdivs` * `ydivs`
// tiles. When used as frames in animations, tiles are numbered from 0 to
// `xdivs` * `ydivs` - 1 in row-major order.
// `animations` should be an array of SpriteAnimations.
var AnimatedImageElement = function(id, styles_or_image, animations,
                                    xdivs,
                                    ydivs,
                                    rendered_tile_width,
                                    rendered_tile_height) {
  Element.apply(this, [id]);

  // Check whether we have an object with multiple styles or just one image.
  if (styles_or_image instanceof HTMLImageElement) {
    this.styles = {"default": styles_or_image};
  } else {
    this.styles = styles_or_image;
  }
  this.current_style = "default";
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
  // Returns the image corresponding to the sprite's current style.
  image: function() {
    return this.styles[this.current_style];
  },

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

  // Returns a new animation that changes this image's style to `new_style`
  // at the given time point `t`.
  changeStyle: function(new_style, t) {
    return new Animation(t, t, this.id, 'current_style',
                         function() { return new_style; });
  },

  render: function(canvas, origin_x, origin_y) {
    var image = this.image();
    var tile_width = image.width / this.xdivs;
    var tile_height = image.height / this.ydivs;
    var rendered_tile_width = this.rendered_tile_width || tile_width;
    var rendered_tile_height = this.rendered_tile_height || tile_height;

    var tile_row = Math.floor(this.current_frame / this.xdivs);
    var tile_column = this.current_frame % this.xdivs;

    var tile_x = tile_width * tile_column;
    var tile_y = tile_height * tile_row;

    var context = canvas.getContext('2d');
    context.drawImage(image, tile_x, tile_y, tile_width, tile_height,
                      origin_x + this.x - (rendered_tile_width / 2),
                      origin_y + this.y - (rendered_tile_height / 2),
                      rendered_tile_width, rendered_tile_height);
  },
};

// An element that can render only a certain portion of an image defined by
// cut_x and cut_y as the coordinates of the beginning of the cut in the image
// and cut_width and cut_height the size of the cut.
var StaticImageElement = function(id, image,
                                  rendered_width, rendered_height,
                                  cut_x, cut_y,
                                  cut_width, cut_height) {
  Element.apply(this, [id]);
  this.image = image;
  this.cut_x = cut_x || 0;
  this.cut_y = cut_y || 0;
  this.cut_width = cut_width || image.width - this.cut_x;
  this.cut_height = cut_height || image.height - this.cut_y;
  this.rendered_width = rendered_width || this.cut_width;
  this.rendered_height = rendered_height || this.cut_height;
};

StaticImageElement.prototype = {
  render: function(canvas, origin_x, origin_y) {
    var context = canvas.getContext('2d');
    context.drawImage(this.image,
                      this.cut_x, this.cut_y,
                      this.cut_width, this.cut_height,
                      origin_x + this.x - (this.rendered_width / 2),
                      origin_y + this.y - (this.rendered_height / 2),
                      this.rendered_width, this.rendered_height);
  },
};

// An Animator has elements, animations, and plays the scene in a canvas.
var Animator = function() {
  var animator = this;

  this.elements = new Object();
  this.animations = new Array();
  this.start_time = 0;
  this.playing = false;
  this.stop_callback = function() {};
  this.origin_x = 0;
  this.origin_y = 0;
  this.width = null;
  this.height = null;

  // Adds an element to the scene.
  this.addElement = function(element) {
    this.elements[element.id] = element;
  };

  // Sets the origin of the animator's coordinate space relative to the canvas'
  // coordinates. Effectively, every rendered element will be displaced by
  // origin_x and origin_y.
  this.setOrigin = function(origin_x, origin_y) {
    this.origin_x = origin_x;
    this.origin_y = origin_y;
  };

  // Sets the size of the canvas' coordinate space.
  // If width and/or height are null (the default), the canvas' original
  // size will be respected.
  this.setSize = function(width, height) {
    this.width = width;
    this.height = height;
  };

  // Returns the element with the given id.
  this.getElement = function(id) {
    if (!this.elements.hasOwnProperty(id))
      throw "No such element " + id;
    return this.elements[id];
  };

  // Returns whether there is an element with the given id.
  this.hasElement = function(id) {
    return this.elements.hasOwnProperty(id);
  }

  // Adds an animation to the scene.
  // If `animation` is an array, each element is expected to be an animation
  // to be added.
  this.addAnimation = function(animation) {
    if (Array.isArray(animation)) {
      for (var i = 0; i < animation.length; i++) {
        this.addAnimation(animation[i]);
      }
    } else {
      this.animations.push(animation);
    }
  };

  // Clears all animations on the scene.
  this.clearAllAnimations = function() {
    this.animations = new Array();
  };

  // Starts the animation timer. Needs to be called before play().
  this.start = function() {
    this.start_time = new Date().getTime();
    this.playing = true;
  };

  // Play the animation in a canvas. Must be called after start().
  this.play = function(canvas) {
    if (!!this.width)
      canvas.width = this.width;
    if (!!this.height)
      canvas.height = this.height;

    function playUntilEnd() {
      animator.render(canvas);
      if (animator.playing) {
        window.requestAnimationFrame(playUntilEnd);
      }
    }
    playUntilEnd();
  };

  // Registers a function to be called when the animation stops.
  this.onStop = function(callback) {
    this.stop_callback = callback;
  }

  // Stops the current animation.
  this.stop = function(canvas) {
    this.playing = false;
    this.stop_callback();
  };

  // Renders the current state of the animation in a canvas.
  this.render = function(canvas, t) {
    this._animateElements(t);
    this._renderFrame(canvas);
  };

  // Renders the current state of the elements.
  this._renderFrame = function(canvas) {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (var id in this.elements) {
      if (this.elements.hasOwnProperty(id)) {
        var element = this.elements[id];
        if (element.visible) {
          element.render(canvas, this.origin_x, this.origin_y);
        }
      }
    }
  };

  // Updates the elements according to the animations.
  this._animateElements = function(t) {
    if (this.start_time !== null && t === undefined) {
      t = (new Date().getTime() - this.start_time) / 1000;
    }
    var animations = this.animations;
    var shouldStop = true;

    // Process animations that have finished but have not yet been
    // finalized (i.e. updated the corresponding property in their final state).
    for (var i = 0; i < animations.length; ++i) {
      var animation = animations[i];
      if (t > animation.end_time && !animation.finalized) {
        animation.finalized = true;
        var element = this.elements[animation.element_id];
        element[animation.property] =
          animation.fn(animation.end_time - animation.start_time, element,
                       animation.initial_state || element);
      }
    }

    // Save the elements' current state as their initial state in animations
    // that will start playing in this tick. It's better to do this before
    // any animation actually modifies elements' properties since otherwise two
    // animations that modify the same element could interfere in one another.
    for (var i = 0; i < animations.length; ++i) {
      var animation = animations[i];
      if (animation.start_time <= t && animation.initial_state === null) {
        animation.initial_state = JSON.parse(JSON.stringify(
              this.elements[animation.element_id]));
      }
      // If there's still work to be done with this animation, don't stop.
      if (!animation.finalized) {
        shouldStop = false;
      }
    }

    if (shouldStop) {
      this.stop();
      return;
    }

    // Update elements' properties based on active animations.
    // FIXME(gpoesia) This can be optimized by sorting events that mark the
    // beginning or end of an animation and maintaining a structure with the
    // "active" animations.
    // Then unstarted/finished animations won't add overhead to other frames.
    for (var i = 0; i < animations.length; ++i) {
      var animation = animations[i];
      if (animation.isPlayingAt(t) && !animation.finalized) {
        var element = this.elements[animation.element_id];
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
  StaticImageElement: StaticImageElement,
  SpriteAnimation: SpriteAnimation,
};
