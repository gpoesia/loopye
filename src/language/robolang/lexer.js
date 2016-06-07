/*
 * Lexical analyzer for Robolang.
 */

/// Source code tokens.
var TokenTypes = {
  IDENTIFIER: {name: "id"},
  BEGIN_BLOCK: {name: "begin_block"},
  END_BLOCK: {name: "end_block"},
  INTEGER: {name: "int"},
};

/// Token strings.
const BEGIN_BLOCK_TOKEN = "{";
const END_BLOCK_TOKEN = "}";

function Token(type, value) {
  this.type = type;
  this.value = value;
}

Token.prototype = {
  type: null,
  value: null,
};

/// Stores the stream of tokens output by the lexer.
function TokenStream(tokens) {
  this.i = 0;
  this.tokens = tokens;
  this.error = null;
}

TokenStream.prototype = {
  programEnded: function() {
    return this.i >= this.tokens.length;
  },
  /// Consumes and returns the next token of the string.
  /// If expectedType is not undefined, this function throws an error if the
  /// next token in the stream does not match the expected type.
  consumeToken: function(expectedType) {
    var token = this.tokens[this.i];
    if (expectedType !== undefined && token.type !== expectedType) {
      throw ("Unexpected token " + token +
             " (expected " + expectedType.name + ")");
    }
    ++this.i;
    return token;
  },
  lookahead: function() {
    return this.tokens[this.i];
  },
};

var tokenize = function(code) {
  var tokens = [];

  for (var i = 0; i < code.length; ) {
    // Ignore space.
    if (/^\s$/.test(code[i])) {
      ++i;
      continue;
    }

    if (code[i] == BEGIN_BLOCK_TOKEN) {
      tokens.push(new Token(TokenTypes.BEGIN_BLOCK));
      ++i;
      continue;
    }

    if (code[i] == END_BLOCK_TOKEN) {
      tokens.push(new Token(TokenTypes.END_BLOCK));
      ++i;
      continue;
    }

    // Action.
    if (/[a-zA-Z]/.test(code[i])) {
      tokens.push(new Token(TokenTypes.IDENTIFIER, code[i]));
      ++i;
      continue;
    }

    // Integer.
    if (/[0-9]/.test(code[i])) {
      var number = 0;
      while (i < code.length && /[0-9]/.test(code[i])) {
        number = 10*number + parseInt(code[i], 10);
        ++i;
      }
      tokens.push(new Token(TokenTypes.INTEGER, number));
      continue;
    }

    throw ("Unrecognized token: " +
           (code.substr(i, 10) + (i + 10 < code.length ? "" : "...")));
  }

  return tokens;
};

module.exports = {
  tokenize: tokenize,
  TokenStream: TokenStream,
  TokenTypes: TokenTypes,
};
