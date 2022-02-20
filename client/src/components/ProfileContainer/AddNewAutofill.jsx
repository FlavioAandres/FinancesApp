import React from 'react'
import { useForm, Controller } from "react-hook-form";
import { Modal, Button, SingleSelect, TextField } from "emerald-ui/lib/";

const AddNewAutofillModal = (props)=>{
    const { handleSubmit, formState: { errors }, control, reset } = useForm();

    const onCreateAutofill = ({ category, word }) => {
      if (word.trim() === "")
        return alert("You must type a magical word to match your payments");
  
			if(word.trim().split(' ').length > 1){
				return alert('Just one magical word is allowed')
			}

      props.save({
        category,
        word
      })
      reset();
    }
    const categoriesToRender = props.categories; 
  
    return (
      <Modal onHide={props.close} show={props.show}>
        <Modal.Header closeButton={true}>
          <Modal.Title>New autofill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit(onCreateAutofill)}>
  
            <Controller
              name="category"
              control={control}
              rules={{ required: 'This field is required' }}
              render={({ field }) => (
                <SingleSelect
                  placeholder="Select Category..."
                  label="Choose a category: "
                  errorMessage={errors.category && errors.category.message}
                  onSelect={field.onChange}
                  value={field.value}
                >
                  {categoriesToRender && categoriesToRender.filter(item=>item.label).map((category) => (
                    <option
                      value={category.value}
                      key={`category-autofill-${category.label}`}
                    >
                      {category.label}
                    </option>
                  ))}
                </SingleSelect>
              )} />
  
            <Controller
              name="word"
              control={control}
              defaultValue=""
              rules={{ required: 'This field is required', min: 1 }}
              render={({ field }) => (
                <TextField
                  onChange={field.onChange}
                  value={field.value}
                  type='text'
                  errorMessage={errors.word && errors.word.message}
                  label="Expected Word: "
                />
              )} />
  
            <Button onClick={props.close} shape="flat" color="info">
              Cancelar
            </Button>
            <Button loading={props.loading} type="submit" color="info">Create Autofill Category!</Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
  
        </Modal.Footer>
      </Modal>
    );
}

export default AddNewAutofillModal