/*
 * Syntactic analyzer for Robolang.
 */

var Lexer = require("./lexer");
var T = require("../../util/translate").T;
var sprintf = require("sprintf-js").sprintf;

/// A ParsingContext contains information that is kept during parsing and
/// that aids in validating and generating errors.
function ParsingContext(actions, sensors) {
  this._actions = actions || [];
  this._sensors = sensors || [];
}

Object.assign(ParsingContext.prototype, {
  isActionSupported: function(action) {
    return this._actions.indexOf(action) != -1;
  },
  isSensorSupported: function(sensor) {
    return this._sensors.indexOf(sensor) != -1;
  },
  supportedActions: function() {
    return this._actions;
  },
  supportedSensors: function() {
    return this._sensors;
  },
});

var ParseErrorTypes = {
  // Action not supported.
  INVALID_ACTION: 1,
  // Sensor not declared.
  INVALID_SENSOR: 2,
  // Missing '}'.
  MISSING_BLOCK_TERMINATOR: 3,
  // No suitable language construct found.
  UNKNOWN_CONSTRUCT: 4,
};

/// Immutable representation of errors generated during parsing.
function ParseError(type, message, range) {
  return {
    type: type,
    message: message,
    range: range,
  };
}

/// Language constructs.
var ASTNodeTypes = {
  ACTION: {name: "Action"},
  BLOCK: {name: "Block"},
  LOOP: {name: "Loop"},
  PROGRAM: {name: "Program"},
  CONDITIONAL: {name: "Conditional"},
  CONDITIONAL_LOOP: {name: "Conditional Loop"},
};

/// Represents one node of the Abstract Syntax Tree.
function ASTNode(type) {
  this.type = type;
  this.children = [];
  this.attributes = {};
  this.location = null;
}

ASTNode.prototype = {
  type: null,
  children: null,
  attributes: null,
  location: null,

  toString: function() {
    var repr = "";
    if (this.type === ASTNodeTypes.ACTION) {
      repr += "ACTION(" + this.attributes.action + ")";
    } else if (this.type === ASTNodeTypes.BLOCK) {
      repr += "BLOCK";
    } else if (this.type === ASTNodeTypes.LOOP) {
      repr += "LOOP(" + this.attributes.tripCount + ")";
    } else if (this.type === ASTNodeTypes.PROGRAM) {
      repr += "PROGRAM";
    } else {
      repr += "UNKNOWN";
    }

    if (this.children.length > 0) {
      repr += "{ ";
      for (var i = 0; i < this.children.length; ++i) {
        repr += this.children[i].toString() + " ";
      }
      repr += "}";
    }

    return repr;
  },
};

/// Base class for a parser of one node type.
function ASTNodeParser(context) {
  this._context = context;
}

ASTNodeParser.prototype = {
  /// Returns true if this parser recognizes the upcoming construct to be one
  /// of the type it knows how to parse.
  lookahead: function(parserState) {
    throw "Not implemented.";
  },
  /// Parses the next construct of the program and returns an AST node that
  /// represents it.
  parse: function(parserState) {
    throw "Not implemented.";
  },
};

/// List of all specific node parser types.
ASTNodeParser.nodeParsers = [];

/// Discover the type of AST node adequate to the following construct and parses
/// it using the appropriate parser.
function ASTGeneralNodeParser(context) {
  ASTNodeParser.call(this, context);
}

ASTGeneralNodeParser.prototype = Object.create(ASTNodeParser.prototype);
Object.assign(ASTGeneralNodeParser.prototype, {
  /// Returns true if any of the parsers recognizes the upcoming construct.
  lookahead: function(parserState) {
    for (var i = 0; i < ASTNodeParser.nodeParsers.length; ++i) {
      var parser = new ASTNodeParser.nodeParsers[i](this._context);
      if (parser.lookahead(parserState)) {
        return true;
      }
    }
    return false;
  },
  /// Finds the appropriate parser and uses it.
  parse: function(parserState) {
    for (var i = 0; i < ASTNodeParser.nodeParsers.length; ++i) {
      var parser = new ASTNodeParser.nodeParsers[i](this._context);
      if (parser.lookahead(parserState)) {
        return parser.parse(parserState);
      }
    }
    throw "No suitable parser found.";
  },
});

