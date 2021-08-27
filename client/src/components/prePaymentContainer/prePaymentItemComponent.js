import React, { useState, useRef } from "react";
import { Card, Label, Button, TextField, SingleSelect } from "emerald-ui/lib/";
import formatCash from '../../utils/formatCash';
import moment from "moment";
import Editable from '../commons/editable'

const PrePaymentItemComponent = ({ item, onSubmitPrepayment, categories }) => {
  const { _id: id, amount, text, createdAt, type } = item;
  const parsedDate = moment(createdAt).utc().format("DD MMMM YYYY");
  const [_text, setText] = useState(text);
  const [_amount, setAmount] = useState(amount);
  const [_category, setCategory] = useState('');

  const descriptionRef = useRef();

  const AcceptPayment = () => {
    onSubmitPrepayment({
      id,
      amount: _amount,
      description: _text,
      type,
      createdAt,
      accepted: true,
      hide: false,
      category: _category
    })
  }

  const RejectPayment = () => {
    onSubmitPrepayment({
      id,
      amount: _amount,
      description: _text,
      type,
      createdAt,
      accepted: false,
      hide: true,
      category: _category
    })
  }

  return (
    <Card>
      <Card.Header>
        <div>
          <h3 className="eui-card-header-title">Nuevo Pago Encontrado</h3>
        </div>
      </Card.Header>
      <div className="eui-card-body">
        <div className="eui-card-content">
          <table className="eui-card-table">
            <tbody>
              <tr>
                <td>Fecha</td>
                <td>{parsedDate}</td>
              </tr>
              <tr>
                <td>Descripción:</td>
                <td>
                  <Editable
                    className="editable"
                    text={_text}
                    type="textarea"
                    childRef={descriptionRef}
                  >
                    <TextField
                      ref={descriptionRef}
                      textarea
                      resizable
                      value={_text}
                      onChange={e => setText(e.target.value)}
                      style={{ width: '350px', height: '200px' }}
                    />
                  </Editable>
                </td>
              </tr>
              <tr>
                <td>Monto: </td>
                <td>
                  <Editable
                    text={<Label className="editable">{formatCash(_amount)}</Label>}
                    type="input"
                  >
                    <TextField
                      value={_amount}
                      type='number'
                      onChange={e => setAmount(e.target.value)}
                    />
                  </Editable>
                </td>
              </tr>
              <tr>
                <td>Categoria: </td>
                <td>
                  <SingleSelect
                    placeholder="Selecione una categoria..."
                    onSelect={(value) => setCategory(value)}
                    value={_category}
                    ariaLabel='Categories'
                  >
                    {
                      categories
                        .map(category => <option value={category._id} key={`category-${category.label}`}> {category.label}</option>)
                    }
                  </SingleSelect>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="eui-card-btn-group">
        <Button color='success' onClick={AcceptPayment}>Aceptar</Button>
        <Button color='danger' onClick={RejectPayment}>Rechazar</Button>
      </div>
    </Card>
  );
};

export default PrePaymentItemComponent;
