import React from "react";
import PrepaymentItem from "./prePaymentItemComponent";
import { ExpansionTableRowGroup, TableHeader } from "emerald-ui/lib/";


const PrepaymentComponent = ({ onSavePrepayment, categories, payments = [] }) => {

  return (
    <ExpansionTableRowGroup>
      <TableHeader checkboxAriaLabel="Name">
        <th>Total</th>
        <th>Concepto</th>
        <th>Fecha</th>
      </TableHeader>
      {payments.map((item, i) => (
        <PrepaymentItem
          categories={categories.filter(category => category.type === 'EXPENSE')}
          onSubmitPrepayment={onSavePrepayment}
          item={item}
          key={"prepayment-item-" + i + "-" + item.amount}
        />
      ))}
    </ExpansionTableRowGroup>
  );
}

export default PrepaymentComponent;
