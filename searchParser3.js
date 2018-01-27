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
// opMap.set("|", [OpInfix, "OR"])

class Node {
  constructor (type, value, children = []) {
    this.type = type // see Types above
    this.value = value // int or string
    this.children = children // []
  }
}

class Tokens {
  constructor (tokens) {
    this.tokens = tokens.map(x => new Node(Token, x))
    this.c = 0
  }
  finished () {
    return this.tokens.every(node => typeof (node) === typeof (Node))
  }
  get () {
    return this.tokens[this.c]
  }
  peek () {
    return this.tokens.length > this.c ? this.tokens[this.c + 1] : null;
  }
  next () {
    return this.tokens[++this.c]
  }
}

const QueryFromExpression = (searchExpression, fieldName) => {
  var tokens = new Tokens(searchExpression.split(" ").map(x => x.trim()));
  console.log(tokens);

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
