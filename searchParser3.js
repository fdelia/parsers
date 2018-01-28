/* Not functional! */
/* eslint quotes: 0 */
/* eslint semi: 0 */
'use strict';
// TODO error handling in parser when wrong syntax
// OPTIMIZE make it more abstract
// TODO "x |-3" doesn't parse the -3 to int

// Types
const OpPrefix = Symbol("OpPrefix")
// const OpPostfix = Symbol("OpPostfix") // we have no OpPostfix with this language specifications
const OpInfix = Symbol("OpInfix")
const Int = Symbol("Int")
const Str = Symbol("String")

// Order gives precedence of operators, higher = first handled
const opMap = new Map();
opMap.set("!", [OpPrefix, "NOT"])
opMap.set("+", [OpInfix, "AND"])
opMap.set("|", [OpInfix, "OR"])

class Node {
  constructor (type, value, children = []) {
    this.type = type // see Types above
    this.value = value // int or string
    this.children = children // []
  }
}

// Tokens handler
const Tokens = tokens => {
  this.tokens = tokens
  this.c = 0

  this.set = (newToken) => { this.tokens[this.c] = newToken; return null; }
  this.next = () => this.tokens.length > this.c + 1 ? this.tokens[++this.c] : null

  this.get = d => this.tokens.length > this.c + d ? this.tokens[this.c + d] : null
  this.remove = d => {
    // delete this.tokens[this.c + d]
    this.tokens.splice(this.c + d, 1) // remove that one
    if (d <= 0) this.c--
  }
  this.reset = () => { this.c = 0 }
  this.insertAt = (d, n) => { this.tokens.splice(this.c + d, 0, n) }

  return this;
}

const QueryFromExpression = (searchExpression, fieldName) => {
  console.log(searchExpression);

  // Lexer
  var tokens = searchExpression.split(" ").map(x => x.trim()).map(token => {
    var type = opMap.has(token) ? opMap.get(token)[0] : (/^\d+$/.test(token) ? Int : Str);
    return new Node(type, token);
  });

  // Token handler
  tokens = Tokens(tokens);

  // Preparser
  tokens.c = -1 // start at position 0
  while (tokens.next() && tokens.get(1)) {
    // if operator at primite, e.g. "here +there", split them to "here + there"
    if (tokens.get(0).type === Str) {
      var ops = [...opMap.keys()].filter(o => tokens.get(0).value.startsWith(o))
      if (ops.length > 0) {
        var val = tokens.get(0).value.replace(ops[0], "")
        tokens.set(new Node(opMap.get(ops[0])[0], ops[0]))
        tokens.insertAt(0, new Node(Str, val))
        continue
      }
    }
    // insert "and" where two consecutive primitives
    if ((tokens.get(0).type === Int || tokens.get(0).type === Str) &&
    (tokens.get(1).type === Int || tokens.get(1).type === Str)) {
      tokens.insertAt(1, new Node(OpInfix, "+"))
      tokens.next()
    }
  }

  // Parser
  opMap.forEach((opProp, op) => {
    tokens.reset()
    // console.log('op ' + op)

    while (tokens.next()) { // start at position 1
      // if (!tokens.get(0)) continue;
      if (tokens.get(0).value !== op) continue;
      // console.log(' found at ' + tokens.c)

      var curr = tokens.get(0)
      switch (curr.type) {
        case OpPrefix:
          tokens.set(new Node(curr.type, curr.value, [tokens.get(1)]))
          tokens.remove(1)
          break;
        case OpInfix:
          tokens.set(new Node(curr.type, curr.value, [tokens.get(-1), tokens.get(1)]))
          tokens.remove(-1)
          tokens.remove(1)
          break;
        // case OpPostfix: // not implemented
          // break;
      }
    }
    // console.log(tokens.tokens);
  })

  return tokens.tokens; // .filter(x => x);
}

const PrintAST = (ast, level = 0) => {
  if (ast.length > 0) ast = ast[0] // can be an array
  console.log("   ".repeat(level) + String(ast.type) + " -> " + ast.value)
  if (ast.children.length > 0) ast.children.forEach(child => PrintAST(child, level + 1))
}

var ast = QueryFromExpression("x |-3 z", "name");
// var ast = QueryFromExpression("x | ! y", "name");
PrintAST(ast.length > 0 ? ast[0] : ast) // x OR (y AND z)

var ast2 = QueryFromExpression("v | ! x | y | ! z", "name")
// PrintAST(ast2)
// console.log(QueryFromExpression("v ! x | y | ! z", "name"))
// console.log(QueryFromExpression("3 | > 10 < 20", "name"))
