/* Not functional! */
/* eslint quotes: 0 */
/* eslint semi: 0 */
'use strict';
// TODO error handling in parser when wrong syntax
// TODO brackets ()
// TODO "x |-3" doesn't parse the -3 to int

// Types
const OpPrefix = Symbol("OpPrefix")
// const OpPostfix = Symbol("OpPostfix") // we have no OpPostfix with this language specifications
const OpInfix = Symbol("OpInfix")
const Int = Symbol("Int")
const Str = Symbol("String")

// Order gives precedence of operators, higher = first handled
const opMap = new Map();
opMap.set("!", [OpPrefix, "NOT $0"])
opMap.set("-", [OpInfix, "BETWEEN $0 AND $1"])
opMap.set("+", [OpInfix, "($0 AND $1)"])
opMap.set("|", [OpInfix, "($0 OR $1)"])
const opMapFN = new Map();
opMapFN.set("!", [OpPrefix, "NOT"])
opMapFN.set("+", [OpInfix, "AND"])
opMapFN.set("|", [OpInfix, "OR"])

class Node {
  constructor (type, value, children = []) {
    this.type = type // see Types above
    this.value = value // int or string
    this.children = children // []
  }
}

// Tokens handler
const Tokens = tokens => {
  this.list = tokens
  this.c = -1

  this.next = () => this.list.length > this.c + 1 ? this.list[++this.c] : null
  this.get = d => this.list.length > this.c + d ? this.list[this.c + d] : null
  this.set = (newToken) => { this.list[this.c] = newToken; return null; }
  this.remove = d => {
    this.list.splice(this.c + d, 1) // remove that one
    if (d <= 0) this.c--
  }
  this.reset = () => { this.c = -1 }
  this.insertAt = (d, n) => { this.list.splice(this.c + d, 0, n) }

  return this;
}

const parse = (searchExpression) => {
  console.log(searchExpression);
  const getPrimitiveType = expr => /^-?\d+$/.test(expr) ? Int : Str
  const operations = [...opMap.keys()]
  const higherRank = (op1, op2) => operations.indexOf(op1) <= operations.indexOf(op2)

  // Lexer
  var tokens = searchExpression.split(" ").map(x => x.trim()).map(token => {
    var type = opMap.has(token) ? opMap.get(token)[0] : getPrimitiveType(token);
    return new Node(type, token);
  });

  // Token handler
  tokens = Tokens(tokens);

  // Preparser
  // if operator prefixes primitive, e.g. "here +there", split them to "here + there"
  tokens.reset()
  while (tokens.next()) {
    if (tokens.get(0).type === Str) {
      var ops = [...opMap.keys()]
      .reverse() // orders is reversed: from outer to inner, since we are looking at prefixed operators
      .filter(o => tokens.get(0).value.startsWith(o))
      // console.log(ops)
      if (ops.length > 0 && tokens.get(0).value.length > ops[0].length) {
        var val = tokens.get(0).value.replace(ops[0], "")
        tokens.set(new Node(opMap.get(ops[0])[0], ops[0]))
        tokens.insertAt(1, new Node(getPrimitiveType(val), val))
        // tokens.c--;
        // console.log(tokens.list)
        continue
      }
    }
  }
  // console.log(tokens.list.map(x => x.value))

  // insert "and" where two consecutive primitives
  tokens.reset()
  while (tokens.next() && tokens.get(1)) {
    // console.log(tokens.get(0).value + " " + String(tokens.get(0).type) + " " + String(tokens.get(1).type))
    if ((tokens.get(0).type === Int || tokens.get(0).type === Str) &&
        (tokens.get(1).type === Int || tokens.get(1).type === Str || tokens.get(1).type === OpPrefix)) {
      // tokens.get(1) !== OpInfix) {
      tokens.insertAt(1, new Node(OpInfix, "+"))
      tokens.next()
    }
  }
  // console.log(tokens.list.map(x => x.value))

  // Parser
  // Problem: need to save the last active node in the tree
  // need to move around in the tree: add to current node, move to parent
  tokens.reset()
  while (tokens.next()) {
    if (!tokens.get(1)) {
      // TODO
      continue;
    }
    var cur = tokens.get(0)
    var peek = tokens.get(1)
    // console.log(`${cur.value}: ${String(cur.type)} / ${String(peek.type)}`)
    console.log(cur.value)
    switch (cur.type) {
      case OpPrefix:
      case OpInfix:
        switch (peek.type) {
          case OpPrefix:
            // TODO
            break
          case OpInfix:
            if (higherRank(cur.type, peek.type)) {
              if (cur.type === OpPrefix && cur.children.length < 1) console.error(`Missing argument for ${cur.val}, expected 1.`)
              if (cur.type === OpInfix && cur.children.length < 2) console.error(`Missing argument for ${cur.val}, expected 2.`)
              peek.children.unshift(cur.children.pop())
              cur.children.push(peek)
              tokens.set(cur)
              tokens.remove(1)
              // tokens.c--
            } else {

            }
            break
          case Str:
          case Int:
            cur.children.push(peek)
            tokens.set(cur)
            tokens.remove(1)
            tokens.c--
            break
        }
        break
      case Str:
      case Int:
        switch (peek.type) {
          case OpPrefix: continue
          case OpInfix:
            peek.children.push(cur)
            tokens.set(peek)
            tokens.remove(1)
            tokens.c--
            break
          case Str:
          case Int:
            // TODO add "AND" in between?
            continue
            break
        }
        break
    }
    console.log(tokens.list.map(x => `${x.value} (${x.children.length})`))
  }

  /* opMap.forEach((opProp, op) => {
    tokens.reset()
    // console.log(tokens.list.map(x => x.value))
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
    // console.log(tokens.list);
  }) */

  return tokens.list; // .filter(x => x);
}

const compile = ast => {
  if (ast.length > 0) ast = ast[0] // can be an array
  switch (ast.type) {
    case OpPrefix:
      if (ast.children.length !== 1) console.error("Compile error: Op prefix has no child")
      return opMap.get(ast.value)[1].replace("$0", compile(ast.children[0]))
    case OpInfix:
      if (ast.children.length !== 2) console.error("Compile error: Op infix has not two children")
      return opMap.get(ast.value)[1]
        .replace("$0", compile(ast.children[0]))
        .replace("$1", compile(ast.children[1])) // "(" + compile(ast.children[0]) + " " + opMap.get(ast.value)[1] + " " + compile(ast.children[1]) + ")";
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
      return compileWithFieldname(ast.children[0], fieldName + " " + opMapFN.get(ast.value)[1])
      // return opMap.get(ast.value)[1] + " " + compileWithFieldname(ast.children[0], fieldName)
    case OpInfix:
      if (ast.children.length !== 2) console.error("Compile error: Op infix has not two children")
      return "(" + compileWithFieldname(ast.children[0], fieldName) + " " + opMapFN.get(ast.value)[1] + " " + compileWithFieldname(ast.children[1], fieldName) + ")";
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

var ast = parse("x |-3 !z");
printAST(ast)
// console.log(compile(ast))
// console.log(compileWithFieldname(ast, "column"))
// console.log("")
/*
var ast2 = parse("!x |y |!z asd")
// printAST(ast2)
console.log(compile(ast2))
console.log(compileWithFieldname(ast2, "column"))

var ast3 = parse("x + (y |z)")
printAST(ast3)
*/
