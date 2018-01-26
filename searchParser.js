/* eslint quotes: 0 */
/* eslint semi: 0 */
'use strict';

// build query from expression
const Op = Symbol("op");
const Num = Symbol("num");
const Str = Symbol("str");

const lex = str => str.split(' ').map(s => s.trim()).filter(s => s.length);
const prefixOperations = ["+", "|", "!", "=", ">", ">=", "<", "<="];
const opMap = {
  "Parent": "",
  "+": "AND",
  "|": "OR",
  "|>": "OR",
  "!": "AND NOT",
  ">": "AND >"
}

const parse = tokens => {
  let c = 0;

  const peek = () => tokens[c];
  const consume = () => {
    // console.log("consume " + peek())
    return tokens[c++];
  }

  // Only primite types consume (?)
  const parseNum = () => {
    const node = {val: peek().trim() /* hasOp(peek()) ? parseInt(getVal().trim()) : parseInt(peek().trim())*/ , type: Num}
    if (/^\d+$/.test(node.val)) node.val = "=" + node.val;
    consume(); return node;
  }
  const parseStr = () => {
    const node = {val: hasOp(peek()) ? String(getVal()).trim() : String(peek()).trim(), type: Str};
    consume(); return node;
  }

  const parseOp = () => {
    // const [op, val] = splitOpVal(peek());
    // console.log("parseOp    -> " + op + " / " + val)
    const node = {val: getOp(), type: Op, expr: [parsePrimitive()]};
    while (peek()) node.expr.push(parseExpr());
    return node;
  };

  const getOp = () => {
    var res = prefixOperations
      .filter(op => peek().startsWith(op));
    return res.length ? res : "Operation unknown.";
  }

  const getVal = () => peek().replace(getOp(), "");

  /* const splitOpVal = expr => {
    // console.log("splitOpVal "); console.log(prefixOperations.filter(x => expr.startsWith(x)));
    var res = prefixOperations
      .filter(op => expr.startsWith(op))
      .map(op => [op, expr.substr(op.length, expr.length)]);
    return res.length ? res[0] : ["", expr]; // default
  } */

  const hasOp = () => {
    // console.log("hasOp " + peek())
    return prefixOperations.some(x => peek().startsWith(x));
  };

  const parseExpr = () => {
    // console.log("parseExpr " + peek())
    if (hasOp(peek())) return parseOp();
    else return parsePrimitive(); // return /-?\d+/.test(peek()) ? parseNum() : parseStr();
  }

  const parsePrimitive = () => {
    // console.log("parsePrimitive " + peek())
    // console.log(/-?\d+/.test(peek()))
    return /-?\d+/.test(peek()) ? parseNum() : parseStr();
  }

  const node = {val: "Parent", type: Op, expr: []};
  while (peek()) node.expr.push(parseExpr());
  return node;
}

const compile = (ast, fieldName) => {
  const compileNum = ast => `${fieldName} ${ast.val}`;
  const compileStr = ast => `${fieldName} LIKE %${ast.val}%`;
  const compileOp = ast => {
    // console.log("\ncompileOp " + opMap[ast.val]); console.log(ast);
    var op = opMap[ast.val] ? opMap[ast.val] : "AND";
    return `${ast.expr.map(compile).join(' ' + op + ' ')}` // removed brackets
  }
  const compile = ast => {
    switch (ast.type) {
      case Num: return compileNum(ast)
      case Str: return compileStr(ast)
      case Op: return compileOp(ast)
      default:
        console.error("Type not found: " + ast.type);
        console.error(ast);
    }
  }
   // console.log(ast);
  return compile(ast)
};

const QueryFromExpression = (searchExpression, fieldName) => {
  return compile(parse(lex(searchExpression)), fieldName)
}

console.log(QueryFromExpression("x |y z", "address")) // x OR (y AND z)
console.log(QueryFromExpression("v !x |y !z", "address"))
console.log(QueryFromExpression("3 |>10 <20", "address"))
