/*
 * comp4kids programming 101 lesson 4.
 */

var React = require("react");
var Lesson = require("./lesson");
var Interpreter = require("../language/interpreter")
var Animator = require("../util/animator");
var ResourceLoader = require("../util/resource_loader");
var AnimationFactories = require("../util/animator/animation_factories");
var ElementFactories = require("../util/animator/element_factories");
var Robolang = require("../language/robolang/robolang");
var Constants = require("../constants");
var Icons = require("../view/icons");
var Grid = require("./utils/grid");

// Objects of this type indicate that some source is not producing any
// more items.
var SourceEnd = function() {};

// Sources can be used to collect items from. They should have a `position`,
// and the list of items to be produced.
// Parameters:
//  `position`: Integer indicating the source's position.
//  `item_list`: The list of items to be produced by this source.
var Source = function(position, item_list) {
  this.position = position;
  this._initial_item_list = item_list;
  this.reset();
};

Source.prototype = {
  // This function will push some item to the back of a source (FIFO).
  push: function(item) {
    return this.item_list.push(item);
  },
  // This function returns the item that is returned upon calling
  // this.generator_fxn, or an object of type SourceEnd if this.limit is
  // reached.
  pop: function() {
    if (this.item_list.length === 0)
      return new SourceEnd();
    return this.item_list.splice(0, 1)[0];
  },
  // Returns the item that would be popped from this source, without actually
  // removing it.
  peek: function() {
    if (this.item_list.length === 0)
      return new SourceEnd();
    return this.item_list[0];
  },
  // Resets the source to its initial state.
  reset: function() {
    this.item_list = this._initial_item_list.slice();
  }
};

SourceType = {
  RANDOM_FROM_SET: 1,
  FROM_LIST: 2,
};

// A factory for predefined Source behaviors.
// Parameters:
//  `position`: The position of the source
//  `limit`: The production limit of the source
//  `type`: The type of the source; It can be either
//    SourceType.RANDOM_FROM_SET: Will return an element, chosen at random, from a set
//      of item types. For this type of Souce, `parameters` is expected to
//      be an object containing the `item_set` property, with a list of items
//      to sample from.
//    SourceType.FROM_LIST: Will return elements from a list. If the list is shorter
//      than limit, the items in the list will be returned again in a
//      round-robin fashion. `parameters` is expected be an object containing
//      the `item_list` property.
//  `parameter`: The set of parameters required by the chosen type. This will
//    vary accordingly with the `type`, and therefore more usage details can
//    be found for each type of source.
var SourceFactory = function(position, limit, type, parameters) {
  switch (type) {
    case SourceType.RANDOM_FROM_SET:
      var items = new Array(limit);
      for (var i = 0; i < limit; ++i) {
        items[i] = parameters.item_set[Math.floor(Math.random() *
                                       parameters.item_set.length)]
      }
      return new Source(position, items);
    case SourceType.FROM_LIST:
      var items = new Array(limit);
      for (var i = 0; i < limit; ++i) {
        items[i] = parameters.item_list[i % parameters.item_list.length];
      }
      return new Source(position, items);
    default:
      throw new Error("Invalid source type for this SourceFactory.");
  };
};

// A Deposit is a place where items can be deposited. It should be passed
// a position and a set of accepted types.
// Parameters:
//  `position`: Integer indicating where the deposit should be placed.
//  `accepted_types`: Object containing each accepted type followed by a limit.
//    Example: { IRON: 10 }. In this example, this source (only) accepts IRON
//    items, with quantity up to 10 units.
var Deposit = function(position, accepted_types) {
  this.position = position;
  this.accepted_types = accepted_types;
  this.capacity = Object.assign({}, this.accepted_types);
};

Deposit.Error = function(code) {
  this.code = code;
};

Object.assign(Deposit.Error, {
  ITEM_TYPE_NOT_ACCEPTED: 1,
  CAPACITY_EXCEEDED: 2,
  NOTHING_TO_DEPOSIT: 3,
});

Deposit.prototype = {
  // Pushes some item to the deposit, returning null if successful or some
  // error otherwise.
  push: function(item) {
    if (item === null)
      return new Deposit.Error(Deposit.Error.NOTHING_TO_DEPOSIT);
    if (!this.accepted_types.hasOwnProperty(item))
      return new Deposit.Error(Deposit.Error.ITEM_TYPE_NOT_ACCEPTED);
    if (this.capacity[item] == 0)
      return new Deposit.Error(Deposit.Error.CAPACITY_EXCEEDED);
    --this.capacity[item];
    return null;
  },
  // Returns true if the deposit is with its capacity full. This the deposit
  // cannot accomodate any more items. It will be true iff, for every item in
  // this.accepted_types, the corresponding item's limit for this deposit has
  // been reached.
  isFull: function() {
    for (var item in this.capacity) {
      if (this.capacity[item] > 0)
        return false;
    }
    return true;
  },
  // Restores this deposit to its full capacity
  reset: function() {
    this.capacity = Object.assign({}, this.accepted_types);
  },
};

