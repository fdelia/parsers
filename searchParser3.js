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
const Token = Symbol("Token")

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
  this.tokens = tokens.map(x => new Node(Token, x)).map(token => {
    var type = opMap.has(token.value) ? opMap.get(token.value)[0] : (/^\d+$/.test(token.val) ? Int : Str);
    return new Node(type, token.value);
  });
  this.c = 0

  this.finished = () => this.tokens.every(node => typeof (node) === typeof (Node))
  this.get = () => this.tokens[this.c]
  this.set = (newToken) => { this.tokens[this.c] = newToken; return null; }
  this.peek = () => this.tokens.length > this.c ? this.tokens[this.c + 1] : null;
  this.setPeek = (newToken) => { this.tokens[this.c + 1] = newToken; return null; }
  this.next = () => this.tokens[++this.c]

  return this;
}

const QueryFromExpression = (searchExpression, fieldName) => {
  var tokens = Tokens(searchExpression.split(" ").map(x => x.trim()));
  console.log(tokens);

  // Parse logic
  opMap.forEach((opProp, op) => {
    while (tokens.peek()) {
      if (opProp[0] === OpPrefix) {
        switch (tokens.peek().type) {
          case OpPrefix:
          case OpInfix:
            break;
          case Int:
          case Str:
          case Token:
            break;
        }
        // if is type string -> Node

      }
      if (opProp[0] === OpInfix) {

      }
      tokens.next()
    }
  })
}

console.log(QueryFromExpression("x | y z", "name")) // x OR (y AND z)
console.log(QueryFromExpression("v ! x | y | ! z", "name"))
console.log(QueryFromExpression("3 | > 10 < 20", "name"))
