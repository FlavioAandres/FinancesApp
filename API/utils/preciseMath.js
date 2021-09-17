const preciseOperation = f => (a, b, decimalDigits) => {
    decimalDigits = decimalDigits || 2
    return +(f(a, b)).toFixed(decimalDigits)
}
const add = (a, b) => a + b
const minus = (a, b) => a - b
const multiply = (a, b) => a * b
const divide = (a, b) => a / b

module.exports.preciseAdd = (a, b, decimalDigits) => preciseOperation(add)(a, b, decimalDigits)
module.exports.preciseMinus = (a, b, decimalDigits) => preciseOperation(minus)(a, b, decimalDigits)
module.exports.preciseMultiply = (a, b, decimalDigits) => preciseOperation(multiply)(a, b, decimalDigits)
module.exports.preciseDivide = (a, b, decimalDigits) => preciseOperation(divide)(a, b, decimalDigits)