// A Machine turns a set of objects of some types into one object of another
// type, generally not the same as the deposited objects. The behavior is
// similar to that of a deposit - when depositing the items that will be
// transformed - and to that of a source - when collecting the produced item.
// Parameters:
//  `deposit_list`: a list of objects of type Deposit. The limits of the
//    accepted_items will determine the mixture (ratio of how much of some item
//    should be mixed with the other items in order to produce the final item)
//  `source_position`: The position of the source of the machine (where the
//    product is collected from).
//  `product_type`: The type of the item produced by the machine.
var Machine = function(deposit_list, source_position, product_type) {
  this.deposit_list = deposit_list;
  this.deposit_inverted_index = {};
  this.product_type = product_type;
  this.source = new Source(source_position, new Array());
  for (var i = 0; i < this.deposit_list.length; ++i) {
    this.deposit_inverted_index[this.deposit_list[i].position] = i;
  }
};

Machine.Error = function(code) {
  this.code = code;
};

Object.assign(Machine.Error, {
  INVALID_DEPOSIT_POSITION: 1,
});

Machine.prototype = {
  // Behavior is similar to that of Deposit.push (unless there is no deposit at
  // deposit_position). The same Deposit.Errors that would be expected from
  // Deposit.push will be returned in case of errors. If the push is successful,
  // null is returned.
  push: function (deposit_position, item) {
    if (!this.deposit_inverted_index.hasOwnProperty(deposit_position))
      return new Machine.Error(Machine.Error.INVALID_DEPOSIT_POSITION);
    var deposit_idx = this.deposit_inverted_index[deposit_position];
    var result = this.deposit_list[deposit_idx].push(item)
    if (result !== null)
      return result;
    var every_deposit_full = true;
    for (var i = 0; i < this.deposit_list.length; ++i) {
      if (!this.deposit_list[i].isFull()) {
        every_deposit_full = false;
        break;
      }
    }
    if (every_deposit_full) {
      for (var i = 0; i < this.deposit_list.length; ++i) {
        this.deposit_list[i].reset();
      }
      this.source.push(this.product_type);
    }
    return result;
  },
  // The behavior is identical to that of Source.pop.
  pop: function() {
    return this.source.pop();
  },
  // The behavior is identical to that of Source.peek.
  peek: function() {
    return this.source.peek();
  },
  // Resets the machine to its initial state.
  reset: function() {
    for (var i = 0; i < this.deposit_list.length; ++i) {
      this.deposit_list[i].reset();
    }
    this.source.reset();
    this.product_list = new Array();
  },
};

// In this game, a mechanical arm will have to detect the presence of a set of
// collectable items that come from a source. Those items will need to be
// deposited in item deposits, or will be converted into other items using
// machines.
//
// Parameters:
//  `size`: Size of the 1d space where the arm can move around collecting and
//    depositing items. Example: 10.
//  `arm_pos`: Initial position of the arm. Example: 0.
//  `sources`: List of Source objects from which the collectables can be
//    extracted.
//  `machines`: List of Machine objects that transform an item or set of items
//    into another set of items. Example:
//  `deposits`: List of Deposit objects to some item.
//  `goal`: The main goal of the game. If none specified, the goal is to make
//    every deposit full (deposits inside machines are NOT taken into account).
var Lesson04Game = function(size, arm_pos, sources, machines, deposits, goal) {
  this._size = size;
  this._initial_arm_pos = arm_pos;
  this.sources = sources;
  this.machines = machines;
  this.deposits = deposits;
  this.inverted_object_index = new Array(this._size);
  this.goal = goal || Lesson04Game.Goals.FILL_EVERY_DEPOSIT;
  this.holding_item = null;
  var initialize = function (){
    this.reset();
    for (var i = 0; i < this.sources.length; ++i) {
      if (this.sources[i].position >= this._size)
        throw new Error("Trying to put object at position greater than size");
      if (!this.inverted_object_index[this.sources[i].position] === undefined)
        throw new Error("Trying to put more than one object at the same "+
                        "position");
      this.inverted_object_index[this.sources[i].position] = this.sources[i];
    }
    for (var i = 0; i < this.deposits.length; ++i) {
      if (this.deposits[i].position >= this._size)
        throw new Error("Trying to put object at position greater than size");
      if (!this.inverted_object_index[this.deposits[i].position] === undefined)
        throw new Error("Trying to put more than one object at the same "+
                        "position");
      this.inverted_object_index[this.deposits[i].position] = this.deposits[i];
    }
    for (var i = 0; i < this.machines.length; ++i) {
      var object = this.machines[i].source;
      if (object.position >= this._size)
        throw new Error("Trying to put object at position greater than size");
      if (!this.inverted_object_index[object.position] === undefined)
        throw new Error("Trying to put more than one object at the same "+
                        "position");
      this.inverted_object_index[object.position] = this.machines[i];
      for (var j = 0; j < this.machines[i].deposit_list.length; ++j) {
        var object = this.machines[i].deposit_list[j];
        if (object.position >= this._size)
          throw new Error("Trying to put object at position greater than size");
        if (!this.inverted_object_index[object.position] === undefined)
          throw new Error("Trying to put more than one object at the same "+
                          "position");
        this.inverted_object_index[object.position] = this.machines[i];
      }
    }
  }
  initialize.call(this);
};

