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

const Tokens = tokens => {
  this.tokens = tokens.map(x => new Node(Token, x))
  this.c = 0

  const finished = () => this.tokens.every(node => typeof (node) === typeof (Node))
  const get = () => this.tokens[this.c]
  const set = (newToken) => { this.tokens[this.c] = newToken; return null; }
  const peek = () => this.tokens.length > this.c ? this.tokens[this.c + 1] : null;
  const setPeek = (newToken) => { this.tokens[this.c + 1] = newToken; return null; }
  const next = () => this.tokens[++this.c]
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
