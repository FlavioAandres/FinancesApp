import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal, TextField, Button, SingleSelect } from "emerald-ui/lib/";

const NewIncomeModal = ({ save, categories, close, loading, show }) => {
    const { handleSubmit, formState: { errors }, control, reset } = useForm();


    const onCreateIncome = ({ source, amount, category, description }) => {
        if (source.trim() === "" || amount.trim() === "" || category.trim() === "") return alert("Hey, agrega datos!");
        save({
            source,
            amount,
            category,
            description
        })
        reset();
    }

    return (
        <Modal onHide={close} show={show}>
            <Modal.Header closeButton={true}>
                <Modal.Title>Nuevo Pago</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit(onCreateIncome)}>

                    <Controller
                        name="source"
                        control={control}
                        defaultValue=""
                        rules={{ required: "This is required" }}
                        render={({ field }) => (

                            <TextField label="Source: "
                                onChange={field.onChange}
                                value={field.value}
                                errorMessage={errors.source && errors.source.message}
                            />
                        )}
                    />

                    <Controller
                        name="amount"
                        control={control}
                        defaultValue=""
                        rules={{ required: "This is required", min: 0 }}
                        render={({ field }) => (

                            <TextField label="Amount: "
                                onChange={field.onChange}
                                value={field.value}
                                type='number'
                                step="0.01"
                                errorMessage={errors.amount && errors.amount.message}
                            />
                        )}
                    />


                    <Controller
                        name="description"
                        control={control}
                        defaultValue=""
                        rules={{ required: "This is required" }}
                        render={({ field }) => (

                            <TextField label="Description: "
                                onChange={field.onChange}
                                value={field.value}
                                errorMessage={errors.description && errors.description.message}
                            />
                        )}
                    />

                    <Controller
                        name="category"
                        control={control}
                        rules={{ required: "This is required" }}
                        render={({ field }) => (
                            <SingleSelect
                                placeholder="Select Category..."
                                label="Categoria"
                                errorMessage={errors.category && errors.category.message}
                                onSelect={field.onChange}
                                value={field.value}
                            >
                                <option value='INCOME' key={`category-INCOME`}> INCOME</option>
                                {
                                    categories
                                        .filter(category => category.type === 'INCOME')
                                        .map(category => <option value={category.value} key={`category-${category.label}`}> {category.label}</option>)
                                }
                            </SingleSelect>
                        )} />


                    <br />
                    <Button onClick={close} shape="flat" color="info">
                        Cancelar
                    </Button>
                    <Button loading={loading} color="info" type="submit">Crear Ingreso</Button>
                </form>
            </Modal.Body>
            <Modal.Footer>

            </Modal.Footer>
        </Modal>
    );
};

export default NewIncomeModal;
