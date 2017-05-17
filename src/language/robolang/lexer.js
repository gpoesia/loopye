/*
 * Lexical analyzer for Robolang.
 */

var T = require("../../util/translate").T;
var sprintf = require("sprintf-js").sprintf;

/// Source code tokens.
var TokenTypes = {
  ACTION_IDENTIFIER: {name: "action_identifier"},
  IDENTIFIER: {name: "identifier"},
  BEGIN_BLOCK: {name: "begin_block"},
  END_BLOCK: {name: "end_block"},
  IF_KEYWORD: {name: "if", value: "se"},
  ELSE_KEYWORD: {name: "else", value: "senao"},
  INTEGER: {name: "int"},
  CONDITIONAL_LOOP_KEYWORD: {name: "conditional_loop", value: "enquanto"},
  BEGIN_EXPRESSION: {name: "begin_expression"},
  END_EXPRESSION: {name: "end_expression"},
  END_OF_FILE: {name: "end_of_file"},
};

/// Represents a position in the source code as a (line, column) pair.
/// The character in a file is in position in a file is (0, 0).
function SourceCodePosition(line, column) {
  this._line = line || 0;
  this._column = column || 0;
}

Object.assign(SourceCodePosition.prototype, {
  getLine: function() {
    return this._line;
  },
  getColumn: function() {
    return this._column;
  },
});

/// Represents a range in the source code, as a [begin, end) interval
/// (i.e. the `end` position is *not* included in the range).
/// If `end` is not given, it is set to exactly one position after `begin`,
/// thus creating a length-1 range.
function SourceCodeRange(begin, end) {
  this._begin = begin;
  if (end === undefined) {
    end = new SourceCodePosition(begin.getLine(), begin.getColumn() + 1);
  }
  this._end = end;
}

Object.assign(SourceCodeRange.prototype, {
  getBegin: function() {
    return this._begin;
  },
  getEnd: function() {
    return this._end;
  },
});

function LexerError(message, location) {
  return {
    message: message,
    range: location,
  };
}

function isKeyword(token) {
  return (token === TokenTypes.IF_KEYWORD.value ||
          token === TokenTypes.ELSE_KEYWORD.value ||
          token === TokenTypes.CONDITIONAL_LOOP_KEYWORD.value);
}

/// Token strings.
const BEGIN_BLOCK_TOKEN = "{";
const END_BLOCK_TOKEN = "}";
const BEGIN_EXPRESSION_TOKEN = "(";
const END_EXPRESSION_TOKEN = ")";

function Token(type, value, location) {
  this.type = type;
  this.value = value;
  this.location = location;
}

Token.prototype = {
  type: null,
  value: null,
  location: null,
  toString: function() {
    switch (this.type) {
    case TokenTypes.ACTION_IDENTIFIER:
      return this.value;
    case TokenTypes.IDENTIFIER:
      return this.value;
    case TokenTypes.BEGIN_BLOCK:
      return BEGIN_BLOCK_TOKEN;
    case TokenTypes.END_BLOCK:
      return END_BLOCK_TOKEN;
    case TokenTypes.IF_KEYWORD:
      return TokenTypes.IF_KEYWORD.value;
    case TokenTypes.ELSE_KEYWORD:
      return TokenTypes.ELSE_KEYWORD.value;
    case TokenTypes.INTEGER:
      return this.value;
    case TokenTypes.CONDITIONAL_LOOP_KEYWORD:
      return TokenTypes.CONDITIONAL_LOOP_KEYWORD.value;
    case TokenTypes.BEGIN_EXPRESSION:
      return BEGIN_EXPRESSION_TOKEN;
    case TokenTypes.END_EXPRESSION:
      return END_EXPRESSION_TOKEN;
    case TokenTypes.END_OF_FILE:
      return "";
    default:
      return "<???>";
    }
  }
};

/// Stores the stream of tokens output by the lexer.
function TokenStream(tokens) {
  this._i = 0;
  this._tokens = tokens;
  this._error = null;
}

TokenStream.prototype = {
  /// Returns whether all tokens in the input have been consumed.
  programEnded: function() {
    // An EOF is appended to the end; hence we subtract 1.
    return this._i >= this._tokens.length - 1;
  },
  /// Consumes and returns the next token of the string.
  /// If expectedType is not undefined, this function throws an error if the
  /// next token in the stream does not match the expected type.
  consumeToken: function(expectedType) {
    var token = this._tokens[this._i];
    if (expectedType !== undefined &&
        (token === undefined || token.type !== expectedType)) {
      throw LexerError(sprintf(T("Não esperava um %s aqui (esperava um %s)."),
                               token, expectedType.name),
                       token.location.getBegin());
    }
    ++this._i;
    return token;
  },
  /// Returns the location up to which tokens were consumed.
  currentLocation: function() {
    if (this.programEnded() && this._tokens.length > 1) {
      return this._tokens[this._tokens.length - 2].location.getEnd();
    }
    if (this._i > 0) {
      return this._tokens[this._i - 1].location.getEnd();
    } else {
      return this._tokens[0].location.getBegin();
    }
  },
  /// Returns the location right before the next token to be consumed.
  /// If there are no tokens left, returns null
  nextTokenLocation: function() {
    if (this.programEnded()) {
      return null;
    }
    return this._tokens[this._i].location.getBegin();
  },
  /// Returns some of the next tokens in the stream without consuming them.
  /// `n` is the number of tokens wanted. If there are fewer than `n` tokens
  /// remaining, it returns all remaining tokens in an array that has length
  /// less than `n`.
  /// If n is undefined, it only looks for the next token, and returns that
  /// token (or undefined) instead of an array.
  /// If n is an integer (even if n=1), then it returns an array.
  lookahead: function(n) {
    if (!n)
      return this._tokens[this._i];
    return this._tokens.slice(this._i, this._i + n);
  },
};