function ASTProgramNodeParser(context, topLevel) {
  ASTNodeParser.call(this, context);
  this._topLevel = topLevel || (topLevel === undefined);
}
ASTProgramNodeParser.prototype = Object.create(ASTNodeParser.prototype);
Object.assign(ASTProgramNodeParser.prototype, {
  lookahead: function(parserState) {
    return parserState.lookahead().type == Lexer.TokenTypes.BEGIN_BLOCK;
  },

  parse: function(parserState) {
    var node = new ASTNode(ASTNodeTypes.PROGRAM);
    var before = parserState.nextTokenLocation();
    var parser = new ASTGeneralNodeParser(this._context);

    while (!parserState.programEnded() && parser.lookahead(parserState)) {
      node.children.push(parser.parse(parserState));
    }

    if (this._topLevel && !parserState.programEnded()) {
      var nextToken = parserState.lookahead();
      var message = sprintf(T("Código não entendido na linguagem dos robôs: %s"),
                            nextToken.toString());
      throw ParseError(ParseErrorTypes.UNKNOWN_CONSTRUCT,
                       message,
                       nextToken.location);
    }

    var after = parserState.currentLocation();

    if (before && after) {
      node.location = new Lexer.SourceCodeRange(before, after);
    }

    return node;
  },
});


function ASTBlockNodeParser(context) {
  ASTNodeParser.call(this, context);
}
ASTBlockNodeParser.prototype = Object.create(ASTNodeParser.prototype);
Object.assign(ASTBlockNodeParser.prototype, {
  lookahead: function(parserState) {
    return parserState.lookahead().type == Lexer.TokenTypes.BEGIN_BLOCK;
  },

  parse: function(parserState) {
    var node = new ASTNode(ASTNodeTypes.BLOCK);
    var before = parserState.nextTokenLocation();
    parserState.consumeToken(Lexer.TokenTypes.BEGIN_BLOCK);
    node.children.push(new ASTProgramNodeParser(this._context, false).parse(parserState));

    if (!(parserState.lookahead() &&
          parserState.lookahead().type === Lexer.TokenTypes.END_BLOCK)) {
      throw ParseError(ParseErrorTypes.MISSING_BLOCK_TERMINATOR,
                       sprintf(T("Você se esqueceu de fechar o bloco com um '%s'."),
                               Lexer.END_BLOCK_TOKEN),
                       new Lexer.SourceCodeRange(
                         before, parserState.currentLocation()));
    }
    parserState.consumeToken(Lexer.TokenTypes.END_BLOCK);

    var after = parserState.currentLocation();
    if (before && after) {
      node.location = new Lexer.SourceCodeRange(before, after);
    }
    return node;
  },
});

ASTNodeParser.nodeParsers.push(ASTBlockNodeParser);

function ASTLoopNodeParser(context) {
  ASTNodeParser.call(this, context);
}
ASTLoopNodeParser.prototype = Object.create(ASTNodeParser.prototype);
Object.assign(ASTLoopNodeParser.prototype, {
  lookahead: function(parserState) {
    return parserState.lookahead().type === Lexer.TokenTypes.INTEGER;
  },

  parse: function(parserState) {
    var node = new ASTNode(ASTNodeTypes.LOOP);
    var before = parserState.nextTokenLocation();
    node.attributes.tripCount =
        parserState.consumeToken(Lexer.TokenTypes.INTEGER).value;
    node.children.push(new ASTBlockNodeParser(this._context).parse(parserState));
    var after = parserState.currentLocation();
    if (before && after) {
      node.location = new Lexer.SourceCodeRange(before, after);
    }
    return node;
  },
});

ASTNodeParser.nodeParsers.push(ASTLoopNodeParser);

