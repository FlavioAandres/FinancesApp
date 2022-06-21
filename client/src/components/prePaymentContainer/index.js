import React from "react";
import PrepaymentItem from "./prePaymentItemComponent";
import { ExpansionTableRowGroup, TableHeader } from "emerald-ui/lib/";


const PrepaymentComponent = ({ onSavePrepayment, categories, payments = [] }) => {
  const CategoriesToRender = categories
    .filter(category => category.type === 'EXPENSE' && category.value !== "")
    .sort((a,b)=>{
      if(a.value > b.value){
        return 1
      }else if(a.value < b.value){
        return -1 
      }
      return 0
    })
  return (
    <ExpansionTableRowGroup>
      <TableHeader checkboxAriaLabel="Name">
        <th>Total</th>
        <th>Concepto</th>
        <th>Fecha</th>
      </TableHeader>
      {payments.map((item, i) => (
        <PrepaymentItem
          categories={CategoriesToRender}
          onSubmitPrepayment={onSavePrepayment}
          item={item}
          key={"prepayment-item-" + i + "-" + item.amount}
        />
      ))}
    </ExpansionTableRowGroup>
  );
}

export default PrepaymentComponent;
