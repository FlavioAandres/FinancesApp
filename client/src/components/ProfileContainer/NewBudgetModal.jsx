import React from "react";
import { useForm, Controller } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { Modal, Button, SingleSelect, TextField } from "emerald-ui/lib/";
import formatCash from "../../utils/formatCash";
import { API } from 'aws-amplify'
import moment from "moment";

const NewBudgetModal = ({ categories = [], close, show, loading }) => {
  const { handleSubmit, formState: { errors }, control } = useForm();


  const skipWhiteSpaces = ({ target }) => {
    const typedByUser = target.value.replace(/\D/g, '');
    const formatedString = formatCash(typedByUser)

  }

  const onCreateBudget = (data) => {
    console.log(data)
    // if (categoryBudget.trim() === "" || categorySelected.trim() === "")
    //   return alert("You must type a monthly budget amount for the category. ");

    // const date = moment();
    // const newBudget = {
    //   value: categorySelected,
    //   budget: typedByUserAmount,
    //   year: date.year(),
    //   month: date.month()
    // }

    // console.log(newBudget)
    // //send alert
    // setCategoryBudget("")
    // categorySelected = null;
  }


  return (
    <Modal onHide={close} show={show}>
      <Modal.Header closeButton={true}>
        <Modal.Title>New Budget</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit(onCreateBudget)}>

          <Controller
            name="category"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <SingleSelect
                placeholder="Select Category..."
                label="Choose a category: "
                errorMessage={errors.category && errors.category.message}
                onSelect={field.onChange}
                value={field.value}
              >
                {categories && categories.map((category) => (
                  <option
                    value={category.value}
                    key={`category-${category.label}`}
                  >
                    {category.label}
                  </option>
                ))}
              </SingleSelect>
            )} />

          <Controller
            name="budget"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                onChange={field.onChange}
                value={field.value}
                errorMessage={errors.budget && errors.budget.message}
                label="Expected Value: "
              />
            )} />

          <Button onClick={close} shape="flat" color="info">
            Cancelar
          </Button>
          <Button loading={loading} type="submit" color="info">Create Budget!</Button>
        </form>
        <DevTool control={control} />
      </Modal.Body>
      <Modal.Footer>

      </Modal.Footer>
    </Modal>
  );
};

export default NewBudgetModal;
