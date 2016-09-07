/*
 * Lexical analyzer for Robolang.
 */

/// Source code tokens.
var TokenTypes = {
  ACTION_IDENTIFIER: {name: "action_identifier"},
  IDENTIFIER: {name: "identifier"},
  BEGIN_BLOCK: {name: "begin_block"},
  END_BLOCK: {name: "end_block"},
  CONDITION_SIGN: {name: "condition_sign"},
  INTEGER: {name: "int"},
  CONDITIONAL_LOOP_KEYWORD: {name: "conditional_loop_keyword"},
  BEGIN_EXPRESSION: {name: "begin_expression"},
  END_EXPRESSION: {name: "end_expression"},
};

/// Token strings.
const BEGIN_BLOCK_TOKEN = "{";
const END_BLOCK_TOKEN = "}";
const BEGIN_EXPRESSION_TOKEN = "(";
const END_EXPRESSION_TOKEN = ")";

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
  /// Returns some of the next tokens in the stream without consuming them.
  /// `n` is the number of tokens wanted. If there are fewer than `n` tokens
  /// remaining, it returns all remaining tokens in an array that has length
  /// less than `n`.
  /// If n is undefined, it only looks for the next token, and returns that
  /// token (or undefined) instead of an array.
  /// If n is an integer (even if n=1), then it returns an array.
  lookahead: function(n) {
    if (!n)
      return this.tokens[this.i];
    return this.tokens.slice(this.i, this.i + n);
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

    if (code[i] == BEGIN_EXPRESSION_TOKEN) {
      tokens.push(new Token(TokenTypes.BEGIN_EXPRESSION));
      ++i;
      continue;
    }

    if (code[i] == END_EXPRESSION_TOKEN) {
      tokens.push(new Token(TokenTypes.END_EXPRESSION));
      ++i;
      continue;
    }

    // Condition sign: '?'
    if (/\?/.test(code[i])) {
      tokens.push(new Token(TokenTypes.CONDITION_SIGN, code[i]));
      ++i;
      continue;
    }

    // Conditional loop keyword: "ENQ"
    if (code.substr(i, 3) === "ENQ") {
      tokens.push(new Token(TokenTypes.CONDITIONAL_LOOP_KEYWORD));
      i += 3;
      continue;
    }

    // Action.
    if (/[A-Z]/.test(code[i])) {
      tokens.push(new Token(TokenTypes.ACTION_IDENTIFIER, code[i]));
      ++i;
      continue;
    }

    // Identifier.
    if (/[a-z]/.test(code[i])) {
      var id = "";
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
        id += code[i];
        ++i;
      }
      tokens.push(new Token(TokenTypes.IDENTIFIER, id));
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
