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
opMap.set("+", [OpInfix, "AND"])
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
  this.tokens = tokens /* .map(token => {
    var type = opMap.has(token) ? opMap.get(token)[0] : (/^\d+$/.test(token) ? Int : Str);
    return new Node(type, token);
  }); */
  this.c = 0

  this.finished = () => this.tokens.every(node => typeof (node) === typeof (Node))
  this.get = () => this.tokens[this.c]
  this.set = (newToken) => { this.tokens[this.c] = newToken; return null; }
  this.peek = () => this.tokens.length > this.c ? this.tokens[this.c + 1] : null;
  this.setPeek = (newToken) => { this.tokens[this.c + 1] = newToken; return null; }
  this.move = () => this.tokens.length > this.c + 1 ? this.tokens[++this.c] : null
  this.before = () => this.tokens[this.c - 1]

  this.get = d => this.tokens.length > this.c + d ? this.tokens[this.c + d] : null
  this.remove = d => this.tokens.splice(this.c + d, 1) // remove that one

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
  var newNodes = []
  opMap.forEach((opProp, op) => {
    // console.log('op ' + op)

    while (tokens.move()) { // start at position 1
      if (tokens.get(0).value !== op) {
        newNodes.push(tokens.get(-1))
        continue;
      }
      // console.log(' found at ' + tokens.c)

      switch (tokens.get(0).type) {
        case OpPrefix:
          newNodes.push(new Node(tokens.get(0).type, tokens.get(0).value, [tokens.get(1)]))
          tokens.remove(0)
          tokens.remove(1)
          break;
        case OpInfix:
          newNodes.push(new Node(tokens.get(0).type, tokens.get(0).value, [tokens.before(), tokens.get(1)]))
          tokens.remove(-1)
          tokens.remove(0)
          tokens.remove(1)
          break;
      }
    }
    // console.log(newNodes);
    tokens = Tokens(newNodes)
  })
  // console.log(tokens.tokens)
  return tokens.tokens;
}

const PrintAST = (ast, level = 0) => {
  console.log(ast)
  // console.log(ast.type + " -> " + ast.value)
  // if (ast.children.length > 0) ast.children.forEach(child => PrintAST(child, level + 1))
}

console.log(QueryFromExpression("x | y ! z", "name")) // x OR (y AND z)
// console.log(QueryFromExpression("v ! x | y | ! z", "name"))
// console.log(QueryFromExpression("3 | > 10 < 20", "name"))