Lesson04Game.Goals = {
  FILL_EVERY_DEPOSIT: 0,
  EVERY_MACHINE_SOURCE_NOT_EMPTY: 1,
};

Lesson04Game.Error = function(code) {
  this.code = code;
};

Object.assign(Lesson04Game.Error, {
  MOVED_OUT_OF_LIMITS: 1,
  COLLECTED_FROM_EMPTY_SOURCE: 2,
  COLLECTED_FROM_NO_SOURCE:3,
  COLLECTED_WHILE_HOLDING_ITEM: 4,
  DEPOSITED_ON_INVALID_LOCATION: 5,
});

Lesson04Game.prototype = {
  // Moves the arm to the left, returning null if successful or some error
  // otherwise.
  moveLeft: function() {
    if (this.arm_pos - 1 < 0)
      return new Lesson04Game.Error(Lesson04Game.Error.MOVED_OUT_OF_LIMITS);
    --this.arm_pos;
    return null;
  },
  // Moves the arm to the right, returning null if successful or some error
  // otherwise.
  moveRight: function() {
    if (this.arm_pos + 1 >= this._size)
      return new Lesson04Game.Error(Lesson04Game.Error.MOVED_OUT_OF_LIMITS);
    ++this.arm_pos;
    return null;
  },
  // Collect from the position the arm is currently standing by, returning
  // null if successful (and transferring the item to the arm) of some error
  // otherwise.
  collect: function() {
    var source = this.inverted_object_index[this.arm_pos];
    if (!(source instanceof Source || source instanceof Machine))
      return new Lesson04Game.Error(
        Lesson04Game.Error.COLLECTED_FROM_NO_SOURCE);
    if (this.holding_item !== null)
      return new Lesson04Game.Error(
        Lesson04Game.Error.COLLECTED_WHILE_HOLDING_ITEM);
    var item = source.pop();
    if (item instanceof SourceEnd)
      return new Lesson04Game.Error(
        Lesson04Game.Error.COLLECTED_FROM_EMPTY_SOURCE);
    if (/SHIP/.test(item))
      return new Lesson04Game.Error(
        Lesson04Game.Error.COLLECTED_FROM_NO_SOURCE);
    this.holding_item = item;
    return null;
  },
  // If arm is currently standing by some source, return what would be
  // collected from it. Return null otherwise.
  peek: function() {
    var source = this.inverted_object_index[this.arm_pos];
    if (!(source instanceof Source || source instanceof Machine))
      return null;
    return source.peek();
  },
  // Deposit item into the position the arm is currently standing by, returning
  // null if successful (and transferring the item to the arm) of some error
  // otherwise.
  deposit: function() {
    var deposit = this.inverted_object_index[this.arm_pos];
    if (!(deposit instanceof Deposit || deposit instanceof Machine))
      return new Lesson04Game.Error(
        Lesson04Game.Error.DEPOSITED_ON_INVALID_LOCATION);
    var result = undefined;
    if (deposit instanceof Deposit)
      result = deposit.push(this.holding_item);
    else
      result = deposit.push(this.arm_pos, this.holding_item);
    if (result === null)
      this.holding_item = null;
    return result;
  },
  // Returns true if the game goal has been reached.
  reachedGoal: function() {
    switch (this.goal) {
      case Lesson04Game.Goals.EVERY_MACHINE_SOURCE_NOT_EMPTY:
        for (var i = 0; i < this.machines.length; ++i)
          if (this.machines[i].peek() instanceof SourceEnd)
            return false;
        return true;
      case Lesson04Game.Goals.FILL_EVERY_DEPOSIT:
        for (var i = 0; i < this.deposits.length; ++i)
          if (!this.deposits[i].isFull())
            return false;
        return true;
      default:
        throw new Error("Invalid goal for this game.");
    }
  },
  // Resets the game to its initial state.
  reset: function() {
    this.arm_pos = this._initial_arm_pos;
    this.holding_item = null;
    for (var i = 0; i < this.deposits.length; ++i)
      this.deposits[i].reset();
    for (var i = 0; i < this.sources.length; ++i)
      this.sources[i].reset()
    for (var i = 0; i < this.machines.length; ++i)
      this.machines[i].reset();
  },

  // Returns the size of the game board.
  size: function() { return this._size; },
};

var MAX_GRID_CELL_SIZE = Constants.RUN_VIEW_SQUARE_DIMENSION / 8;

var Sensors = {
  PEEK: {
    IRON: {
      item_name: "IRON",
      variable_name: "ferro",
    },
  },
  SOLID: {
    accept_list: ["IRON", "GLASS"],
    variable_name: "solido"
  },
};

// Actions supported in this lesson.
var Actions = {
  MOVE_LEFT: "L",
  MOVE_RIGHT: "R",
  GET_ITEM: "G",
  PUT_ITEM: "P",
};

// Possible runtine errors.
var FailureReasons = {
  MISSION_UNFINISHED: 1,
};

function Lesson04ExerciseStepPlayer(size, arm_pos, sources, machines,
                                    deposits, goal) {
  Lesson.LessonStepPlayer.call(this);
  this._game = new Lesson04Game(size, arm_pos, sources, machines, deposits,
                                goal);
  this._solved = false;
};

