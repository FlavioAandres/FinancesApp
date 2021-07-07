import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal, TextField, Button, SingleSelect } from "emerald-ui/lib/";

const NewCategoryModal = ({ save, close, show, loading, }) => {
  const { handleSubmit, formState: { errors }, control, reset } = useForm();

  const onCreateCategory = ({ categoryLabel, categoryValue, categoryType }) => {
    if (categoryLabel.trim() === "" || categoryValue.trim() === "") return alert("Hey, agrega datos!");

    save({
      label: categoryLabel,
      value: categoryValue,
      type: categoryType
    })
    reset();
  }

  return (
    <Modal onHide={close} show={show}>
      <Modal.Header closeButton={true}>
        <Modal.Title>Nueva categoria</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit(onCreateCategory)}>

          <Controller
            name="categoryLabel"
            control={control}
            defaultValue=""
            rules={{ required: "This is required" }}
            render={({ field }) => (

              <TextField label="Nombre para mostrar: "
                onChange={field.onChange}
                value={field.value}
                errorMessage={errors.categoryLabel && errors.categoryLabel.message}
              />
            )}
          />

          <Controller
            name="categoryValue"
            control={control}
            defaultValue=""
            rules={{ required: "This is required", validate: value => value.indexOf(' ') === -1 }}
            render={({ field }) => (

              <TextField label="Nombre para mostrar: "
                onChange={field.onChange}
                value={field.value}
                errorMessage={errors.categoryValue && errors.categoryValue.type === 'validate' ? "This field doesn't allow spaces" : errors.categoryValue && errors.categoryValue.message}
              />
            )}
          />

          <Controller
            name="categoryType"
            control={control}
            rules={{ required: "This is required" }}
            render={({ field }) => (
              <SingleSelect
                placeholder="Select Type..."
                label="Tipo: "
                errorMessage={errors.categoryType && errors.categoryType.message}
                onSelect={field.onChange}
                value={field.value}
              >
                <option value="EXPENSE" key="expense">Egreso</option>
                <option value="INCOME" key="income">Ingreso</option>
              </SingleSelect>
            )} />

          <br />
          <Button onClick={close} shape="flat" color="info">
            Cancelar
          </Button>
          <Button type="submit" loading={loading} color="info">Crear categoria</Button>
        </form>
      </Modal.Body>
      <Modal.Footer>

      </Modal.Footer>
    </Modal>
  );
};

export default NewCategoryModal;