function ASTConditionalNodeParser(context) {
  ASTNodeParser.call(this, context);
}
ASTConditionalNodeParser.prototype = Object.create(ASTNodeParser.prototype);
Object.assign(ASTConditionalNodeParser.prototype, {
  lookahead: function(parserState) {
    return parserState.lookahead() &&
           parserState.lookahead().type === Lexer.TokenTypes.IF_KEYWORD;
  },

  parse: function(parserState) {
    var node = new ASTNode(ASTNodeTypes.CONDITIONAL);
    var before = parserState.nextTokenLocation();
    parserState.consumeToken(Lexer.TokenTypes.IF_KEYWORD);
    var variableToken = parserState.consumeToken(Lexer.TokenTypes.IDENTIFIER);
    node.attributes.variable = variableToken.value;

    if (!this._context.isSensorSupported(node.attributes.variable)) {
      var m = T("Sensor desconhecido: %s. Os sensores que o robô conhece são: %s.");
      var knownSensors = this._context.supportedSensors().join(", ");

      throw ParseError(ParseErrorTypes.INVALID_SENSOR,
                       sprintf(m, node.attributes.variable, knownSensors),
                       variableToken.location);
    }

    node.children.push(new ASTBlockNodeParser(this._context).parse(parserState));

    if (parserState.lookahead() &&
        parserState.lookahead().type === Lexer.TokenTypes.ELSE_KEYWORD) {
      parserState.consumeToken(Lexer.TokenTypes.ELSE_KEYWORD);
      node.children.push(new ASTBlockNodeParser(this._context).parse(parserState));
    }
    var after = parserState.currentLocation();
    if (before && after) {
      node.location = new Lexer.SourceCodeRange(before, after);
    }
    return node;
  },
});

ASTNodeParser.nodeParsers.push(ASTConditionalNodeParser);

function ASTActionNodeParser(context) {
  ASTNodeParser.call(this, context);
}
ASTActionNodeParser.prototype = Object.create(ASTNodeParser.prototype);
Object.assign(ASTActionNodeParser.prototype, {
  lookahead: function(parserState) {
    return parserState.lookahead().type === Lexer.TokenTypes.ACTION_IDENTIFIER;
  },

  parse: function(parserState) {
    var node = new ASTNode(ASTNodeTypes.ACTION);
    var before = parserState.nextTokenLocation();
    var actionToken = parserState.consumeToken(Lexer.TokenTypes.ACTION_IDENTIFIER)
    node.attributes.action = actionToken.value;
    var after = parserState.currentLocation();
    if (before && after) {
      node.location = new Lexer.SourceCodeRange(before, after);
    }

    if (!this._context.isActionSupported(node.attributes.action)) {
      var m = T("Ação desconhecida: %s. As ações que o robô conhece são: %s.");
      var knownActions = this._context.supportedActions().join(", ");
      throw ParseError(ParseErrorTypes.INVALID_ACTION,
                       sprintf(m, node.attributes.action, knownActions),
                       actionToken.location);
    }

    return node;
  },
});

ASTNodeParser.nodeParsers.push(ASTActionNodeParser);

function ASTConditionalLoopNodeParser(context) {
  ASTNodeParser.call(this, context);
}
ASTConditionalLoopNodeParser.prototype = Object.create(ASTNodeParser.prototype);
Object.assign(ASTConditionalLoopNodeParser.prototype, {
  lookahead: function(parserState) {
    return parserState.lookahead() &&
           parserState.lookahead().type === Lexer.TokenTypes.CONDITIONAL_LOOP_KEYWORD;
  },

  parse: function(parserState) {
    var node = new ASTNode(ASTNodeTypes.CONDITIONAL_LOOP);
    var before = parserState.nextTokenLocation();
    parserState.consumeToken(Lexer.TokenTypes.CONDITIONAL_LOOP_KEYWORD);
    var variableToken = parserState.consumeToken(Lexer.TokenTypes.IDENTIFIER);
    node.attributes.variable = variableToken.value;
    node.children.push(new ASTBlockNodeParser(this._context).parse(parserState));

    if (!this._context.isSensorSupported(node.attributes.variable)) {
      var m = T("Sensor desconhecido: %s. Os sensores que o robô conhece são: %s.");
      var knownSensors = this._context.supportedSensors().join(", ");

      throw ParseError(ParseErrorTypes.INVALID_SENSOR,
                       sprintf(m, node.attributes.variable, knownSensors),
                       variableToken.location);
    }

    var after = parserState.currentLocation();
    if (before && after) {
      node.location = new Lexer.SourceCodeRange(before, after);
    }
    return node;
  },
});

ASTNodeParser.nodeParsers.push(ASTConditionalLoopNodeParser);

module.exports = {
  ASTProgramNodeParser: ASTProgramNodeParser,
  ASTNodeTypes: ASTNodeTypes,
  ParsingContext: ParsingContext,
};
