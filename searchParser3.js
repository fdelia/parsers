/* Not functional! */
/* eslint quotes: 0 */
/* eslint semi: 0 */
'use strict';

// Types
const OpPrefix = Symbol("OpPrefix")
// const OpPostfix = Symbol("OpPostfix") // we have no OpPostfix with this language specifications
const OpInfix = Symbol("OpInfix")
const Int = Symbol("Int")
const Str = Symbol("String")
// const Token = Symbol("Token")

// Order gives precedence of operators, higher = higher = first handled
const opMap = new Map();
opMap.set("!", [OpPrefix, "NOT"])
// opMap.set("+", [OpInfix, "AND"])
opMap.set("|", [OpInfix, "OR"])

class Node {
  constructor (type, value, children = []) {
    this.type = type // see Types above
    this.value = value // int or string
    this.children = children // []
  }
}

// Already matches operators, however with no logic
const Tokens = tokens => {
  this.tokens = tokens
  this.c = 0

  this.finished = () => this.tokens.every(node => typeof (node) === typeof (Node))
  // this.get = () => this.tokens[this.c]
  this.set = (newToken) => { this.tokens[this.c] = newToken; return null; }
  // this.peek = () => this.tokens.length > this.c ? this.tokens[this.c + 1] : null;
  // this.setPeek = (newToken) => { this.tokens[this.c + 1] = newToken; return null; }
  this.move = () => this.tokens.length > this.c + 1 ? this.tokens[++this.c] : null
  // this.before = () => this.tokens[this.c - 1]

  this.get = d => this.tokens.length > this.c + d ? this.tokens[this.c + d] : null
  this.remove = d => {
    // delete this.tokens[this.c + d]
    this.tokens.splice(this.c + d, 1) // remove that one
    if (d <= 0) this.c--
  }

  return this;
}

const QueryFromExpression = (searchExpression, fieldName) => {
  // Lexer
  var tokens = searchExpression.split(" ").map(x => x.trim()).map(token => {
    var type = opMap.has(token) ? opMap.get(token)[0] : (/^\d+$/.test(token) ? Int : Str);
    return new Node(type, token);
  });
  // Token handler
  tokens = Tokens(tokens);

  // Parse logic

  opMap.forEach((opProp, op) => {
    tokens.c = 0
    console.log('op ' + op)
    // var newNodes = []

    while (tokens.move() !== null) { // start at position 1
      if (!tokens.get(0)) continue;
      if (tokens.get(0).value !== op) {
        // newNodes.push(tokens.get(-1))
        // console.log(tokens.get(0).value)

        // if (!tokens.get(1) /* || tokens.get(1).type !== OpInfix */) newNodes.push(tokens.get(0))
        continue;
      }
      console.log(' found at ' + tokens.c)

      switch (tokens.get(0).type) {
        case OpPrefix:
          // newNodes.push(tokens.get(-1))
          var curr = tokens.get(0)
          tokens.set(new Node(curr.type, curr.value, [tokens.get(1)]))
          // tokens.remove(0)
          tokens.remove(1)
          break;
        case OpInfix:
          var curr = tokens.get(0)
          tokens.set(new Node(curr.type, curr.value, [tokens.get(-1), tokens.get(1)]))
          tokens.remove(-1)
          // tokens.remove(0)
          tokens.remove(1)
          break;
      }
    }
    console.log(tokens.tokens);
    // tokens = Tokens(newNodes)
  })

  /* const parseNodes = (op, before, current, next) => {
    if (!next) return [before, current]
    if (tokens.get(0).value !== op) {
      return [before, current];
    }
  }

  opMap.forEach((opProp, op) => {
    var newNodes = []
    while (tokens.move() !== null) { // start at position 1
      newNodes = newNodes.concat(parseNodes(op, tokens.get(-1), tokens.get(0), tokens.get(1)))
    }
    console.log(newNodes);
    tokens = Tokens(newNodes)
  }) */

  // tokenNodes -> parsedNodes
  // parseNodes(-1, 0, 1) -> [a, b, c]

  return tokens.tokens.filter(x => x);
}

const PrintAST = (ast, level = 0) => {
  // console.log(ast)
  if (ast.length > 0) ast = ast[1]
  console.log(" - ".repeat(level) + String(ast.type) + " -> " + ast.value)
  // console.log(ast.children)
  if (ast.children.length > 0) ast.children.forEach(child => PrintAST(child, level + 1))
}

var ast = QueryFromExpression("x | y | z", "name");
// var ast = QueryFromExpression("x | ! y", "name");
PrintAST(ast.length > 0 ? ast[0] : ast) // x OR (y AND z)
// console.log(QueryFromExpression("v ! x | y | ! z", "name"))
// console.log(QueryFromExpression("3 | > 10 < 20", "name"))
