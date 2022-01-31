
const { search } = require("../../utils");
const html = require("./didi-template");

console.log(
  search(
    html,
    "Bancolombia le informa Compra",
    "shopping",
    "Bancolombia le informa que su factura inscrita",
    "BANCOLOMBIA"
  )
);