Lesson04ExerciseStepPlayer.prototype = {
  reset: function(canvas) {
    this._animator = new Animator.Animator();
    this._game.reset();
    this._initializeElements()

    if (canvas) {
      this._animator.render(canvas, 0);
    }
  },
  play: function(sourceCode) {
    this.reset();

    var interpreter = new Robolang.Interpreter();
    var compilation_errors = interpreter.parse(sourceCode);

    if (compilation_errors) {
      return {compilation_errors: compilation_errors};
    }

    var runtime_errors = this._render(interpreter);

    if (!runtime_errors.length) {
      this._solved = true;
    }

    return {
      runtime_errors: runtime_errors,
      animator: this._animator,
    };
  },
  isInAcceptingState: function() {
    return this._solved;
  },
  _initializeElements: function() {
    this.grid_cell_size = Math.min(MAX_GRID_CELL_SIZE,
      Constants.RUN_VIEW_SQUARE_DIMENSION / this._game.size());
    var grid_cell_size = this.grid_cell_size;

    var background = ElementFactories.createSpaceshipFactoryBackground(
        "background",
        Constants.RUN_VIEW_SQUARE_DIMENSION,
        Constants.RUN_VIEW_SQUARE_DIMENSION
        );
    background.x = Constants.RUN_VIEW_SQUARE_DIMENSION / 2;
    background.y = Constants.RUN_VIEW_SQUARE_DIMENSION / 2;
    this._animator.addElement(background);

    var grid = new Animator.SimpleGridElement(
        "grid", Constants.RUN_VIEW_SQUARE_DIMENSION, 1,
         grid_cell_size, this._game.size());
    this._animator.addElement(grid);
    this._arm = ElementFactories.createRoboticArm(
        "arm",
        grid_cell_size, 3 * grid_cell_size);
    this._arm.x = (0.5 + this._game.arm_pos) * grid_cell_size;
    this._arm.y = 7 * grid_cell_size;
    this._animator.addElement(this._arm);
    this._animator.addAnimation(this._arm.createAnimation(
                                    "move_right", 0, 0, 1));
    for (var i = 0; i < this._game.deposits.length; ++i) {
      var component = this._game.deposits[i];
      var item_type = Object.keys(component.accepted_types)[0];
      var element = ElementFactories.future_createDeposit(
            "d_" + component.position,
            Object.keys(component.accepted_types)
              .map(function(key) { return component.accepted_types[key] })
              .reduce(function(a, b){ return a + b; }),
            item_type,
            grid_cell_size, 5*grid_cell_size);
      element.x = (0.5 + component.position) * grid_cell_size;
      element.y = 4 * grid_cell_size;
      this._animator.addElement(element);
      this._animator.addAnimation(element.changeStyle(item_type, 0));
      this._animator.addAnimation(element.createAnimation(
            "fill_0",
            0, 0, 1));
    }
    for (var i = 0; i < this._game.sources.length; ++i) {
      var component = this._game.sources[i];
      var element = ElementFactories.createSource(
            "s_" + component.position,
            grid_cell_size, 3 * grid_cell_size);
      element.x = (0.5 + component.position) * grid_cell_size;
      element.y = 5 * grid_cell_size;
      this._animator.addElement(element);
      if (component.peek() instanceof SourceEnd)
        this._animator.addAnimation(element.createAnimation(
          "source_of_nothing", 0, 0, 1));
      else
        this._animator.addAnimation(element.createAnimation(
          "source_of_" + component.peek().toLowerCase(), 0, 0, 1));
    }
    for (var i = 0; i < this._game.machines.length; ++i) {
      for (var j = 0; j < this._game.machines[i].deposit_list.length; ++j) {
        var component = this._game.machines[i].deposit_list[j];
        var item_type = Object.keys(component.accepted_types)[0];
        var element = ElementFactories.future_createDeposit(
              "d_" + component.position,
              Object.keys(component.accepted_types)
                .map(function(key) { return component.accepted_types[key] })
                .reduce(function(a, b){ return a + b; }),
              item_type,
              grid_cell_size, 5*grid_cell_size);
        element.x = (0.5 + component.position) * grid_cell_size;
        element.y = 4 * grid_cell_size;
        this._animator.addElement(element);
        this._animator.addAnimation(element.changeStyle(item_type, 0));
        this._animator.addAnimation(element.createAnimation(
              "fill_0",
              0, 0, 1));
      }
      var element = ElementFactories.createSource(
            "s_" + this._game.machines[i].source.position,
            grid_cell_size, 3 * grid_cell_size);
      element.x = (0.5 + this._game.machines[i].source.position) *
                   grid_cell_size;
      element.y = 5 * grid_cell_size;
      this._animator.addElement(element);
      if (this._game.machines[i].source.peek() instanceof SourceEnd)
        this._animator.addAnimation(element.createAnimation(
          "source_of_nothing", 0, 0, 1));
      else
        this._animator.addAnimation(element.createAnimation(
          "source_of_" + this._game.machines[i].source.peek().toLowerCase(), 0, 0, 1));
    }
  },
  // Updates the values of the robot sensor variables to reflect the current
  // state of the game.
  _updateSensors: function(scope) {
    for (var sensor in Sensors.PEEK) {
      scope.set(Sensors.PEEK[sensor].variable_name,
                this._game.peek() === Sensors.PEEK[sensor].item_name);
    }
    scope.set(
      Sensors.SOLID.variable_name,
      Sensors.SOLID.accept_list.indexOf(this._game.peek()) !== -1);
  },

  // Parses an action literal into a value from Actions.
  // Returns null if the action is unknown.
  _parseAction: function(literal) {
    for (var action in Actions) {
      if (Actions.hasOwnProperty(action)) {
        if (Actions[action] == literal) {
          return action;
        }
      }
    }
    return null;
  },
  _render: function(interpreter) {
    var grid_cell_size = this.grid_cell_size;
    var failure_reason = null;

    this._updateSensors(interpreter.getGlobalScope());

    for (var action_literal = interpreter.runUntilNextAction(), i = 0;
         !!action_literal;
         action_literal = interpreter.runUntilNextAction(), i++) {
      var player_action = action_literal;

      // Processes action.
      switch (player_action) {
        case Actions.MOVE_LEFT:
          failure_reason = this._game.moveLeft();
          break;

        case Actions.MOVE_RIGHT:
          failure_reason = this._game.moveRight();
          break;

        case Actions.GET_ITEM:
          failure_reason = this._game.collect();
          break;

        case Actions.PUT_ITEM:
          failure_reason = this._game.deposit();
          break;

        default:
          failure_reason = "Unknown action " + action_literal;
      }

      // Create animations corresponding to the executed action.
      switch (player_action) {
        // Make robot turn left/right.
        case Actions.MOVE_LEFT:
          this._animator.addAnimation(AnimationFactories.straightMove(
                'arm',
                i,
                i + 1,
                -grid_cell_size, 0));

          this._animator.addAnimation(this._arm.createAnimation(
                                          "move_left", i, i + 1, 1));
          break;
        case Actions.MOVE_RIGHT:
          this._animator.addAnimation(AnimationFactories.straightMove(
                'arm',
                i,
                i + 1,
                grid_cell_size, 0));

          this._animator.addAnimation(this._arm.createAnimation(
                                          "move_right", i, i + 1, 1));
          break;
        case Actions.GET_ITEM:
          this._animator.addAnimation(this._arm.createAnimation(
                                          "move_up", i, i + 0.5 , 0.5));

          if (this._game.holding_item) {
            var item_to_style = {
                "IRON": ElementFactories.ROBOTIC_ARM_HOLDING_IRON_STYLE,
                "GLASS": ElementFactories.ROBOTIC_ARM_HOLDING_GLASS_STYLE,
                "FUEL": ElementFactories.ROBOTIC_ARM_HOLDING_FUEL_STYLE
                };
            var style = item_to_style[this._game.holding_item];
            this._animator.addAnimation(this._arm.changeStyle(
                                            style,
                                            i + 0.5));
          }

          this._animator.addAnimation(this._arm.createAnimation(
                                          "move_down", i + 0.5, i + 1, 0.5));

          if (this._animator.elements.hasOwnProperty("s_" + this._game.arm_pos)) {
            var element = this._animator.elements["s_" + this._game.arm_pos];
            var component = this._game.inverted_object_index[this._game.arm_pos];
            if (component.peek() instanceof SourceEnd)
              this._animator.addAnimation(
                element.createAnimation(
                  "source_of_nothing", i + 0.75, i + 0.75, 1));
            else
              this._animator.addAnimation(
                element.createAnimation(
                  "source_of_" + component.peek().toLowerCase(), i + 0.75, i + 0.75, 1));
          }
          break;
        case Actions.PUT_ITEM:
          this._animator.addAnimation(this._arm.createAnimation(
                                          "move_up", i, i + 0.5, 0.5));

          if (!failure_reason) {
            this._animator.addAnimation(this._arm.changeStyle(
                                            "default",
                                            i + 0.5));
          }

          this._animator.addAnimation(this._arm.createAnimation(
                                          "move_down", i + 0.5, i + 1, 0.5));
          console.log("arm_pos: ", this._game.arm_pos);
          console.log(Object.keys(this._animator.elements));
          if (this._animator.elements.hasOwnProperty('d_' + this._game.arm_pos)) {
            var component = this._game.inverted_object_index[this._game.arm_pos];
            if (component instanceof Machine) {
              for (var j = 0; j < component.deposit_list.length; ++j) {
                var sub_deposit = component.deposit_list[j];
                var item_type = Object.keys(sub_deposit.accepted_types)[0];
                this._animator.addAnimation(
                  this._animator.elements["d_" + sub_deposit.position].createAnimation(
                    'fill_' + (sub_deposit.accepted_types[item_type] - sub_deposit.capacity[item_type]),
                    i + 0.75, i + 0.75, 1
                  )
                );
              }
              var element = this._animator.elements["s_" + component.source.position];
              if (component.source.peek() instanceof SourceEnd)
                this._animator.addAnimation(
                  element.createAnimation(
                    "source_of_nothing", i + 0.75, i + 0.75, 1));
              else
                this._animator.addAnimation(
                  element.createAnimation(
                    "source_of_" + component.peek().toLowerCase(), i + 0.75, i + 0.75, 1));
            } else {
              var deposit = component;
              var item_type = Object.keys(deposit.accepted_types)[0];
              console.log("item_type: ", item_type);
              this._animator.addAnimation(
                this._animator.elements["d_" + this._game.arm_pos].createAnimation(
                  'fill_' + (deposit.accepted_types[item_type] - deposit.capacity[item_type]),
                  i + 0.75, i + 0.75, 1
                )
              );
            }
          }
          break;
      }

      if (!!failure_reason){
        i++;
        break;
      }

      this._updateSensors(interpreter.getGlobalScope());
    }

    this._animator.addAnimation(this._arm.createAnimation(
                                    "move_left", i, i, 1));

    if (!failure_reason && !this._game.reachedGoal()) {
      failure_reason = FailureReasons.MISSION_UNFINISHED;
    }

    if (!failure_reason)
      return [];

    if (failure_reason instanceof Lesson04Game.Error) {
      switch (failure_reason.code) {
        case Lesson04Game.Error.MOVED_OUT_OF_LIMITS:
          return [Constants.Lesson04.MOVED_OUT_OF_LIMITS];
        case Lesson04Game.Error.COLLECTED_FROM_EMPTY_SOURCE:
          return [Constants.Lesson04.COLLECTED_FROM_EMPTY_SOURCE];
        case Lesson04Game.Error.COLLECTED_FROM_NO_SOURCE:
          return [Constants.Lesson04.COLLECTED_FROM_NO_SOURCE];
        case Lesson04Game.Error.COLLECTED_WHILE_HOLDING_ITEM:
          return [Constants.Lesson04.COLLECTED_WHILE_HOLDING_ITEM];
        case Lesson04Game.Error.DEPOSITED_ON_INVALID_LOCATION:
          return [Constants.Lesson04.DEPOSITED_ON_INVALID_LOCATION];
        default:
          throw "Unknown failure reason " + failure_reason;
      }
    } else if (failure_reason instanceof Deposit.Error) {
      switch (failure_reason.code) {
        case Deposit.Error.ITEM_TYPE_NOT_ACCEPTED:
          return [Constants.Lesson04.ITEM_TYPE_NOT_ACCEPTED];
        case Deposit.Error.CAPACITY_EXCEEDED:
          return [Constants.Lesson04.CAPACITY_EXCEEDED];
        case Deposit.Error.NOTHING_TO_DEPOSIT:
          return [Constants.Lesson04.NOTHING_TO_DEPOSIT];
        default:
          throw "Unknown failure reason " + failure_reason;
      }
    } else if (failure_reason instanceof Machine.Error) {
      switch (failure_reason.code) {
        case Machine.Error.INVALID_DEPOSIT_POSITION:
          return [Constants.Lesson04.INVALID_DEPOSIT_POSITION];
        default:
          throw "Unknown failure reason " + failure_reason;
      }
    } else if (failure_reason === FailureReasons.MISSION_UNFINISHED) {
      return [Constants.Lesson04.MISSION_UNFINISHED];
    } else {
      throw "Unknown failure reason " + failure_reason;
    }
  },
}


