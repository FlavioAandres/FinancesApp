import React from "react";
import PrepaymentItem from "./prePaymentItemComponent";
import { CardGrid } from "emerald-ui/lib/";


const PrepaymentComponent = ({ onSavePrepayment, categories, payments = [] }) => {

  return (

    <CardGrid>
      {payments.map((item, i) => (
        <PrepaymentItem
          categories={categories.filter(category => category.type === 'EXPENSE')}
          onSubmitPrepayment={onSavePrepayment}
          item={item}
          key={"prepayment-item-" + i + "-" + item.amount}
        />
      ))}
    </CardGrid>
  );
}

export default PrepaymentComponent;
