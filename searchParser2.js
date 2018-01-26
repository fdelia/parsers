/* eslint quotes: 0 */
/* eslint semi: 0 */
'use strict';

const opMap = {
  "Parent": "",
  "+": "AND",
  "|": "OR",
  "|>": "OR",
  "!": "AND NOT",
  ">": "AND >"
}

const QueryFromExpression = (searchExpression, fieldName) => {
  return searchExpression.split(" ").reduceLeft(expr => {

  })
}

console.log(QueryFromExpression("x |y z", "address")) // x OR (y AND z)
console.log(QueryFromExpression("v !x |y !z", "address"))
console.log(QueryFromExpression("3 |>10 <20", "address"))