function Lesson04() {
  Lesson.Lesson.call(this);

  var commandsReference = [Constants.References.MOVE_ARM_LEFT,
                           Constants.References.MOVE_ARM_RIGHT,
                           Constants.References.GET_MATERIAL,
                           Constants.References.PUT_MATERIAL];

  // Step 1
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Movimente o braço mecânico para levar a placa de vidro em seu
        respectivo depósito.
      </p>,
      <div>
        <p>
          Agora que todas as máquinas na nossa base estão funcionando
          novamente, podemos usá-las para construir uma nave espacial para o
          robô escapar do planeta antes da próxima chuva de meteoros, que
          poderá destruir nossa base.
        </p>
        <p>
          A missão do robô é operar as máquinas
          da base para construir peças que serão utilizadas para montar a
          nave. Porém, antes de construir as peças, é preciso coletar a
          matéria prima necessária.
        </p>
        <p>
          Nesta primeira etapa, existe uma placa de
          vidro que deve ser colocada no depósito de vidro para ser usada
          posteriormente. Para realizar essa tarefa, você deve escrever um
          programa que controle o braço robótico.
        </p>
        <p>
          O braço robótico se movimenta apenas horizontalmente.
          Os comandos <b>L</b> e <b>R</b> fazem
          com que o braço se mova para a esquerda e para a direita,
          respectivamente. O comando <b>W</b> faz com que o braço fique parado.
          Os comandos <b>G</b> e <b>P</b> fazem com que o braço pegue o que estiver
          na sua frente ou largue o que estiver carregando, respectivamente.
        </p>
      </div>,
      commandsReference,
      new Lesson04ExerciseStepPlayer(
        5,
        2,
        [SourceFactory(4, 1, SourceType.RANDOM_FROM_SET, {item_set: ["GLASS"]})],
        [],
        [new Deposit(0, {GLASS: 1})]
      ),
      "",  // initialCode
      Constants.Lesson04.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 2
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Movimente o braço mecânico para coletar ferro e depositá-lo em seu
        respectivo depósito.
      </p>,
      <div>
        <p>
          Para construir a nave, precisaremos de muito ferro. Nesta etapa,
          existe uma fonte que produz blocos de ferro que devem ser colocados
          no depósito. A fonte produzirá três blocos de ferro. Assim que um
          bloco ferro for pego, outro surgirá na fonte.
        </p>
      </div>,
      commandsReference,
      new Lesson04ExerciseStepPlayer(
        5,
        2,
        [SourceFactory(4, 3, SourceType.RANDOM_FROM_SET, {item_set: ["IRON"]})],
        [],
        [new Deposit(0, {IRON: 3})]
      ),
      "",  // initialCode
      Constants.Lesson04.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 3
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Movimente o braço mecânico para coletar combustível e depositá-lo em seu
        respectivo depósito.
      </p>,
      <div>
        <p>
          Além de ferro e vidro, uma nave precisa de combustível para
          funcionar. Colete 2 galões de combustível e coloque no depósito.
        </p>
      </div>,
      commandsReference,
      new Lesson04ExerciseStepPlayer(
        5,
        2,
        [SourceFactory(4, 2, SourceType.RANDOM_FROM_SET, {item_set: ["FUEL"]})],
        [],
        [new Deposit(0, {FUEL: 2})]
      ),
      "",  // initialCode
      Constants.Lesson04.SUCCESS_MESSAGE,
      null
    )
  );

  commandsReference =
    commandsReference.concat([Constants.References.IRON_SENSOR]);

  // Step 4
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Movimente o braço mecânico para coletar os materiais e depositá-los em seus
        respectivos depósitos.
      </p>,
      <div>
      <p>
      A última chuva de meteoros danificou algumas tubulações da nossa
      base, e, por isso, tipos de materiais diferentes foram misturados.
      Por exemplo, temos uma fonte que produz ferro e vidro.
      </p>
      <p>
      A tarefa do
      robô é separar os materiais e encher o depósito de ferro com 2
      blocos de ferro e o depósito de vidro com 2 placas de vidro.
      Felizmente, o braço robótico está equipado com um sensor chamado
      <b>ferro</b> capaz de determinar se ele está segurando um bloco de ferro.
      </p>
      <p>
      Lembra-se de condicionais? Com esse sensor, você pode escrever um código
      que apenas executa se o material que o braço estiver segurando for ferro.
      Por exemplo: <b>ferro? {"{ LL P RR }"}</b> executará <b>LL P RR</b> apenas
      no caso de o braço estar segurando ferro.
      </p>
      </div>,
      commandsReference,
      new Lesson04ExerciseStepPlayer(
        5,
        3,
        [SourceFactory(4, 4, SourceType.FROM_LIST, {item_list: ["GLASS", "IRON"]})],
        [],
        [new Deposit(0, {IRON: 2}), new Deposit(2, {GLASS: 2})]
      ),
      "",  // initialCode
      Constants.Lesson04.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 5
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Movimente o braço mecânico para coletar os materiais e depositá-los em seus
        respectivos depósitos.
      </p>,
      <div>
      <p>
      Desta vez, um galão de combustível foi parar em uma fonte de ferro.
      O robô deve colocar 3 blocos de ferro no depósito de ferro e 1
      galão de combustível no depósito de combustível.
      </p>
      </div>,
      commandsReference,
      new Lesson04ExerciseStepPlayer(
        5,
        3,
        [SourceFactory(4, 4, SourceType.FROM_LIST,
                       {item_list: ["IRON", "IRON", "FUEL", "IRON"]})],
        [],
        [new Deposit(0, {FUEL: 1}), new Deposit(2, {IRON: 3})]
      ),
      "",  // initialCode
      Constants.Lesson04.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 6
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Movimente o braço mecânico para coletar os materiais e depositá-los em seus
        respectivos depósitos.
      </p>,
      <div>
      <p>
      Agora, temos uma fonte que produz vidro e combustível. Porém, o
      braço robótico não é capaz de detectar diretamente se está
      segurando vidro ou se está segurando combustível. Felizmente, ele
      consegue determinar, por meio do sensor chamado sólido, se ele está
      segurando algo sólido. Como o vidro está no estado sólido e o
      combustível não está, podemos usar essa informação para separar
      vidro de combustível e armazenar 2 placas de vidro no depósito de
      vidro e 2 galões de combustível no depósito de combustível.
      </p>
      </div>,
      commandsReference,
      new Lesson04ExerciseStepPlayer(
        5,
        3,
        [SourceFactory(4, 4, SourceType.FROM_LIST,
                       {item_list: ["FUEL", "GLASS", "GLASS", "FUEL"]})],
        [],
        [new Deposit(0, {GLASS: 2}), new Deposit(2, {FUEL: 2})]
      ),
      "",  // initialCode
      Constants.Lesson04.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 7
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Movimente o braço mecânico para coletar os materiais e depositá-los em seus
        respectivos depósitos.
      </p>,
      <div>
      <p>
      Chegou a hora de organizar as matérias primas da última fonte, que
      está uma bagunça! Nela, temos vidro, ferro e combustível. O robô
      deve colocar duas unidades de cada um dos materiais nos depósitos
      corretos. Depois disso, o robô poderá começar a construção da nave.
      </p>
      </div>,
      commandsReference,
      new Lesson04ExerciseStepPlayer(
        5,
        3,
        [SourceFactory(4, 6, SourceType.FROM_LIST,
                       {item_list: ["IRON", "GLASS", "FUEL",
                                    "GLASS", "FUEL", "IRON"]})],
        [],
        [new Deposit(0, {IRON: 2}), new Deposit(1, {GLASS: 2}),
         new Deposit(2, {FUEL: 2})]
      ),
      "",  // initialCode
      Constants.Lesson04.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 8
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Movimente o braço mecânico para coletar os materiais e depositá-los em seus
        respectivos depósitos.
      </p>,
      <div>
      <p>
      Agora que temos toda a matéria prima organizada, podemos
      começar a construir as partes da nave. Primeiro, vamos produzir a
      frente da nave. Temos uma máquina que é capaz de construir a frente
      de uma nave a partir de 3 blocos de ferro.
      </p>
      </div>,
      commandsReference,
      new Lesson04ExerciseStepPlayer(
        4,
        2,
        [SourceFactory(3, 3, SourceType.RANDOM_FROM_SET,
                       {item_set: ["IRON"]})],
        [new Machine(
          [new Deposit(1, {IRON: 3})],
          0,
          "SHIP_HEAD")],
        [],
        Lesson04Game.Goals.EVERY_MACHINE_SOURCE_NOT_EMPTY
      ),
      "",  // initialCode
      Constants.Lesson04.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 9
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Movimente o braço mecânico para coletar os materiais e depositá-los em seus
        respectivos depósitos.
      </p>,
      <div>
      <p>
        A segunda parte da nave que iremos produzir é a do meio. Essa
      parte precisa de 3 blocos de ferro para a formar a sua estrutura e
      2 placas de vidro para a janela.
      </p>
      <p>
        Assim como no caso da primeira
      parte, temos uma máquina capaz de realizar a produção. A
      função do robô é apenas fornecer a matéria prima necessária.
      </p>
      <p>
        Lembre-se que a matéria prima já foi devidamente separada e,
      por isso, cada fonte tem agora um único tipo de material.
      </p>
      </div>,
      commandsReference,
      new Lesson04ExerciseStepPlayer(
        6,
        3,
        [SourceFactory(5, 3, SourceType.RANDOM_FROM_SET,
                       {item_set: ["IRON"]}),
         SourceFactory(4, 2, SourceType.RANDOM_FROM_SET,
                       {item_set: ["GLASS"]})],
        [new Machine(
          [new Deposit(1, {IRON: 3}), new Deposit(2, {GLASS: 2})],
          0,
          "SHIP_BODY")],
        [],
        Lesson04Game.Goals.EVERY_MACHINE_SOURCE_NOT_EMPTY
      ),
      "",  // initialCode
      Constants.Lesson04.SUCCESS_MESSAGE,
      null
    )
  );

  // Step 10
  this.addStep(
    new Lesson.LessonStep(
      <p>
        Movimente o braço mecânico para coletar os materiais e depositá-los em seus
        respectivos depósitos.
      </p>,
      <div>
      <p>
        Finalmente, chegou a hora de produzir a terceira e última parte
      da nave: a parte de baixo. É nessa parte que se encontra o
      motor da nave. Por isso, para construí-la, são necessários 2
      blocos de ferro e 4 galões de combustível.
      </p>
      </div>,
      commandsReference,
      new Lesson04ExerciseStepPlayer(
        6,
        3,
        [SourceFactory(4, 4, SourceType.RANDOM_FROM_SET,
                       {item_set: ["FUEL"]}),
         SourceFactory(5, 2, SourceType.RANDOM_FROM_SET,
                       {item_set: ["IRON"]})],
        [new Machine(
          [new Deposit(1, {FUEL: 4}), new Deposit(2, {IRON: 2})],
          0,
          "SHIP_TAIL")],
        [],
        Lesson04Game.Goals.EVERY_MACHINE_SOURCE_NOT_EMPTY
      ),
      "",  // initialCode
      Constants.Lesson04.SUCCESS_MESSAGE,
      null
    )
  );
};

Lesson04.prototype = Object.create(Lesson.Lesson.prototype);
Object.assign(Lesson04.prototype, {
  populateResourceLoader: function() {
    ResourceLoader.addImage(ElementFactories.SOURCE_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.IRON_DEPOSIT_URL);
    ResourceLoader.addImage(ElementFactories.GLASS_DEPOSIT_URL);
    ResourceLoader.addImage(ElementFactories.FUEL_DEPOSIT_URL);
    ResourceLoader.addImage(ElementFactories.ROBOTIC_ARM_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.ROBOTIC_ARM_HOLDING_IRON_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.ROBOTIC_ARM_HOLDING_GLASS_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.ROBOTIC_ARM_HOLDING_FUEL_IMAGE_URL);
    ResourceLoader.addImage(ElementFactories.SPACESHIP_FACTORY_BACKGROUND_URL);
  },
});
module.exports = {Lesson04: Lesson04,
                  Lesson04ExerciseStepPlayer: Lesson04ExerciseStepPlayer,
                  Lesson04Game: Lesson04Game,
                  SourceEnd: SourceEnd,
                  Source: Source,
                  SourceFactory: SourceFactory,
                  Deposit: Deposit,
                  Machine: Machine};
