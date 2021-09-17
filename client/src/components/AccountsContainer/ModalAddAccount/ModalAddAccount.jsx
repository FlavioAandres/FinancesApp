import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal, TextField, Button, SingleSelect } from "emerald-ui/lib/";

const NewAccountModal = ({ save, close, loading, show }) => {
    const { handleSubmit, formState: { errors }, control, reset } = useForm();


    const onCreateAccount = ({ name, number, value, type }) => {
        save({
            name,
            number,
            value,
            type
        })
        reset();
    }

    return (
        <Modal onHide={close} show={show}>
            <Modal.Header closeButton={true}>
                <Modal.Title>Nueva Cuenta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit(onCreateAccount)}>

                    <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        rules={{ required: "This is required" }}
                        render={({ field }) => (

                            <TextField label="Name: "
                                onChange={field.onChange}
                                value={field.value}
                                errorMessage={errors.name && errors.name.message}
                            />
                        )}
                    />

                    <Controller
                        name="number"
                        control={control}
                        defaultValue=""
                        rules={{ required: "This is required", min: 0 }}
                        render={({ field }) => (

                            <TextField label="Account Number: "
                                onChange={field.onChange}
                                value={field.value}
                                type='number'
                                errorMessage={errors.number && errors.number.message}
                            />
                        )}
                    />

                    <Controller
                        name="value"
                        control={control}
                        defaultValue=""
                        rules={{ required: "This is required", min: 1 }}
                        render={({ field }) => (

                            <TextField label="Value: "
                                onChange={field.onChange}
                                value={field.value}
                                type='number'
                                step="0.01"
                                errorMessage={errors.value && errors.value.message}
                            />
                        )}
                    />


                    <Controller
                        name="type"
                        control={control}
                        rules={{ required: "This is required" }}
                        render={({ field }) => (
                            <SingleSelect
                                placeholder="Select a Type..."
                                label="type"
                                errorMessage={errors.type && errors.type.message}
                                onSelect={field.onChange}
                                value={field.value}
                            >
                                <option value='FIDUCUENTA' key={`category-FIDUCUENTA`}> FIDUCUENTA</option>
                                <option value='CREDIT_ACCOUNT' key={`category-CREDIT_ACCOUNT`}> CREDITO</option>
                                <option value='DEBT_ACCOUNT' key={`category-DEBT_ACCOUNT`}> DEUDA</option>
                                <option value='DEBIT_ACCOUNT' key={`category-DEBIT_ACCOUNT`}> DEBITO </option>

                            </SingleSelect>
                        )} />


                    <br />
                    <Button onClick={close} shape="flat" color="info">
                        Cancelar
                    </Button>
                    <Button loading={loading} color="info" type="submit">Crear Cuenta</Button>
                </form>
            </Modal.Body>
            <Modal.Footer>

            </Modal.Footer>
        </Modal>
    );
};

export default NewAccountModal;
