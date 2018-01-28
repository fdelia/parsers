/* Not functional! */
/* eslint quotes: 0 */
/* eslint semi: 0 */
'use strict';
// TODO error handling in parser when wrong syntax
// OPTIMIZE make it more abstract / easier to read
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

  this.next = () => this.tokens.length > this.c + 1 ? this.tokens[++this.c] : null
  this.get = d => this.tokens.length > this.c + d ? this.tokens[this.c + d] : null
  this.set = (newToken) => { this.tokens[this.c] = newToken; return null; }
  this.remove = d => {
    this.tokens.splice(this.c + d, 1) // remove that one
    if (d <= 0) this.c--
  }
  this.reset = () => { this.c = -1 }
  this.insertAt = (d, n) => { this.tokens.splice(this.c + d, 0, n) }

  return this;
}

const parse = (searchExpression) => {
  console.log(searchExpression);

  // Lexer
  var tokens = searchExpression.split(" ").map(x => x.trim()).map(token => {
    var type = opMap.has(token) ? opMap.get(token)[0] : (/^\d+$/.test(token) ? Int : Str);
    return new Node(type, token);
  });

  // Token handler
  tokens = Tokens(tokens);

  // Preparser
  while (tokens.next() && tokens.get(1)) {
    // if operator at primite, e.g. "here +there", split them to "here + there"
    if (tokens.get(0).type === Str) {
      var ops = [...opMap.keys()].filter(o => tokens.get(0).value.startsWith(o))
      if (ops.length > 0) {
        var val = tokens.get(0).value.replace(ops[0], "")
        tokens.set(new Node(opMap.get(ops[0])[0], ops[0]))
        tokens.insertAt(1, new Node(Str, val))
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
    // console.log(tokens.tokens.map(x => x.value))
    while (tokens.next()) {
      if (tokens.get(0).value !== op) continue;
      // console.log(op + ' found at ' + tokens.c)

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
      }
    }
    // console.log(tokens.tokens);
  })

  return tokens.tokens; // .filter(x => x);
}

const compile = ast => {
  if (ast.length > 0) ast = ast[0] // can be an array
  switch (ast.type) {
    case OpPrefix:
      if (ast.children.length !== 1) console.error("Compile error: Op prefix has no child")
      return opMap.get(ast.value)[1] + " " + compile(ast.children[0])
    case OpInfix:
      if (ast.children.length !== 2) console.error("Compile error: Op infix has not two children")
      return "(" + compile(ast.children[0]) + " " + opMap.get(ast.value)[1] + " " + compile(ast.children[1]) + ")";
    case Int:
    case Str:
      return ast.value;
  }
}

const compileWithFieldname = (ast, fieldName) => {
  if (ast.length > 0) ast = ast[0] // can be an array
  switch (ast.type) {
    case OpPrefix:
      if (ast.children.length !== 1) console.error("Compile error: Op prefix has no child")
      return compileWithFieldname(ast.children[0], fieldName + " " + opMap.get(ast.value)[1])
      // return opMap.get(ast.value)[1] + " " + compileWithFieldname(ast.children[0], fieldName)
    case OpInfix:
      if (ast.children.length !== 2) console.error("Compile error: Op infix has not two children")
      return "(" + compileWithFieldname(ast.children[0], fieldName) + " " + opMap.get(ast.value)[1] + " " + compileWithFieldname(ast.children[1], fieldName) + ")";
    case Int:
    case Str:
      return `${fieldName} LIKE %${ast.value}%`;
  }
}

const printAST = (ast, level = 0) => {
  if (ast.length > 0) ast = ast[0] // can be an array
  console.log("   ".repeat(level) + String(ast.type) + " -> " + ast.value)
  if (ast.children.length > 0) ast.children.forEach(child => printAST(child, level + 1))
}

var ast = parse("x |-3 z");
console.log(compileWithFieldname(ast, "name"))
// printAST(ast)

var ast2 = parse("! x | y | ! z asd")
console.log(compileWithFieldname(ast2, "name"))
// printAST(ast2)
// console.log(QueryFromExpression("v ! x | y | ! z", "name"))
// console.log(QueryFromExpression("3 | > 10 < 20", "name"))
