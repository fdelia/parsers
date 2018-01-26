/* eslint quotes: 0 */
/* eslint semi: 0 */
'use strict';

const opMap = {
  "+": "AND",
  "|": "OR",
  "!": "AND NOT",
  "|!": "OR NOT"
}
const opPrefixes = Object.keys(opMap);

const QueryFromExpression = (searchExpression, fieldName) => {
  console.log("... " + searchExpression + " ...")
  return searchExpression.split(" ").reduce((query, expr) => {
    // console.log("expr " + expr)
    const op = [...opPrefixes.filter(op => expr.trim().startsWith(op))].pop() // get last element
    const val = expr.replace(op, "").trim();

    // TODO this if should depend on type(field) because of mysql
    if (/-?\d+/.test(val)) { // number
      return `${query} ${opMap.hasOwnProperty(op) ? opMap[op] : "AND"} ${fieldName}${/^\d+$/.test(val) ? " =": ""} ${val}`
    } else { // string
      return `${query} ${opMap.hasOwnProperty(op) ? opMap[op] : "AND"} ${fieldName} LIKE %${val}%`
    }
  }, `TRUE`)
}

console.log(QueryFromExpression("x |y z", "address")) // x OR (y AND z)
console.log(QueryFromExpression("v !x |y !z", "address"))
console.log(QueryFromExpression("3 |>10 <20", "address"))
