/* eslint quotes: 0 */
/* eslint semi: 0 */
'use strict';

// Order gives precedence of operators, higher = higher = first handled
const opMap = {
  "!": "NOT",
  "+": "AND",
  "|": "OR"
}

// Types
const OpPrefix = Symbol("OpPrefix")
const OpPostfix = Symbol("OpPostfix")
const OpInfix = Symbol("OpInfix")
const Int = Symbol("Int")
const String = Symbol("String")

class Node {
  constructor(type, value, children = []){
    this.type = type // see Types above
    this.value = value // int or string
    this.children = children // []
  }
}

class Tokens {
  constructor (tokens) {
    this.tokens = tokens
    this.c = 0
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

const QueryFromExpression = searchExpression => {
  const tokens = Tokens(searchExpression.split(" ").map(x => x.trim()));
  console.log(tokens);

  var parent = Node(OpPrefix, null)
  while (tokens.peek()) {

  }
}

console.log(QueryFromExpression("x | y z", "address")) // x OR (y AND z)
console.log(QueryFromExpression("v ! x | y | ! z", "address"))
console.log(QueryFromExpression("3 | > 10 < 20", "address"))
