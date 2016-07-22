/*
 * Grid and movement representation, useful for several lessons.
 */

function Position(row, column) {
  this.row = row || 0;
  this.column = column || 0;
}

var PositionDelta = Position;

Position.prototype = {
  add: function(delta) {
    return new Position(this.row + delta.row, this.column + delta.column);
  },

  copy: function() {
    return new Position(this.row, this.column);
  }
};

function Grid(n_rows, n_cols) {
  this._matrix = new Array();
  this._matrix.length = n_rows;
  for (var i = 0; i < n_rows; i++) {
    this._matrix[i] = new Array();
    this._matrix[i].length = n_cols;
    for (var j = 0; j < n_cols; j++) {
      this._matrix[i][j] = null;
    }
  }
}

Grid.prototype = {
  get: function(row, column) {
    return this._matrix[row][column];
  },

  set: function(row, column, element) {
    this._matrix[row][column] = element;
  },

  rows: function() {
    return this._matrix.length;
  },

  columns: function() {
    if (this.rows() === 0) {
      return 0;
    }
    return this._matrix[0].length;
  },

  valid: function(row, column) {
    return (0 <= row && row < this.rows() &&
            0 <= column && column < this.columns());
  },
};

var Directions = {
  UP: new PositionDelta(-1, 0),
  DOWN: new PositionDelta(1, 0),
  LEFT: new PositionDelta(0, -1),
  RIGHT: new PositionDelta(0, 1),
};

function turnLeft(direction) {
  if (direction === Directions.UP) {
    return Directions.LEFT;
  } else if (direction === Directions.LEFT) {
    return Directions.DOWN;
  } else if (direction === Directions.DOWN) {
    return Directions.RIGHT;
  } else if (direction === Directions.RIGHT) {
    return Directions.UP;
  }
}

function turnRight(direction) {
  if (direction === Directions.UP) {
    return Directions.RIGHT;
  } else if (direction === Directions.RIGHT) {
    return Directions.DOWN;
  } else if (direction === Directions.DOWN) {
    return Directions.LEFT;
  } else if (direction === Directions.LEFT) {
    return Directions.UP;
  }
}

function directionName(direction) {
   if (direction === Directions.UP) {
    return "up";
  } else if (direction === Directions.RIGHT) {
    return "right";
  } else if (direction === Directions.DOWN) {
    return "down";
  } else if (direction === Directions.LEFT) {
    return "left";
  }
}

module.exports = {
  Grid: Grid,
  Position: Position,
  PositionDelta: PositionDelta,
  Directions: Directions,
  turnLeft: turnLeft,
  turnRight: turnRight,
  directionName: directionName,
};
