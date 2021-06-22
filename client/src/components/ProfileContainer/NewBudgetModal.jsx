import React from "react";
import { Modal, TextField, Button, SingleSelect } from "emerald-ui/lib/";
import formatCash from "../../utils/formatCash";
import { API } from 'aws-amplify'

const NewBudgetModal = (props) => {
  const { categories = [] } = props
  const [categoryBudget, setCategoryBudget] = React.useState(0)
  const [typedByUserAmount, setTypedByUserAmount] = React.useState("")
  let categorySelected;

  const skipWhiteSpaces = ({ target }) => {
    const typedByUser = target.value.replace(/\D/g, '');
    const formatedString = formatCash(typedByUser)
    setCategoryBudget(formatedString.substring(0, formatedString.length - 3))
    setTypedByUserAmount(typedByUser)
  }
  const onCreateBudget = (evt) => {
    if (categoryBudget.trim() === "" || categorySelected.trim() === "")
      return alert("You must type a monthly budget amount for the category. ");
    const newBudget = {
      value: categorySelected,
      budget: typedByUserAmount
    }

    console.log(newBudget)
    //send alert
    setCategoryBudget("")
    categorySelected = null; 
  }

  return (
    <Modal onHide={props.close} show={props.show}>
      <Modal.Header closeButton={true}>
        <Modal.Title>New Budget</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form action="">
          <SingleSelect
            placeholder="Select Category..." label="Choose a category: " onSelect={(value)=>categorySelected = value}>
            {categories && categories.map((category) => (
              <option value={category.value}>{category.label}</option>
            ))}
          </SingleSelect>
          <TextField
            value={categoryBudget}
            onChange={skipWhiteSpaces}
            label="Expected Value: "
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.close} shape="flat" color="info">
          Cancelar
          </Button>
        <Button loading={props.loading} color="info" onClick={onCreateBudget}>Create Budget!</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewBudgetModal;
