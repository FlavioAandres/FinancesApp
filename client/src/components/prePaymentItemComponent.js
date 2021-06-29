import React from "react";
import { ExpansionTableRow } from "emerald-ui/lib/";
import formatCash from '../utils/formatCash';
import moment from "moment";

const PrePaymentItemComponent = (props = { item: {} }) => {
  const {
    item: { _id: id, amount, text, createdAt, type },
  } = props;
  const parsedDate = moment(createdAt).utc().format("DD MMMM YYYY");
  const [expanded, setExpanded] = React.useState(false);
  const [isAccepted, setIsAccepted] = React.useState(false)
  const onClick = (data) => setExpanded(!expanded);

  function handleSubmitButton(data) {
    data.preventDefault();
    const element = data.target.elements;
    const obj = {};
    for (var i = 0; i < element.length; i++) {
      const item = element.item(i);
      obj[item.name] = item.value;
    }
    obj.type = type
    obj.createdAt = createdAt
    obj.accepted = isAccepted
    obj.hide = !isAccepted
    props.onSubmitPrepayment(obj)
  }


  return (
    <ExpansionTableRow onToggle={onClick} expanded={expanded}>
      <ExpansionTableRow.Summary>
        <td>{formatCash(amount)}</td>
        <td>{text}</td>
        <td>{parsedDate}</td>
      </ExpansionTableRow.Summary>
      <ExpansionTableRow.Content>
        <div className="prepayment-item-expansion-content">
          <form onSubmit={handleSubmitButton}>
            <input type="hidden" value={id} name="id" />
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="">Monto: </label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue={amount}
                  name="amount"
                  placeholder="Monto: "
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="">Fecha: </label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue={parsedDate}
                  name="date"
                  disabled
                  placeholder="Fecha"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="">Concepto: </label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue={text}
                  name="description"
                  placeholder="Concepto: "
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="">Categoría: </label>
                <select
                  name="category"
                  className="custom-select my-1 mr-sm-2"
                  id="inlineFormCustomSelectPref"
                >
                  <option defaultValue>Categoria...</option>
                  {
                    props.categories && props.categories.map(item=>(
                      <option value={item.value}>{item.label}</option>
                    ))
                  }
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col prepayment-button-container">
                <button
                  className="btn btn-danger send-prepayment-button"
                  type="submit"
                  onClick={() => setIsAccepted(false)}
                >
                  {" "}
                  Rechazar pago{" "}
                </button>
              </div>
              <div className="form-group col-md-8 prepayment-button-container">
                <button
                  className="btn btn-primary send-prepayment-button"
                  type="submit"
                  onClick={() => setIsAccepted(true)}
                >
                  Aceptar pago
                </button>
              </div>
            </div>
          </form>
          {/* <h1>${amount}</h1>
            <p>{text}</p>
            <p>{date}</p> */}
        </div>
      </ExpansionTableRow.Content>
    </ExpansionTableRow>
  );
};

export default PrePaymentItemComponent;