var tokenize = function(code) {
  var tokens = [];
  var line = 0;
  var column = 0;

  for (var i = 0; i < code.length; ) {
    // Ignore space.
    if (/^\s$/.test(code[i])) {
      if (code[i] === "\n") {
        line++;
        column = 0;
      } else {
        column++;
      }
      ++i;
      continue;
    }

    var before = new SourceCodePosition(line, column);

    if (code[i] == BEGIN_BLOCK_TOKEN) {
      tokens.push(new Token(TokenTypes.BEGIN_BLOCK, null,
                            new SourceCodeRange(before)));
      ++i;
      ++column;
      continue;
    }

    if (code[i] == END_BLOCK_TOKEN) {
      tokens.push(new Token(TokenTypes.END_BLOCK, null,
                            new SourceCodeRange(before)));
      ++i;
      ++column;
      continue;
    }

    if (code[i] == BEGIN_EXPRESSION_TOKEN) {
      tokens.push(new Token(TokenTypes.BEGIN_EXPRESSION, null,
                            new SourceCodeRange(before)));
      ++i;
      ++column;
      continue;
    }

    if (code[i] == END_EXPRESSION_TOKEN) {
      tokens.push(new Token(TokenTypes.END_EXPRESSION, null,
                            new SourceCodeRange(before)));
      ++i;
      ++column;
      continue;
    }

    // Identifier.
    if (/[a-z]/.test(code[i])) {
      var id = "";
      var j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) {
        id += code[j];
        ++j;
      }
      if (!isKeyword(id)) {
        i = j;
        column += j - i;
        after = new SourceCodePosition(line, column);
        tokens.push(new Token(TokenTypes.IDENTIFIER, id,
                              new SourceCodeRange(before, after)));
        continue;
      }
    }

    // 'else'.
    if (code.substr(i).startsWith(TokenTypes.ELSE_KEYWORD.value)) {
      i += TokenTypes.ELSE_KEYWORD.value.length;
      column += TokenTypes.ELSE_KEYWORD.value.length;
      var after = new SourceCodePosition(line, column);
      tokens.push(new Token(TokenTypes.ELSE_KEYWORD, null,
                            new SourceCodeRange(before, after)));
      continue;
    }

    // 'if'.
    if (code.substr(i).startsWith(TokenTypes.IF_KEYWORD.value)) {
      i += TokenTypes.IF_KEYWORD.value.length;
      column += TokenTypes.IF_KEYWORD.value.length;
      var after = new SourceCodePosition(line, column);
      tokens.push(new Token(TokenTypes.IF_KEYWORD, null,
                            new SourceCodeRange(before, after)));
      continue;
    }

    // Conditional loop keyword.
    if (code.substr(i).startsWith(TokenTypes.CONDITIONAL_LOOP_KEYWORD.value)) {
      i += TokenTypes.CONDITIONAL_LOOP_KEYWORD.value.length;
      column += TokenTypes.CONDITIONAL_LOOP_KEYWORD.value.length;
      var after = new SourceCodePosition(line, column);
      tokens.push(new Token(TokenTypes.CONDITIONAL_LOOP_KEYWORD, null,
                            new SourceCodeRange(before, after)));
      continue;
    }

    // Action.
    if (/[A-Z]/.test(code[i])) {
      tokens.push(new Token(TokenTypes.ACTION_IDENTIFIER, code[i],
                            new SourceCodeRange(before)));
      ++column;
      ++i;
      continue;
    }

    // Integer.
    if (/[0-9]/.test(code[i])) {
      var number = 0;
      while (i < code.length && /[0-9]/.test(code[i])) {
        number = 10*number + parseInt(code[i], 10);
        ++i;
        ++column;
      }
      var after = new SourceCodePosition(line, column);
      tokens.push(new Token(TokenTypes.INTEGER, number,
                            new SourceCodeRange(before, after)));
      continue;
    }

    // Unrecognized token.
    var snippet = (code.substr(i, 10) + (i + 10 < code.length ? "" : "..."));
    throw LexerError(T("Trecho de código não reconhecido: ") + snippet,
                     new SourceCodeRange(before));
  }

  tokens.push(new Token(TokenTypes.END_OF_FILE, null,
                        new SourceCodeRange(
                          new SourceCodePosition(line, column))));

  return tokens;
};

module.exports = {
  tokenize: tokenize,
  TokenStream: TokenStream,
  TokenTypes: TokenTypes,
  SourceCodePosition: SourceCodePosition,
  SourceCodeRange: SourceCodeRange,
  BEGIN_BLOCK_TOKEN: BEGIN_BLOCK_TOKEN,
  END_BLOCK_TOKEN: END_BLOCK_TOKEN,
};
